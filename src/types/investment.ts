// /src/types/investment.ts
export interface Investment {
  id: string
  plan: string
  amount: number
  currency: string
  startDate: string
  endDate: string
  status: string
  returns: number
  progress: number
  currentValue: number
  targetValue: number
}
