import type { TransactionStatus } from "@/app/api/transactions/[address]/route"

declare global {
  interface TransactionModel {
    _id: string
    user: string
    txHash?: string
    amount?: number
    currency: "BTC" | "USDT"
    status: TransactionStatus
    initiatedAt: Date
    confirmedAt?: Date
    save: () => Promise<void>
  }
}
