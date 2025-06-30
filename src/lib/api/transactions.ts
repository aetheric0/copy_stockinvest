// lib/api/transactions.ts
import { toast } from "sonner"

export interface Transaction {
  id: string
  type: "deposit" | "withdrawal"
  amount: number
  currency: string
  date: string
  status: "pending" | "completed" | "failed"
  address: string
  txHash: string
  description?: string
}

export interface CreateTransactionParams {
  amount: number
  currency: "BTC" | "USDT"
  toAddress: string
  type?: "deposit" | "withdrawal"
}

export async function createTransaction(params: CreateTransactionParams): Promise<{ _id: string } | null> {
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create transaction")
    }

    return await response.json()
  } catch (error) {
    console.error("Transaction creation failed:", error)
    toast.error("Transaction Failed", {
      description: error instanceof Error ? error.message : "Could not create transaction",
    })
    return null
  }
}

export async function verifyTransaction(
  id: string,
  currency: "BTC" | "USDT",
  minAmount: number,
): Promise<{ status: "pending" | "confirmed" | "failed"; txHash?: string }> {
  try {
    const response = await fetch(`/api/transactions/${id}/verify?currency=${currency}&minAmount=${minAmount}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to verify transaction")
    }

    return await response.json()
  } catch (error) {
    console.error("Transaction verification failed:", error)
    return { status: "failed" }
  }
}

export async function fetchTransactions(type?: "deposit" | "withdrawal"): Promise<Transaction[]> {
  try {
    const url = type ? `/api/transactions?type=${type}` : "/api/transactions"
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every minute at most
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching transactions:", error)
    toast.error("Error fetching transactions", {
      description: "Could not retrieve your transaction history",
    })
    return []
  }
}
