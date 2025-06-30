"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Download, Filter, Search, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fetchTransactions, type Transaction } from "@/lib/api/transactions"
import { Skeleton } from "@/components/ui/skeleton"

// Currency images
const currencyImages = {
  BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  USDT: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true)
      try {
        // Pass the type filter based on the active tab
        const type = activeTab === "deposits" ? "deposit" : activeTab === "withdrawals" ? "withdrawal" : undefined
        const data = await fetchTransactions(type)
        setTransactions(data)
      } catch (error) {
        console.error("Failed to load transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [activeTab])

  const filteredTransactions = transactions.filter((tx) => {
    // Apply type filter
    if (filter !== "all" && tx.type !== filter) return false

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        tx.address.toLowerCase().includes(query) ||
        tx.txHash.toLowerCase().includes(query) ||
        tx.currency.toLowerCase().includes(query) ||
        tx.description?.toLowerCase().includes(query) ||
        false
      )
    }

    // Apply date filter
    if (dateRange.from || dateRange.to) {
      const txDate = new Date(tx.date)
      if (dateRange.from && txDate < dateRange.from) return false
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        if (txDate > endOfDay) return false
      }
    }

    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full mb-4" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage your transaction history</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select defaultValue="all" onValueChange={setFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range) {
                        setDateRange({ from: range.from, to: range.to })
                      } else {
                        setDateRange({ from: undefined, to: undefined })
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {renderTransactionTable(filteredTransactions)}
            </TabsContent>
            <TabsContent value="deposits" className="mt-0">
              {renderTransactionTable(filteredTransactions)}
            </TabsContent>
            <TabsContent value="withdrawals" className="mt-0">
              {renderTransactionTable(filteredTransactions)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )

  function renderTransactionTable(transactions: Transaction[]) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium">Type</th>
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Description</th>
              <th className="text-right py-3 px-4 font-medium">Amount</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b hover:bg-muted/50 dark:hover:bg-muted/30">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                          tx.type === "deposit" ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900",
                        )}
                      >
                        {tx.type === "deposit" ? (
                          <ArrowDownRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <span className="capitalize">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm">{formatDate(tx.date)}</td>
                  <td className="py-4 px-4">{tx.description || (tx.type === "deposit" ? "Deposit" : "Withdrawal")}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Image
                        src={currencyImages[tx.currency as keyof typeof currencyImages] || "/placeholder.svg"}
                        alt={tx.currency}
                        width={16}
                        height={16}
                        className="rounded-full"
                        unoptimized
                      />
                      <span className="font-medium">
                        {tx.type === "deposit" ? "+" : "-"}
                        {tx.amount} {tx.currency}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      {tx.status === "completed" ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Completed
                        </span>
                      ) : tx.status === "failed" ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                          Failed
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                          Pending
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        if (tx.txHash) {
                          const baseUrl =
                            tx.currency === "BTC" ? "https://blockstream.info/tx/" : "https://etherscan.io/tx/"
                          window.open(`${baseUrl}${tx.txHash}`, "_blank")
                        }
                      }}
                      disabled={!tx.txHash}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-8 w-8 mb-2" />
                    <p>No transactions found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
}
