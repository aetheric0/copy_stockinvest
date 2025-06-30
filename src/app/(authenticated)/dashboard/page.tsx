"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ArrowUpRight, Wallet } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import QuickActionMenu from "@/components/quick-action-menu"
import { fetchMarketData, type CryptoData } from "@/lib/api/market"
import { fetchPortfolioData, type PortfolioSummary } from "@/lib/api/portfolio"
import PortfolioChart from "@/components/portfolio-chart"
import MarketRow from "@/components/MarketRow"

export default function DashboardPage() {
  const [marketData, setMarketData] = useState<CryptoData[]>([])
  const [portfolioData, setPortfolioData] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (coinId: string) => {
  setFavorites((prev) =>
    prev.includes(coinId) ? prev.filter((id) => id !== coinId) : [...prev, coinId]
  )
}


  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        const [market, portfolio] = await Promise.all([fetchMarketData(), fetchPortfolioData()])

        if (isMounted) {
          setMarketData(market || [])
          setPortfolioData(portfolio)
          setError(null)
        }
      } catch (error) {
        if (isMounted) {
          setError(`Failed to load latest data. Showing cached information.`)
          console.error("Error: ", error)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Fetch every 30 seconds
    return () => {
      isMounted = false
      clearInterval(interval)
      controller.abort()
    }
  }, [])

  // Calculate 24h change
  const calculateChange = () => {
    if (!portfolioData || !portfolioData.portfolioHistory || portfolioData.portfolioHistory.length < 2) {
      return { change24h: 0, changeValue: 0 }
    }

    const history = portfolioData.portfolioHistory
    const currentValue = history[history.length - 1].totalValue

    // Find value from 24h ago or the oldest available value if history is shorter
    let previousValue = currentValue
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    for (let i = history.length - 2; i >= 0; i--) {
      const entryDate = new Date(history[i].date)
      if (entryDate <= oneDayAgo) {
        previousValue = history[i].totalValue
        break
      }
    }

    const changeValue = currentValue - previousValue
    const change24h = previousValue > 0 ? (changeValue / previousValue) * 100 : 0

    return { change24h, changeValue }
  }

  const { change24h, changeValue } = calculateChange()
  console.log('PortfolioData', portfolioData)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-yellow-100 border boerder-yellow-200 rounded-lg">⚠️ {error}</div>}
      {/* Section 1: Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-2">
          {/* <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Portfolio Value</h3>
              <div className="text-3xl font-bold">
                ${(portfolioData?.totalValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className={cn("flex items-center", change24h >= 0 ? "text-green-500" : "text-red-500")}>
                {change24h >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : "↓"}
                {Math.abs(change24h).toFixed(2)}% (24h)
              </div>
            </div>
            <Wallet className="w-8 h-8 text-primary" />
          </CardHeader> */}
          <CardContent>
            <PortfolioChart
              portfolioHistory={portfolioData?.portfolioHistory || []}
              totalValue={portfolioData?.totalValue || 0}
              change24h={change24h}
              changeValue={changeValue}
              isLoading={loading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Asset Allocation</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketData
              .slice(0, 6)
              .filter((coin) => coin.symbol.toUpperCase() !== "USDT")
              .map((coin) => {
                const isPositive = coin.price_change_percentage_24h >= 0
                return (
                  <div key={coin.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {coin.image && (
                        <div className="shrink-0">
                          <Image
                            src={coin.image || "/placeholder.svg"}
                            alt={coin.name}
                            width={32}
                            height={32}
                            className="rounded-full object-contain"
                            unoptimized
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <span className="align-middle">
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={coin.price_change_percentage_24h}
                        initial={{ y: isPositive ? 10 : -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "font-mono flex items-center gap-1",
                          isPositive ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {isPositive ? "↑" : "↓"}
                        {coin.price_change_percentage_24h.toFixed(1)}%
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Quick Actions */}
      <QuickActionMenu />

      {/* Section 3: Market Overview */}
      <Card>
        <CardHeader className="flex flex-col justify-between sm:flex-row gap-2">
          <h3 className="text-lg font-semibold">Market Overview</h3>
          {/* Live Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-green-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE PRICES
            </div>
            <span className="text-xs text-muted-foreground">Updated every 30 seconds</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.slice(0, 10).map((coin) => (
            <MarketRow
              key={coin.id}
              coin={coin}
              toggleFavorite={toggleFavorite}
              isFavorite={favorites.includes(coin.id)}
            />
          ))}
          </div>
      </CardContent>
      </Card>
    </div>
  )
}
