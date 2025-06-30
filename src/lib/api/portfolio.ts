import { toast } from "sonner"

export interface PortfolioSummary {
  totalValue: number
  balances: {
    BTC: number
    USDT: number
    USD: number
  }
  activeInvestments: Array<{
    id: string
    planName: string
    amount: number
    currency: string
    startDate: string
    endDate: string
    status: string
    initialValue: number
    currentValue: number
    targetValue: number
    lastUpdated: string
    dailyGrowthRate: number
    history: Array<{
      date: string
      value: number
    }>
  }>
  completedInvestments: Array<{
    id: string
    planName: string
    amount: number
    currency: string
    startDate: string
    endDate: string
    status: string
    initialValue: number
    currentValue: number
    targetValue: number
    lastUpdated: string
    dailyGrowthRate: number
    history: Array<{
      date: string
      value: number
    }>
  }>
  portfolioHistory: Array<{
    date: string
    totalValue: number
    btcValue: number
    usdtValue: number
    usdValue: number
    investmentsValue: number
  }>
}

export async function fetchPortfolioData(): Promise<PortfolioSummary | null> {
  try {
    const response = await fetch("/api/investments", {
      credentials: 'include',
      next: { revalidate: 60 }, // Revalidate every minute at most
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching portfolio data:", error)
    toast.error("Error fetching portfolio data", {
      description: "Could not retrieve your portfolio information",
    })
    return null
  }
}

export async function createNewInvestment(params: {
  transactionId: string
  planName: string
  amount: number
  currency: "BTC" | "USDT" | "USD"
}): Promise<boolean> {
  try {
    const response = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create investment")
    }

    toast.success( "Investment Created", {
      description: `Your ${params.planName} investment has been created successfully`,
    })
    return true
  } catch (error) {
    console.error("Error creating investment:", error)
    toast.error("Investment Failed", {
      description: error instanceof Error ? error.message : "Could not create investment",
    })
    return false
  }
}
