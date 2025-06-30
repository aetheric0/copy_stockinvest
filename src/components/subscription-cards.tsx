"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, CreditCard, Gem, Rocket, Zap } from "lucide-react"
import { motion } from "framer-motion"

export function SubscriptionCards() {
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: "Starter",
      description: "Perfect for beginners and casual investors",
      price: annual ? 99 : 9.99,
      features: [
        "Basic market data",
        "5 stock watchlists",
        "Daily market insights",
        "Basic portfolio tracking",
        "Email support",
      ],
      icon: <CreditCard className="h-5 w-5" />,
      popular: false,
    },
    {
      name: "Pro",
      description: "For active investors who want more insights",
      price: annual ? 199 : 19.99,
      features: [
        "Real-time market data",
        "Unlimited watchlists",
        "Advanced portfolio analytics",
        "Trading signals",
        "Priority support",
        "Strategy backtesting",
      ],
      icon: <Zap className="h-5 w-5" />,
      popular: true,
    },
    {
      name: "Premium",
      description: "For serious investors and professionals",
      price: annual ? 399 : 39.99,
      features: [
        "Institutional-grade data",
        "Advanced technical indicators",
        "AI-powered insights",
        "Custom alerts",
        "Dedicated account manager",
        "API access",
        "White-glove onboarding",
      ],
      icon: <Gem className="h-5 w-5" />,
      popular: false,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for investment firms",
      price: "Custom",
      features: [
        "Custom data integrations",
        "Team collaboration tools",
        "Compliance reporting",
        "Custom analytics",
        "24/7 dedicated support",
        "On-premise deployment options",
        "Custom development",
      ],
      icon: <Rocket className="h-5 w-5" />,
      popular: false,
    },
  ]

  return (
    <section className="py-20 md:py-32">
      <div id="pricing" className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose your investment plan</h2>
          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[800px]">
            Select the perfect plan to match your investment goals and experience level
          </p>

          <div className="flex items-center space-x-2 mt-6 bg-muted p-1 rounded-lg">
            <Button variant={!annual ? "default" : "ghost"} size="sm" onClick={() => setAnnual(false)}>
              Monthly
            </Button>
            <Button variant={annual ? "default" : "ghost"} size="sm" onClick={() => setAnnual(true)}>
              Annual <span className="ml-1 text-xs font-normal opacity-80">Save 20%</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className={`h-full flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-full p-1.5 ${plan.popular ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {plan.icon}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4">
                    {typeof plan.price === "number" ? (
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground ml-1">{annual ? "/year" : "/month"}</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold">{plan.price}</div>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant={plan.popular ? "default" : "outline"} className="w-full">
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
