// lib/api/market.ts
import { toast } from "sonner"

export interface CryptoData {
  id: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  symbol: string
  image?: string
  price_change_24h: number
  market_cap: number
  total_volume: number
}

export async function fetchMarketData(): Promise<CryptoData[]> {
  try {
    const response = await fetch("/api/market-data", {
      next: { revalidate: 60 }, // Revalidate every minute at most
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching market data:", error)
    toast.error( "Error fetching market data", {
      description: "Could not retrieve the latest market information",
    })
    return []
  }
}
