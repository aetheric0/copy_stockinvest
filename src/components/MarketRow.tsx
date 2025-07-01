// components/MarketRow.tsx
"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { CryptoData } from "@/lib/api/market"

interface MarketRowProps {
  coin: CryptoData
  toggleFavorite: (id: string) => void
  isFavorite: boolean
}

export default function MarketRow({ coin }: MarketRowProps) {
  const isPositive = coin.price_change_percentage_24h >= 0
  const bgClass = isPositive
    ? "bg-green-50/50 dark:bg-green-900/50"
    : "bg-red-50/50   dark:bg-red-900/50"

  return (
    <motion.div
      key={coin.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg transition-colors",
        bgClass
      )}
    >
      <div className="flex items-center space-x-3">
        {coin.image && (
          <div className="relative w-8 h-8">
            <Image
              src={coin.image}
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
        <div className="font-medium">
          ${coin.current_price.toLocaleString(undefined, {
            minimumFractionDigits: coin.current_price < 1 ? 6 : 2,
            maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
          })}
        </div>
        <div
          className={cn(
            "text-sm flex items-center justify-end gap-1",
            isPositive ? "text-green-500 dark:text-green-300" : "text-red-500 dark:text-red-300"
          )}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
        </div>
      </div>
    </motion.div>
  )
}
