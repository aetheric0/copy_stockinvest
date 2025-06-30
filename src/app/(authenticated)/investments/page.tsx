"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, Clock, CheckCircle, AlertCircle, Info, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SendModal from "@/components/SendModal"
import { PLANS } from "@/types/plan"
import { fetchPortfolioData } from "@/lib/api/portfolio"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransaction } from "@/contexts/transaction/transaction-context"

export default function InvestmentsPage() {
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeInvestments, setActiveInvestments] = useState<any[]>([])
  const [completedInvestments, setCompletedInvestments] = useState<any[]>([])
  const { state, setSelectedPlan } = useTransaction()

  useEffect(() => {
    const loadPortfolioData = async () => {
      setLoading(true)
      try {
        const data = await fetchPortfolioData()
        if (data) {
          setActiveInvestments(
            data.activeInvestments.map((inv) => ({
              id: inv.id,
              plan: inv.planName,
              amount: inv.amount,
              currency: inv.currency,
              startDate: inv.startDate,
              endDate: inv.endDate,
              status: inv.status,
              returns: inv.targetValue - inv.initialValue,
              progress: calculateProgress(new Date(inv.startDate), new Date(inv.endDate)),
              currentValue: inv.currentValue,
              targetValue: inv.targetValue,
            })),
          )
          setCompletedInvestments(
            data.completedInvestments.map((inv) => ({
              id: inv.id,
              plan: inv.planName,
              amount: inv.amount,
              currency: inv.currency,
              startDate: inv.startDate,
              endDate: inv.endDate,
              status: inv.status,
              returns: inv.targetValue - inv.initialValue,
              progress: 100,
              currentValue: inv.currentValue,
              targetValue: inv.targetValue,
            })),
          )
        }
      } catch (error) {
        console.error("Failed to load portfolio data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPortfolioData()
    // Refresh data every minute
    const interval = setInterval(loadPortfolioData, 60000)
    return () => clearInterval(interval)
  }, [])

  const calculateProgress = (startDate: Date, endDate: Date) => {
    const now = new Date()
    const total = endDate.getTime() - startDate.getTime()
    const elapsed = now.getTime() - startDate.getTime()

    if (elapsed <= 0) return 0
    if (elapsed >= total) return 100

    return Math.round((elapsed / total) * 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Active Investments</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Investment Plans</h1>
          <p className="text-muted-foreground">Manage your active investments and explore new opportunities</p>
        </div>
        <Button onClick={() => setShowInvestModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Investment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={`overflow-hidden ${plan.color}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.range}</p>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  {plan.duration}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Min Investment</span>
                  <span className="font-medium">${plan.minAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ROI</span>
                  <span className="font-medium text-green-600">{plan.bonus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payout</span>
                  <span className="font-medium">At maturity</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedPlan(plan)
                  setShowInvestModal(true)
                }}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Invest Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active">Active Investments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {activeInvestments.length > 0 ? (
            activeInvestments.map((investment) => (
              <Card key={investment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <h3 className="font-bold text-lg">{investment.plan} Plan</h3>
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {formatDate(investment.startDate)} - {formatDate(investment.endDate)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Investment: </span>
                        {investment.amount} {investment.currency} ($
                        {(investment.amount * (investment.currency === "BTC" ? 30000 : 1)).toLocaleString()})
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Current Value: </span>$
                        {investment.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-green-600">
                        <span className="font-medium">Expected Return: </span>$
                        {investment.returns.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Time Remaining</div>
                        <div className="font-bold">{calculateDaysRemaining(investment.endDate)} days</div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{investment.progress}%</span>
                        </div>
                        <Progress value={investment.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">No Active Investments</h3>
              <p className="text-muted-foreground mt-1">Start investing to see your active plans here</p>
              <Button className="mt-4" onClick={() => setShowInvestModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Investment
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {completedInvestments.length > 0 ? (
            completedInvestments.map((investment) => (
              <Card key={investment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <h3 className="font-bold text-lg">{investment.plan} Plan</h3>
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          Completed
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        {formatDate(investment.startDate)} - {formatDate(investment.endDate)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Investment: </span>
                        {investment.amount} {investment.currency} ($
                        {(investment.amount * (investment.currency === "BTC" ? 30000 : 1)).toLocaleString()})
                      </div>
                      <div className="text-sm text-green-600">
                        <span className="font-medium">Total Return: </span>$
                        {investment.returns.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="font-bold text-green-600">Paid Out</div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span>Completed</span>
                          <span>100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">No Completed Investments</h3>
              <p className="text-muted-foreground mt-1">Your completed investments will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showInvestModal} onOpenChange={(open) => setShowInvestModal(open)}>
        <DialogContent className="sm:max-w-[425px] border-0 rounded-xl shadow-xl bg-background sm:top-[50%] sm:translate-y-[-50%] bottom-0 top-auto h-[95vh] max-h-[100dvh] flex flex-col overflow-hidden">
          <div className="absolute inset-0 rounded-xl border-2 border-primary/10 backdrop-blur-sm" />
          <div className="relative z-10 h-full flex flex-col">
            <DialogHeader className="shrink-0 px-6 pt-6 pb-3">
              <DialogTitle className="text-lg font-semibold">New Investment</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <SendModal />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
