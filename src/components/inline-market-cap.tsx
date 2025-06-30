"use client"

import { useEffect, useRef } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

interface CryptoData {
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: string
  volume24h: string
}

// Sample data - replace with your actual data source
const cryptoData: CryptoData[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: 63245.78,
    change24h: 2.34,
    marketCap: "$1.21T",
    volume24h: "$42.5B",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    price: 3456.92,
    change24h: 1.56,
    marketCap: "$415.8B",
    volume24h: "$18.7B",
  },
  {
    name: "Binance Coin",
    symbol: "BNB",
    price: 567.23,
    change24h: -0.78,
    marketCap: "$87.3B",
    volume24h: "$2.1B",
  },
  {
    name: "Solana",
    symbol: "SOL",
    price: 142.67,
    change24h: 5.23,
    marketCap: "$61.5B",
    volume24h: "$3.8B",
  },
  {
    name: "Cardano",
    symbol: "ADA",
    price: 0.45,
    change24h: -1.23,
    marketCap: "$15.9B",
    volume24h: "$789.3M",
  },
  {
    name: "XRP",
    symbol: "XRP",
    price: 0.56,
    change24h: 0.34,
    marketCap: "$30.2B",
    volume24h: "$1.5B",
  },
]

export function InlineMarketCap() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      scrollContainer.scrollLeft += e.deltaY
    }

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      scrollContainer?.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return (
    <section className="py-8 mb-12">
      <div className="max-w-full overflow-hidden">
        <h3 className="text-xl font-semibold mb-4 px-4 dark:text-white">Market Overview</h3>

        <div ref={scrollRef} className="flex overflow-x-auto pb-4 hide-scrollbar">
          {cryptoData.map((crypto) => (
            <div
              key={crypto.symbol}
              className="flex-shrink-0 w-64 mr-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold dark:text-white">{crypto.name}</h4>
                <span className="text-gray-500 dark:text-gray-400">{crypto.symbol}</span>
              </div>

              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xl font-bold dark:text-white">${crypto.price.toLocaleString()}</span>
                <div className={`flex items-center ${crypto.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {crypto.change24h >= 0 ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  <span>{Math.abs(crypto.change24h)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Market Cap</p>
                  <p className="font-medium dark:text-gray-200">{crypto.marketCap}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Volume (24h)</p>
                  <p className="font-medium dark:text-gray-200">{crypto.volume24h}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
