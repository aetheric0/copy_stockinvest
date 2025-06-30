import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Account from "@/lib/models/account"
import { updateInvestments } from "@/lib/services/investment-service"

// This endpoint is meant to be called by a cron job to update all investments
// It should be protected in production with a secret key or other authentication
export async function GET(req: Request) {
  // Check for authorization (in production, use a proper auth mechanism)
  const url = new URL(req.url)
  const authKey = url.searchParams.get("key")

  // Simple auth check - replace with a proper solution in production
  if (authKey !== process.env.CRON_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    // Get all accounts
    const accounts = await Account.find({})

    // Update investments for each account
    const results = await Promise.all(
      accounts.map(async (account) => {
        const userId = account.user.toString()
        const success = await updateInvestments(userId)
        return { userId, success }
      }),
    )

    // Count successes and failures
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      message: "Investment update completed",
      total: results.length,
      success: successCount,
      failed: failureCount,
    })
  } catch (error) {
    console.error("Error updating investments:", error)
    return NextResponse.json({ error: "Failed to update investments" }, { status: 500 })
  }
}
