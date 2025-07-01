import { NextResponse, type NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Transaction from "@/lib/models/transaction"
import Account from "@/lib/models/account"
import { verifyToken } from "@/lib/auth"
import { findIncomingTransactionToAddress } from "@/lib/blockchain"

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  await connectDB()

  // Authenticate
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

  const { id } = await context.params
  const { searchParams } = new URL(req.url)
  const currency = searchParams.get("currency") as "BTC" | "USDT"
  const minAmount = Number.parseFloat(searchParams.get("minAmount") || "0")

  if (!id || !currency) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  try {
    // Find the transaction
    const transaction = await Transaction.findById(id)
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found", status: "failed" }, { status: 404 })
    }

    // Check if transaction is already confirmed
    if (transaction.status === "completed") {
      return NextResponse.json({ status: "confirmed", txHash: transaction.txHash })
    }

    // Check if transaction is already marked as failed
    if (transaction.status === "failed") {
      return NextResponse.json({ status: "failed" })
    }

    // Check if transaction is too old (more than 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    if (transaction.initiatedAt < thirtyMinutesAgo && transaction.status === "pending") {
      // Mark as failed if it's been pending for too long
      transaction.status = "failed"
      await transaction.save()
      return NextResponse.json({ status: "failed" })
    }

    // Verify the transaction on the blockchain
    const blockchainTx = await findIncomingTransactionToAddress(transaction.address, minAmount, currency)

    if (blockchainTx) {
      // Update transaction status
      transaction.status = "completed"
      transaction.txHash = blockchainTx.txHash
      transaction.amount = blockchainTx.amount
      transaction.completedAt = new Date(blockchainTx.timestamp)
      await transaction.save()

      // Update user's account balance
      const account = await Account.findOneAndUpdate(
        { user: payload.id },
        {
          $inc: { [`balances.${currency}`]: blockchainTx.amount },
          $push: {
            portfolioHistory: {
              date: new Date(),
              totalValue: blockchainTx.amount * (currency === "BTC" ? 30000 : 1), // Simple conversion
              btcValue: currency === "BTC" ? blockchainTx.amount * 30000 : 0,
              usdtValue: currency === "USDT" ? blockchainTx.amount : 0,
              usdValue: 0,
              investmentsValue: 0,
            },
          },
        },
        { new: true, upsert: true },
      )
      account.save()

      return NextResponse.json({ status: "confirmed", txHash: blockchainTx.txHash })
    }

    return NextResponse.json({ status: "pending" })
  } catch (error) {
    console.error("Error verifying transaction:", error)
    return NextResponse.json({ error: "Failed to verify transaction", status: "failed" }, { status: 500 })
  }
}
