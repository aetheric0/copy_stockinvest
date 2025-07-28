import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Transaction from "@/lib/models/transaction"
import Account from "@/lib/models/account"
import { verifyToken } from "@/lib/auth"
import { findIncomingTransactionToAddress } from "@/lib/blockchain"


// ✅ this is the correct signature for dynamic routes in App Router
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  await connectDB()

  const { id } = context.params
  const cookie = req.cookies.get("authToken")?.value
  if (!cookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload
  try {
    payload = verifyToken(cookie)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const currency = searchParams.get("currency") as "BTC" | "USDT"
  const minAmount = Number.parseFloat(searchParams.get("minAmount") || "0")

  if (!id || !currency) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  try {
    const transaction = await Transaction.findById(id)
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found", status: "failed" },
        { status: 404 }
      )
    }

    if (transaction.status === "completed") {
      return NextResponse.json({ status: "confirmed", txHash: transaction.txHash })
    }

    if (transaction.status === "failed") {
      return NextResponse.json({ status: "failed" })
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    if (transaction.initiatedAt < thirtyMinutesAgo && transaction.status === "pending") {
      transaction.status = "failed"
      await transaction.save()
      return NextResponse.json({ status: "failed" })
    }

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

      await Account.findOneAndUpdate(
        { user: payload.id },
        {
          $inc: { [`balances.${currency}`]: blockchainTx.amount },
          $push: {
            portfolioHistory: {
              date: new Date(),
              totalValue:
                blockchainTx.amount * (currency === "BTC" ? 30000 : 1),
              btcValue: currency === "BTC" ? blockchainTx.amount * 30000 : 0,
              usdtValue: currency === "USDT" ? blockchainTx.amount : 0,
              usdValue: 0,
              investmentsValue: 0,
            },
          },
        },
        { new: true, upsert: true }
      )

      return NextResponse.json({ status: "confirmed", txHash: blockchainTx.txHash })
    }

    return NextResponse.json({ status: "pending" })
  } catch (error) {
    console.error("Error verifying transaction:", error)
    return NextResponse.json(
      { error: "Failed to verify transaction", status: "failed" },
      { status: 500 }
    )
  }
}
