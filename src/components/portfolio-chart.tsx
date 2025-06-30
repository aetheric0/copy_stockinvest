"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format, subDays, parseISO } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PortfolioChartProps {
  portfolioHistory: Array<{
    date: string
    totalValue: number
    btcValue: number
    usdtValue: number
    usdValue: number
    investmentsValue: number
  }>
  totalValue: number
  change24h?: number
  changeValue?: number
  isLoading?: boolean
}

export default function PortfolioChart({
  portfolioHistory = [],
  totalValue = 0,
  change24h = 0,
  changeValue = 0,
  isLoading = false,
}: PortfolioChartProps) {
  const [timeframe, setTimeframe] = useState("1W")
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (portfolioHistory.length === 0) return

    // Process the data based on the selected timeframe
    const now = new Date()
    let filteredData: any[] = []

    switch (timeframe) {
      case "1D":
        filteredData = portfolioHistory.filter((entry) => parseISO(entry.date) >= subDays(now, 1))
        break
      case "1W":
        filteredData = portfolioHistory.filter((entry) => parseISO(entry.date) >= subDays(now, 7))
        break
      case "1M":
        filteredData = portfolioHistory.filter((entry) => parseISO(entry.date) >= subDays(now, 30))
        break
      case "1Y":
        filteredData = portfolioHistory.filter((entry) => parseISO(entry.date) >= subDays(now, 365))
        break
      default:
        filteredData = portfolioHistory
    }

    // If we don't have enough data points, generate some based on the available data
    if (filteredData.length < 2) {
      const lastValue =
        portfolioHistory.length > 0 ? portfolioHistory[portfolioHistory.length - 1].totalValue : totalValue
      const startValue = lastValue * 0.95 // Assume 5% less at the start of the period

      // Generate synthetic data points
      filteredData = generateSyntheticData(timeframe, startValue, lastValue)
    }

    // Format the data for the chart
    const formattedData = filteredData.map((entry) => ({
      date: format(parseISO(entry.date), "MMM dd"),
      Total: entry.totalValue,
      BTC: entry.btcValue,
      USDT: entry.usdtValue,
      USD: entry.usdValue,
      Investments: entry.investmentsValue,
    }))

    setChartData(formattedData)
  }, [portfolioHistory, timeframe, totalValue])

  // Generate synthetic data when we don't have enough real data points
  const generateSyntheticData = (timeframe: string, startValue: number, endValue: number) => {
    const now = new Date()
    const data = []
    let numPoints = 0

    switch (timeframe) {
      case "1D":
        numPoints = 24 // Hourly for a day
        break
      case "1W":
        numPoints = 7 // Daily for a week
        break
      case "1M":
        numPoints = 30 // Daily for a month
        break
      case "1Y":
        numPoints = 12 // Monthly for a year
        break
      default:
        numPoints = 7
    }

    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1)
      const value = startValue + (endValue - startValue) * progress

      // Add some random variation
      const randomFactor = 1 + (Math.random() * 0.04 - 0.02) // ±2% random variation

      let date
      if (timeframe === "1D") {
        date = subDays(now, 1)
        date.setHours(date.getHours() + i)
      } else if (timeframe === "1W") {
        date = subDays(now, 7 - i)
      } else if (timeframe === "1M") {
        date = subDays(now, 30 - i)
      } else {
        date = subDays(now, 365 - i * 30)
      }

      data.push({
        date: date.toISOString(),
        totalValue: value * randomFactor,
        btcValue: value * randomFactor * 0.6, // Assume 60% in BTC
        usdtValue: value * randomFactor * 0.2, // Assume 20% in USDT
        usdValue: value * randomFactor * 0.05, // Assume 5% in USD
        investmentsValue: value * randomFactor * 0.15, // Assume 15% in investments
      })
    }

    return data
  }

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-[200px]" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-8 w-10" />
            </div>
          </div>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Total Portfolio Value</h3>
          <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
          <div className="flex items-center text-sm">
            <div className={cn("flex items-center", change24h >= 0 ? "text-green-500" : "text-red-500")}>
              {change24h >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : "↓"} {Math.abs(change24h)}% (24h)
            </div>
            <span className="text-muted-foreground ml-2">${Math.abs(changeValue).toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Tabs defaultValue="chart" className="w-[200px]">
            <TabsList>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={timeframe === "1D" ? "bg-primary text-primary-foreground" : ""}
              onClick={() => setTimeframe("1D")}
            >
              1D
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={timeframe === "1W" ? "bg-primary text-primary-foreground" : ""}
              onClick={() => setTimeframe("1W")}
            >
              1W
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={timeframe === "1M" ? "bg-primary text-primary-foreground" : ""}
              onClick={() => setTimeframe("1M")}
            >
              1M
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={timeframe === "1Y" ? "bg-primary text-primary-foreground" : ""}
              onClick={() => setTimeframe("1Y")}
            >
              1Y
            </Button>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} width={80} />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="Total" stroke="#8884d8" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="BTC" stroke="#f7931a" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="USDT" stroke="#26a17b" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Investments" stroke="#82ca9d" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
