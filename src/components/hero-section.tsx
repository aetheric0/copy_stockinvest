"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Shield, TrendingUp } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>Smart investing for everyone</span>
            </div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl"
            >
              Invest with confidence and clarity
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              Access professional-grade investment tools, real-time market data, and expert insights to make informed
              decisions.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-col gap-3 min-[400px]:flex-row"
            >
              <Button size="lg" className="group">
                Start investing now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg">
                Learn more
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="mt-6 flex items-center gap-4 text-sm"
            >
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-primary" />
                <span>Secure investments</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Real-time analytics</span>
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-lg">
              <Image
                src="/assets/images/elon1.jpg"
                alt="Investment dashboard"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-lg" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-6 -left-6 rounded-lg bg-background p-4 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Portfolio Growth</p>
                  <p className="text-2xl font-bold text-primary">+27.4%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
