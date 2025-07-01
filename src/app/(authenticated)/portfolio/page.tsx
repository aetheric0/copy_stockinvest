"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, BarChart, Calendar, Filter } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import PortfolioChart from "@/components/portfolio-chart"
import { fetchPortfolioData, type PortfolioSummary } from "@/lib/api/portfolio"
import { Skeleton } from "@/components/ui/skeleton"

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPortfolioData = async () => {
      setLoading(true)
      try {
        const data = await fetchPortfolioData()
        if (data) {
          setPortfolioData(data)
        }
      } catch (error) {
        console.error("Failed to load portfolio data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPortfolioData()
    // Refresh data every minute
    const interval = setInterval(loadPortfolioData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate asset allocation from portfolio data
  const calculateAssetAllocation = () => {
    if (!portfolioData) return []

    const { balances, activeInvestments, completedInvestments } = portfolioData
    const totalValue = portfolioData.totalValue || 0

    // Calculate BTC value
    const btcValue = balances.BTC * 30000 // Assuming 1 BTC = $30,000
    const btcAllocation = totalValue > 0 ? (btcValue / totalValue) * 100 : 0

    // Calculate USDT value
    const usdtValue = balances.USDT
    const usdtAllocation = totalValue > 0 ? (usdtValue / totalValue) * 100 : 0

    // Calculate USD value
    const usdValue = balances.USD
    const usdAllocation = totalValue > 0 ? (usdValue / totalValue) * 100 : 0

    // Calculate investments value
    const investmentsValue = [...activeInvestments, ...completedInvestments].reduce(
      (total, inv) => total + inv.currentValue,
      0,
    )
    const investmentsAllocation = totalValue > 0 ? (investmentsValue / totalValue) * 100 : 0

    return [
      {
        name: "Bitcoin",
        symbol: "BTC",
        value: btcValue,
        allocation: btcAllocation,
        change24h: 2.8, // Mock data
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      },
      {
        name: "Tether",
        symbol: "USDT",
        value: usdtValue,
        allocation: usdtAllocation,
        change24h: 0.1, // Mock data
        image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
      },
      {
        name: "USD",
        symbol: "USD",
        value: usdValue,
        allocation: usdAllocation,
        change24h: 0.0, // Mock data
        image: "/placeholder.svg?height=32&width=32",
      },
      {
        name: "Investments",
        symbol: "INV",
        value: investmentsValue,
        allocation: investmentsAllocation,
        change24h: 1.5, // Mock data
        image: "/placeholder.svg?height=32&width=32",
      },
    ].filter((asset) => asset.value > 0)
  }

  const assets = calculateAssetAllocation()

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
  const latestValue = portfolioData?.portfolioHistory?.at(-1)?.totalValue ?? 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <PortfolioChart
          portfolioHistory={portfolioData?.portfolioHistory || []}
          totalValue={latestValue}
          change24h={change24h}
          changeValue={changeValue}
        />

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Asset Allocation</h3>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets.map((asset) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={asset.image || "/placeholder.svg"}
                      alt={asset.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${asset.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">{asset.allocation.toFixed(1)}%</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Asset Distribution</span>
                <div className="flex -space-x-2">
                  {assets.map((asset) => (
                    <div
                      key={asset.symbol}
                      className="w-6 h-6 rounded-full border-2 border-background overflow-hidden"
                      style={{ zIndex: 1 }}
                    >
                      <Image src={asset.image || "/placeholder.svg"} alt={asset.name} width={24} height={24} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden flex">
                {assets.map((asset, index) => (
                  <div
                    key={asset.symbol}
                    className="h-full"
                    style={{
                      width: `${asset.allocation}%`,
                      backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Performance by Asset</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <BarChart className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <Card key={asset.symbol} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={asset.image || "/placeholder.svg"}
                        alt={asset.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${asset.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div
                        className={cn(
                          "text-xs flex items-center justify-end",
                          asset.change24h >= 0 ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {asset.change24h >= 0 ? "↑" : "↓"} {Math.abs(asset.change24h)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-[100px] bg-muted/30 flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
