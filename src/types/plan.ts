export interface Plan {
  name: string
  range: string
  minAmount: number
  bonus: string
  duration: string
  color: string
}

export const PLANS: Plan[] = [
  {
    name: "Bronze",
    range: "$500 - $4,999",
    minAmount: 500,
    bonus: "7.5% ROI",
    duration: "30 Days",
    color: "border-amber-200",
  },
  {
    name: "Silver",
    range: "$5,000 - $19,999",
    minAmount: 5000,
    bonus: "10% ROI",
    duration: "45 Days",
    color: "border-slate-300",
  },
  {
    name: "Gold",
    range: "$20,000 - $49,999",
    minAmount: 20000,
    bonus: "15% ROI",
    duration: "60 Days",
    color: "border-yellow-400",
  },
  {
    name: "Platinum",
    range: "$50,000+",
    minAmount: 50000,
    bonus: "20% ROI",
    duration: "90 Days",
    color: "border-emerald-400",
  },
]
