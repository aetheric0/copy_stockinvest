"use client"

import { useEffect, useRef } from "react"

interface CryptoData {
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: string
}

// Sample data - replace with your actual data source
const cryptoData: CryptoData[] = [
  { name: "Bitcoin", symbol: "BTC", price: 63245.78, change24h: 2.34, marketCap: "$1.21T" },
  { name: "Ethereum", symbol: "ETH", price: 3456.92, change24h: 1.56, marketCap: "$415.8B" },
  { name: "Binance Coin", symbol: "BNB", price: 567.23, change24h: -0.78, marketCap: "$87.3B" },
  { name: "Solana", symbol: "SOL", price: 142.67, change24h: 5.23, marketCap: "$61.5B" },
  { name: "Cardano", symbol: "ADA", price: 0.45, change24h: -1.23, marketCap: "$15.9B" },
  { name: "XRP", symbol: "XRP", price: 0.56, change24h: 0.34, marketCap: "$30.2B" },
  { name: "Dogecoin", symbol: "DOGE", price: 0.12, change24h: 3.45, marketCap: "$16.8B" },
  { name: "Polkadot", symbol: "DOT", price: 6.78, change24h: -0.56, marketCap: "$8.5B" },
  { name: "Avalanche", symbol: "AVAX", price: 34.56, change24h: 4.32, marketCap: "$12.7B" },
  { name: "Chainlink", symbol: "LINK", price: 14.32, change24h: 2.11, marketCap: "$8.2B" },
]

// Duplicate the data to create a seamless loop
const extendedData = [...cryptoData, ...cryptoData]

export function MarketCapTicker() {
  const tickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ticker = tickerRef.current
    if (!ticker) return

    // Clone the first set of items and append to create seamless loop
    const tickerAnimation = ticker.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(-${ticker.scrollWidth / 2}px)` }],
      {
        duration: 120000,
        iterations: Number.POSITIVE_INFINITY,
        easing: "linear",
      },
    )

    // Pause animation when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tickerAnimation.play()
          } else {
            tickerAnimation.pause()
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(ticker)

    return () => {
      tickerAnimation.cancel()
      observer.disconnect()
    }
  }, [])

  return (
    <div className="w-full bg-gray-900 dark:bg-black py-3 overflow-hidden">
      <div className="relative">
        <div ref={tickerRef} className="flex whitespace-nowrap">
          {extendedData.map((crypto, index) => (
            <div key={`${crypto.symbol}-${index}`} className="inline-flex items-center mx-4">
              <span className="font-medium text-white">{crypto.symbol}</span>
              <span className="ml-2 text-white">${crypto.price.toLocaleString()}</span>
              <span className={`ml-2 ${crypto.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {crypto.change24h >= 0 ? "+" : ""}
                {crypto.change24h}%
              </span>
              <span className="ml-2 text-gray-400">MCap: {crypto.marketCap}</span>
              <span className="mx-4 text-gray-600">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
