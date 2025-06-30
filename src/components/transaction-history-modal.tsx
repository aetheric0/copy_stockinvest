"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, ExternalLink, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { fetchTransactions, type Transaction } from "@/lib/api/transactions"
import { Skeleton } from "@/components/ui/skeleton"

// Currency images
const currencyImages = {
  BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  USDT: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
}

export default function TransactionHistoryModal() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        // Pass the type filter if not "all"
        const type = filter === "deposit" || filter === "withdrawal" ? filter : undefined
        const data = await fetchTransactions(type)
        setTransactions(data)
      } catch (error) {
        console.error("Failed to load transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [filter])

  const filteredTransactions = transactions.filter((tx) => {
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        tx.address.toLowerCase().includes(query) ||
        tx.txHash.toLowerCase().includes(query) ||
        tx.currency.toLowerCase().includes(query)
      )
    }

    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by address or hash..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all" onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className={cn(
                "p-3 rounded-lg border transition-colors",
                tx.status === "pending" ? "bg-yellow-50/50 border-yellow-200" : "bg-background",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      tx.type === "deposit" ? "bg-green-100" : "bg-red-100",
                    )}
                  >
                    {tx.type === "deposit" ? (
                      <ArrowDownRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{tx.type}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(tx.date)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Image
                    src={currencyImages[tx.currency as keyof typeof currencyImages] || "/placeholder.svg"}
                    alt={tx.currency}
                    width={16}
                    height={16}
                    className="rounded-full"
                    unoptimized
                  />
                  <div className="text-right">
                    <div className="font-medium">
                      {tx.type === "deposit" ? "+" : "-"}
                      {tx.amount} {tx.currency}
                    </div>
                    <div className={cn("text-xs", tx.status === "completed" ? "text-green-600" : "text-yellow-600")}>
                      {tx.status === "completed" ? "Completed" : "Pending"}
                    </div>
                  </div>
                </div>
              </div>
              {tx.txHash && (
                <div className="mt-2 pt-2 border-t text-xs flex justify-between items-center">
                  <div className="truncate max-w-[200px]">
                    <span className="text-muted-foreground mr-1">Hash:</span>
                    {tx.txHash}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => {
                      const baseUrl =
                        tx.currency === "BTC" ? "https://blockstream.info/tx/" : "https://etherscan.io/tx/"
                      window.open(`${baseUrl}${tx.txHash}`, "_blank")
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t">
        <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/transactions")}>
          View All Transactions
        </Button>
      </div>
    </div>
  )
}
