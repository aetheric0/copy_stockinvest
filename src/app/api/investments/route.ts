import { NextResponse, type NextRequest } from "next/server"
import connectDB from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { createInvestment, getAccountSummary, updateInvestments } from "@/lib/services/investment-service"

export async function POST(req: NextRequest) {
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
  

  // Parse body
  const { transactionId, planName, amount, currency } = await req.json()
  if (!transactionId || !planName || !amount || !currency) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  try {
    const investment = await createInvestment({
      userId: payload.id,
      transactionId,
      planName,
      amount,
      currency,
    })

    if (!investment) {
      return NextResponse.json({ error: "Failed to create investment" }, { status: 500 })
    }

    return NextResponse.json(investment, { status: 201 })
  } catch (error) {
    console.error("Error creating investment:", error)
    return NextResponse.json({ error: "Failed to create investment" }, { status: 500 })
  }
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

  try {
    // Update investments first
    await updateInvestments(payload.id)

    // Get account summary
    const summary = await getAccountSummary(payload.id)
    return NextResponse.json(summary, { status: 200 })
  } catch (error) {
    console.error("Error fetching investments:", error)
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 })
  }
}
