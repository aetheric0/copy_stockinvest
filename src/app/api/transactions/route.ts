import { NextResponse, type NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Transaction from "@/lib/models/transaction"
import { verifyToken } from "@/lib/auth"
import type { ITransaction } from "@/lib/models/transaction"
import type { FilterQuery } from "mongoose"

export async function POST(req: NextRequest) {
  await connectDB()

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
  await Transaction.updateMany(
    { status: "pending", initiatedAt: { $lt: thirtyMinutesAgo } },
    { status: "failed" }
  )

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

  // Parse body
  const { amount, currency, toAddress, type = "deposit" } = await req.json()
  if (amount == null || !currency || !toAddress) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  // Create record
  const tx = await Transaction.create({
    user: payload.id,
    address: toAddress,
    amount: Math.abs(amount), // Store as positive
    currency,
    status: "pending",
    type: type,
    initiatedAt: new Date(),
  })

  return NextResponse.json({ _id: tx._id.toString() }, { status: 201 })
}

export async function GET(req: NextRequest) {
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

  // Get query parameters
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") // Can be 'deposit', 'withdrawal', or null for all

  // Build query
  const query: FilterQuery<ITransaction> = { user: payload.id }
  if (type === "deposit" || type === "withdrawal") {
    query.type = type
  }

  // Fetch transactions for the user
  const transactions = await Transaction.find(query).sort({ createdAt: -1 })

  // Transform to client-friendly format
  const formattedTransactions = transactions.map((tx) => ({
    id: tx._id.toString(),
    type: tx.type,
    amount: tx.amount,
    currency: tx.currency,
    date: tx.createdAt.toISOString(),
    status: tx.status,
    address: tx.address,
    txHash: tx.txHash || "",
    description: tx.description || (tx.type === "deposit" ? "Deposit" : "Withdrawal"),
  }))

  return NextResponse.json(formattedTransactions, { status: 200 })
}
