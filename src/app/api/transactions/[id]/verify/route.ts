// app/api/users/[id]/route.ts

import { NextResponse, type NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Transaction from "@/lib/models/transaction"
import Account from "@/lib/models/account"
import { verifyToken } from "@/lib/auth"
import { findIncomingTransactionToAddress } from "@/lib/blockchain"



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{id: string}>}       // ← inline annotation
): Promise<NextResponse> {
  await connectDB()

  // 1) Strongly-typed dynamic segment
  const { id } = await params

  // 2) Read cookies (note the await here!)
  const token = request.cookies.get("authToken")?.value
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 3) Verify JWT
  let payload
  try {
    payload = verifyToken(token)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 4) Parse & validate query parameters
  const url = new URL(request.url)
  const currencyParam = url.searchParams.get("currency")
  if (!currencyParam || !["BTC", "USDT"].includes(currencyParam)) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }
  const currency = currencyParam as "BTC" | "USDT"
  const minAmount = parseFloat(url.searchParams.get("minAmount") ?? "0")

  try {
    // 5) Fetch the transaction
    const transaction = await Transaction.findById(id)
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found", status: "failed" },
        { status: 404 }
      )
    }

    // 6) Early-exit for completed or failed
    if (transaction.status === "completed") {
      return NextResponse.json(
        { status: "confirmed", txHash: transaction.txHash },
        { status: 200 }
      )
    }
    if (transaction.status === "failed") {
      return NextResponse.json({ status: "failed" }, { status: 200 })
    }

    // 7) Expire stale pendings
    const cutoff = Date.now() - 30 * 60 * 1_000
    if (
      transaction.initiatedAt.getTime() < cutoff &&
      transaction.status === "pending"
    ) {
      transaction.status = "failed"
      await transaction.save()
      return NextResponse.json({ status: "failed" }, { status: 200 })
    }

    // 8) Check blockchain for incoming funds
    const blockchainTx = await findIncomingTransactionToAddress(
      transaction.address,
      minAmount,
      currency
    )
    if (blockchainTx) {
      transaction.status = "completed"
      transaction.txHash = blockchainTx.txHash
      transaction.amount = blockchainTx.amount
      transaction.completedAt = new Date(blockchainTx.timestamp)
      await transaction.save()

      // 9) Update user balances & history
      await Account.findOneAndUpdate(
        { user: payload.id },
        {
          $inc: { [`balances.${currency}`]: blockchainTx.amount },
          $push: {
            portfolioHistory: {
              date: new Date(),
              totalValue:
                blockchainTx.amount * (currency === "BTC" ? 30000 : 1),
              btcValue:
                currency === "BTC"
                  ? blockchainTx.amount * 30000
                  : 0,
              usdtValue:
                currency === "USDT"
                  ? blockchainTx.amount
                  : 0,
              usdValue: 0,
              investmentsValue: 0,
            },
          },
        },
        { new: true, upsert: true }
      )

      return NextResponse.json(
        { status: "confirmed", txHash: blockchainTx.txHash },
        { status: 200 }
      )
    }

    // 10) Still pending
    return NextResponse.json({ status: "pending" }, { status: 200 })
  } catch (error) {
    console.error("Error verifying transaction:", error)
    return NextResponse.json(
      { error: "Failed to verify transaction", status: "failed" },
      { status: 500 }
    )
  }
}
