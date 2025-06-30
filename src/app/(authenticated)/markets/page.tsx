"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star, TrendingUp, TrendingDown, Filter, ArrowUpDown } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { fetchMarketData, type CryptoData } from "@/lib/api/market"
import { Skeleton } from "@/components/ui/skeleton"
import MarketRow from "@/components/MarketRow"

export default function MarketsPage() {
  const [marketData, setMarketData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof CryptoData; direction: "asc" | "desc" } | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const loadMarketData = async () => {
      setLoading(true)
      try {
        const data = await fetchMarketData()
        setMarketData(data)
      } catch (error) {
        console.error("Failed to load market data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMarketData()
    const interval = setInterval(loadMarketData, 30000) // Refresh every 30 seconds

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("cryptoFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    return () => clearInterval(interval)
  }, [])

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem("cryptoFavorites", JSON.stringify(favorites))
  }, [favorites])

  const handleSort = (key: keyof CryptoData) => {
    let direction: "asc" | "desc" = "desc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc"
    }
    setSortConfig({ key, direction })
  }

  const sortedData = React.useMemo(() => {
    const sortableData = [...marketData]
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        // Handle null or undefined values
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1
        if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }
    return sortableData
  }, [marketData, sortConfig])

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return sortedData
    return sortedData.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [sortedData, searchQuery])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const favoriteCoins = filteredData.filter((coin) => favorites.includes(coin.id))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All Coins</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
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
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Markets</h1>
          <p className="text-muted-foreground">Track cryptocurrency prices and market trends</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search coins..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="all">All Coins</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LIVE PRICES
                  </div>
                  <span className="text-xs text-muted-foreground">Updated every 30 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Gainers
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Losers
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-3 px-4 font-medium">Favorite</th>
                      <th className="text-left py-3 px-4 font-medium">Coin</th>
                      <th
                        className="text-right py-3 px-4 font-medium cursor-pointer"
                        onClick={() => handleSort("current_price")}
                      >
                        <div className="flex items-center justify-end">
                          Price
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th
                        className="text-right py-3 px-4 font-medium cursor-pointer"
                        onClick={() => handleSort("price_change_percentage_24h")}
                      >
                        <div className="flex items-center justify-end">
                          24h Change
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th
                        className="text-right py-3 px-4 font-medium cursor-pointer hidden md:table-cell"
                        onClick={() => handleSort("market_cap")}
                      >
                        <div className="flex items-center justify-end">
                          Market Cap
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th
                        className="text-right py-3 px-4 font-medium cursor-pointer hidden lg:table-cell"
                        onClick={() => handleSort("total_volume")}
                      >
                        <div className="flex items-center justify-end">
                          Volume (24h)
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((coin) => {
                      const isPositive = coin.price_change_percentage_24h >= 0
                      return (
                        <motion.tr
                          key={coin.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleFavorite(coin.id)}
                            >
                              <Star
                                className={cn(
                                  "h-4 w-4",
                                  favorites.includes(coin.id)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground",
                                )}
                              />
                            </Button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              {coin.image && (
                                <Image
                                  src={coin.image || "/placeholder.svg"}
                                  alt={coin.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full mr-3"
                                  unoptimized
                                />
                              )}
                              <div>
                                <div className="font-medium">{coin.name}</div>
                                <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={coin.current_price}
                                initial={{ y: isPositive ? 10 : -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="font-medium"
                              >
                                $
                                {coin.current_price.toLocaleString(undefined, {
                                  minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
                                  maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
                                })}
                              </motion.div>
                            </AnimatePresence>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div
                              className={cn(
                                "text-sm flex items-center justify-end gap-1",
                                isPositive ? "text-green-500" : "text-red-500",
                              )}
                            >
                              {isPositive ? "↑" : "↓"}
                              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right hidden md:table-cell">
                            ${coin.market_cap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-4 px-4 text-right hidden lg:table-cell">
                            ${coin.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="favorites">
          <Card>
            <CardContent className="p-6">
              {favoriteCoins.length > 0 ? (
                <div className="space-y-4">
                  {favoriteCoins.map((coin) => {
                    const isPositive = coin.price_change_percentage_24h >= 0
                    return (
                      <div
                        key={coin.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg transition-colors",
                          isPositive ? "bg-green-50/50" : "bg-red-50/50",
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleFavorite(coin.id)}
                          >
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </Button>
                          {coin.image && (
                            <div className="relative w-8 h-8">
                              <Image
                                src={coin.image || "/placeholder.svg"}
                                alt={coin.name}
                                width={32}
                                height={32}
                                className="rounded-full object-contain"
                                unoptimized
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{coin.name}</div>
                            <div className="text-sm text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={coin.current_price}
                              initial={{ y: isPositive ? 10 : -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="font-medium"
                            >
                              $
                              {coin.current_price.toLocaleString(undefined, {
                                minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
                                maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
                              })}
                            </motion.div>
                          </AnimatePresence>
                          <div
                            className={cn(
                              "text-sm flex items-center justify-end gap-1",
                              isPositive ? "text-green-500" : "text-red-500",
                            )}
                          >
                            {isPositive ? "↑" : "↓"}
                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg">No Favorites Yet</h3>
                  <p className="text-muted-foreground mt-1">Add coins to your favorites by clicking the star icon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
