import { toast } from "sonner"
import { createTransaction, verifyTransaction } from "@/lib/api/transactions"

// Key under which we store pending verifications
const STORAGE_KEY = "pendingTransactions"

// Shape of a persisted verification
export interface PendingVerification {
  key: string
  transactionId: string
  currency: "BTC" | "USDT"
  minAmount: number
  planName?: string
  startTime: number
  onSuccess?: () => void
  onFailure?: () => void
  interval?: NodeJS.Timeout
  timeout?: NodeJS.Timeout
}

/**
 * Read all saved verifications from localStorage.
 * Returns an array of [key, data] pairs.
 */
export function getActiveVerifications(): [string, Omit<PendingVerification, "key">][] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(STORAGE_KEY) || "[]"
  const arr: PendingVerification[] = JSON.parse(raw)
  return arr.map(v => [
    v.key,
    {
      transactionId: v.transactionId,
      currency: v.currency,
      minAmount: v.minAmount,
      planName: v.planName,
      startTime: v.startTime,
      onSuccess: v.onSuccess,
      onFailure: v.onFailure,
    },
  ])
}

/** Persist the in-memory map back to localStorage */
function saveActiveVerifications(map: Map<string, PendingVerification>) {
  const arr = Array.from(map.values()).map(v => ({ ...v, key: v.key }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
}

/** Stop polling & timeout for a given verification key */
export function stopVerification(key: string) {
  const map = new Map<string, PendingVerification>(
    getActiveVerifications().map(([k, v]) => [k, { ...v, key: k }]),
  )
  const entry = map.get(key)
  if (entry) {
    if (entry.interval) clearInterval(entry.interval)
    if (entry.timeout) clearTimeout(entry.timeout)
    map.delete(key)
    saveActiveVerifications(map)
  }
}

/**
 * Start or resume verification polling for a transaction.
 * @param persistedStartTime If provided, resumes the original start time.
 */
export function startVerification(
  transactionId: string,
  currency: "BTC" | "USDT",
  minAmount: number,
  planName: string | undefined,
  onSuccess: () => void,
  onFailure: () => void,
  persistedStartTime?: number
) {
  // Determine start time
  const startTime = persistedStartTime ?? Date.now()
  const key = `${transactionId}-${startTime}`

  // Rehydrate existing map
  const map = new Map<string, PendingVerification>(
    getActiveVerifications().map(([k, v]) => [k, { ...v, key: k }])
  )

  // Insert or update entry
  map.set(key, {
    key,
    transactionId,
    currency,
    minAmount,
    planName,
    startTime,
    onSuccess,
    onFailure,
  })
  saveActiveVerifications(map)

  // Set up 30-minute timeout
  const timeout = setTimeout(() => {
    clearInterval(interval)
    map.delete(key)
    saveActiveVerifications(map)
    toast.error("Verification Timeout", {
      description: "Your transaction has timed out after 30 minutes.",
    })
    onFailure()
  }, 30 * 60 * 1000)

  // Poll every 30 seconds
  const interval = setInterval(async () => {
    const elapsedMin = (Date.now() - startTime) / 1000 / 60
    // If elapsed exceeds 30, let the timeout handler execute
    if (elapsedMin >= 30) return

    try {
      const resp = await verifyTransaction(transactionId, currency, minAmount)
      if (resp.status === "confirmed") {
        clearInterval(interval)
        clearTimeout(timeout)
        map.delete(key)
        saveActiveVerifications(map)
        onSuccess()
      } else if (resp.status === "failed") {
        clearInterval(interval)
        clearTimeout(timeout)
        map.delete(key)
        saveActiveVerifications(map)
        onFailure()
      }
    } catch (err) {
      console.error("Verification poll error:", err)
    }
  }, 30_000)

  // Store handles for clean-up
  map.set(key, { ...map.get(key)!, interval, timeout })
  saveActiveVerifications(map)
}

/**
 * Create a transaction on the server, then start verification polling.
 */
export async function createAndTrackTransaction(params: {
  amount: number
  currency: "BTC" | "USDT"
  toAddress: string
  planName: string
  onSuccess: () => void
  onFailure: () => void
}): Promise<string | null> {
  // Create the transaction record
  const result = await createTransaction({
    amount: params.amount,
    currency: params.currency,
    toAddress: params.toAddress,
  })
  if (!result?._id) {
    params.onFailure()
    return null
  }

  // Kick off polling, starting now
  startVerification(
    result._id,
    params.currency,
    params.amount,
    params.planName,
    params.onSuccess,
    params.onFailure
  )

  return result._id
}
