"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, LineChart, PieChart } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

export function SecondHeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const features = [
    {
      icon: <LineChart className="h-10 w-10 text-primary" />,
      title: "Advanced Analytics",
      description: "Track your investments with professional-grade analytics tools.",
    },
    {
      icon: <PieChart className="h-10 w-10 text-primary" />,
      title: "Portfolio Diversification",
      description: "Optimize your portfolio with smart diversification strategies.",
    },
    {
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
      title: "Market Insights",
      description: "Get real-time market insights and expert recommendations.",
    },
  ]

  return (
    <section id="about" className="relative bg-muted/50 py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative order-2 md:order-1"
          >
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-lg">
              <Image
                src="/assets/images/datadriven.jpg"
                alt="Investment analytics"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -top-6 -right-6 rounded-lg bg-background p-4 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-2">
                  <BarChart2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Market Trend</p>
                  <p className="text-2xl font-bold text-green-500">Bullish</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6 order-1 md:order-2"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
            >
              Make data-driven investment decisions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              Our platform provides you with comprehensive tools and insights to analyze market trends and optimize your
              investment strategy.
            </motion.p>

            <div className="grid gap-6 mt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.2, duration: 0.5 }}
                  className="flex gap-4 items-start"
                >
                  <div className="rounded-lg bg-primary/10 p-2 mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-4"
            >
              <Button size="lg" className="group">
                Explore features
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
