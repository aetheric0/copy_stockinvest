// src/lib/services/investment-service.ts

import { v4 as uuidv4 } from "uuid"
import Account from "@/lib/models/account"
import Transaction from "@/lib/models/transaction"
import { PLANS, type Plan } from "@/types/plan"

/** Fixed USD rates for simplicity */
const currencyRates = {
  BTC: 30000,
  USDT: 1,
  USD: 1,
}

export interface CreateInvestmentParams {
  userId: string
  transactionId: string
  planName: string
  amount: number
  currency: "BTC" | "USDT" | "USD"
}

export interface InvestmentData {
  id: string
  planName: string
  amount: number
  currency: string
  startDate: Date
  endDate: Date
  status: "active" | "completed" | "cancelled"
  initialValue: number
  currentValue: number
  targetValue: number
  lastUpdated: Date
  dailyGrowthRate: number
  history: Array<{ date: Date; value: number }>
}

/** 1) Calculate an investment’s numbers */
function calculateInvestmentDetails(plan: Plan, amount: number, currency: string): InvestmentData {
  const amountInUSD = amount * currencyRates[currency as keyof typeof currencyRates]
  const roiPct = parseFloat(plan.bonus.replace(/[^0-9.]/g, "")) / 100
  const durationDays = parseInt(plan.duration, 10)
  const targetValue = amountInUSD * (1 + roiPct)
  const dailyGrowth = Math.pow(1 + roiPct, 1 / durationDays) - 1
  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + durationDays)

  return {
    id: uuidv4(),
    planName: plan.name,
    amount,
    currency,
    startDate: now,
    endDate: end,
    status: "active",
    initialValue: amountInUSD,
    currentValue: amountInUSD,
    targetValue,
    lastUpdated: now,
    dailyGrowthRate: dailyGrowth,
    history: [{ date: now, value: amountInUSD }],
  }
}

/** 2) Create an investment record (Account **must** already exist) */
export async function createInvestment({
  userId,
  transactionId,
  planName,
  amount,
  currency,
}: CreateInvestmentParams): Promise<InvestmentData | null> {
  try {
    // verify plan
    const plan = PLANS.find((p) => p.name === planName)
    if (!plan) throw new Error(`Plan ${planName} not found`)

    // verify transaction
    const tx = await Transaction.findById(transactionId)
    if (!tx || tx.user.toString() !== userId || tx.status !== "completed") {
      throw new Error("Transaction invalid or not completed")
    }

    // calculate the numbers
    const inv = calculateInvestmentDetails(plan, amount, currency)

    // account MUST exist (we upsert on deposit)
    const account = await Account.findOne({ user: userId })
    if (!account) throw new Error("Account not found; please deposit first")

    // append the investment
    account.investments.push(inv)

    // also snapshot a new history point
    const btcVal = (account.balances.BTC || 0) * currencyRates.BTC
    const usdtVal = (account.balances.USDT || 0) * currencyRates.USDT
    const usdVal = account.balances.USD || 0
    const investVal = inv.initialValue
    account.portfolioHistory.push({
      date: new Date(),
      totalValue: btcVal + usdtVal + usdVal + investVal,
      btcValue: btcVal,
      usdtValue: usdtVal,
      usdValue: usdVal,
      investmentsValue: investVal,
    })

    await account.save()
    return inv
  } catch (err) {
    console.error("Error creating investment:", err)
    return null
  }
}

/** 3) Periodically re‐calculate active investments and push history */
export async function updateInvestments(userId: string): Promise<boolean> {
  try {
    const account = await Account.findOne({ user: userId })
    if (!account) return false

    let investmentsValue = 0
    // update each active investment
    for (const inv of account.investments) {
      if (inv.status === "active") {
        const now = new Date()
        const hours = (now.getTime() - inv.lastUpdated.getTime()) / 36e5
        if (hours >= 1) {
          const factor = Math.pow(1 + inv.dailyGrowthRate, hours / 24)
          let newVal = inv.currentValue * factor
          if (now >= inv.endDate) {
            newVal = inv.targetValue
            inv.status = "completed"
          }
          inv.currentValue = Math.min(newVal, inv.targetValue)
          inv.lastUpdated = now
          if (hours >= 24) inv.history.push({ date: now, value: inv.currentValue })
        }
      }
      investmentsValue += inv.currentValue
    }

    // compute balances into USD
    const btcValue = (account.balances.BTC || 0) * currencyRates.BTC
    const usdtValue = (account.balances.USDT || 0) * currencyRates.USDT
    const usdValue = account.balances.USD || 0
    const total = btcValue + usdtValue + usdValue + investmentsValue

    // push a sanitized history entry
    account.portfolioHistory.push({
      date: new Date(),
      totalValue: Number.isFinite(total) ? total : 0,
      btcValue,
      usdtValue,
      usdValue,
      investmentsValue,
    })

    await account.save()
    return true
  } catch (err) {
    console.error("Error updating investments:", err)
    return false
  }
}

/** 4) Fetch summary for the API GET `/api/investments` */
export async function getAccountSummary(userId: string) {
  // ensure we’ve updated before reading
  await updateInvestments(userId)

  const account = await Account.findOne({ user: userId })
  if (!account) {
    return {
      totalValue: 0,
      balances: { BTC: 0, USDT: 0, USD: 0 },
      activeInvestments: [],
      completedInvestments: [],
      portfolioHistory: [],
    }
  }

  const btcValue = account.balances.BTC * currencyRates.BTC
  const usdtValue = account.balances.USDT * currencyRates.USDT
  const usdValue = account.balances.USD

  const active = account.investments.filter((i: InvestmentData) => i.status === "active")
  const completed = account.investments.filter((i: InvestmentData) => i.status === "completed")
  const totalValue = btcValue + usdtValue + usdValue + active.reduce((sum: number, i: InvestmentData) => sum + i.currentValue, 0)

  return {
    totalValue,
    balances: account.balances,
    activeInvestments: active,
    completedInvestments: completed,
    portfolioHistory: account.portfolioHistory.slice(-30),
  }
}
