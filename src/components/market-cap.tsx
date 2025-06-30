"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export function MarketCap() {
  const [stocks, setStocks] = useState([
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 182.63,
      change: 1.25,
      marketCap: "2.87T",
      volume: "58.3M",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 415.32,
      change: 2.47,
      marketCap: "3.09T",
      volume: "22.1M",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 173.05,
      change: -0.83,
      marketCap: "2.15T",
      volume: "19.8M",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 182.41,
      change: 1.05,
      marketCap: "1.89T",
      volume: "31.2M",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: 924.79,
      change: -1.23,
      marketCap: "2.28T",
      volume: "42.7M",
    },
    {
      symbol: "META",
      name: "Meta Platforms",
      price: 474.36,
      change: 3.21,
      marketCap: "1.21T",
      volume: "15.6M",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 177.58,
      change: -2.34,
      marketCap: "565.2B",
      volume: "92.4M",
    },
    {
      symbol: "BRK.A",
      name: "Berkshire Hathaway",
      price: 621340.0,
      change: 0.78,
      marketCap: "889.7B",
      volume: "1.2K",
    },
  ])

  const [loading, setLoading] = useState(false)

  const refreshData = () => {
    setLoading(true)

    // Simulate data refresh with small random changes
    setTimeout(() => {
      setStocks(
        stocks.map((stock) => {
          const changePercent = (Math.random() * 2 - 1) * 1.5
          const newPrice = stock.price * (1 + changePercent / 100)
          return {
            ...stock,
            price: Number.parseFloat(newPrice.toFixed(2)),
            change: Number.parseFloat((stock.change + changePercent / 3).toFixed(2)),
          }
        }),
      )
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [stocks])

  return (
    <section id="markets" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Live Market Cap</h2>
          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[800px]">
            Track the performance of top stocks in real-time with our live market data
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Stocks by Market Cap</CardTitle>
                <CardDescription>Real-time market data</CardDescription>
              </div>
              <button
                onClick={refreshData}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-right py-3 px-4 font-medium">Price</th>
                    <th className="text-right py-3 px-4 font-medium">Change</th>
                    <th className="text-right py-3 px-4 font-medium">Market Cap</th>
                    <th className="text-right py-3 px-4 font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock, index) => (
                    <motion.tr
                      key={stock.symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{stock.symbol}</td>
                      <td className="py-3 px-4">{stock.name}</td>
                      <td className="py-3 px-4 text-right">${stock.price.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-right ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        <div className="flex items-center justify-end gap-1">
                          {stock.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {Math.abs(stock.change)}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">${stock.marketCap}</td>
                      <td className="py-3 px-4 text-right">{stock.volume}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
