"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TradingViewWidget() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "NASDAQ:AAPL",
      interval: "D",
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      height: "500",
    })

    containerRef.current.appendChild(script)
    setIsLoaded(true)

    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const currencies = [
    { pair: "EUR/USD", price: 1.0876, change: 0.12 },
    { pair: "GBP/USD", price: 1.2654, change: -0.23 },
    { pair: "USD/JPY", price: 151.43, change: 0.45 },
    { pair: "USD/CAD", price: 1.3598, change: -0.08 },
    { pair: "AUD/USD", price: 0.6587, change: 0.19 },
    { pair: "NZD/USD", price: 0.6012, change: -0.14 },
    { pair: "USD/CHF", price: 0.9043, change: 0.22 },
    { pair: "EUR/GBP", price: 0.8594, change: 0.31 },
  ]

  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Market Analysis</h2>
          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[800px]">
            Advanced charting and real-time currency data to inform your investment decisions
          </p>
        </div>

        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="chart">Stock Chart</TabsTrigger>
            <TabsTrigger value="forex">Forex Rates</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>TradingView Chart</CardTitle>
                <CardDescription>Interactive stock chart powered by TradingView</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="tradingview-widget-container" ref={containerRef}>
                  <div className="tradingview-widget-container__widget h-[500px]"></div>
                  {!isLoaded && (
                    <div className="flex items-center justify-center h-[500px] bg-muted/20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forex" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Forex Currency Rates</CardTitle>
                <CardDescription>Live currency exchange rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Currency Pair</th>
                        <th className="text-right py-3 px-4 font-medium">Price</th>
                        <th className="text-right py-3 px-4 font-medium">24h Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currencies.map((currency) => (
                        <tr key={currency.pair} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{currency.pair}</td>
                          <td className="py-3 px-4 text-right">{currency.price}</td>
                          <td
                            className={`py-3 px-4 text-right ${currency.change >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {currency.change >= 0 ? "+" : ""}
                            {currency.change}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
