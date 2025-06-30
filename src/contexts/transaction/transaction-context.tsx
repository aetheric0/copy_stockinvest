
// src/contexts/transaction/transaction-context.tsx
"use client"

import React, { createContext, type ReactNode, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import {
  createAndTrackTransaction,
  getActiveVerifications,
  startVerification,
  stopVerification,
} from "@/lib/services/transaction-tracker"
import type { Plan } from "@/types/plan"
import { verifyTransaction } from "@/lib/api/transactions"

export const walletConfig = {
  BTC: {
    address: process.env.NEXT_PUBLIC_BTC_ADDRESS!,
    network: "Bitcoin Network",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  USDT: {
    address: process.env.NEXT_PUBLIC_USDT_ADDRESS!,
    network: "ERC20 Network",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  },
}

export type TransactionState = {
  activeAction: "send" | "receive" | "history" | null
  showActionModal: boolean
  currency: "BTC" | "USDT"
  selectedPlan: Plan | null
  verificationStatus: "idle" | "pending" | "verified" | "failed"
  verificationStarted: boolean
  isCopied: boolean
  isSubmitting: boolean
  activeVerificationKey: string | null
}

export type TransactionContextType = {
  state: TransactionState
  handleQuickAction: (action: "send" | "receive" | "history") => void
  closeModal: () => void
  setCurrency: (currency: "BTC" | "USDT") => void
  setSelectedPlan: (plan: Plan | null) => void
  handleCreateTransaction: (e: React.MouseEvent) => Promise<void>
  handleCopyAddress: () => Promise<void>
  resetVerification: () => void
}

export const TransactionContext = createContext<TransactionContextType | null>(null)

export const useTransaction = () => {
  const ctx = useContext(TransactionContext)
  if (!ctx) throw new Error("useTransaction must be used within a TransactionProvider")
  return ctx
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TransactionState>({
    activeAction: null,
    showActionModal: false,
    currency: "BTC",
    selectedPlan: null,
    verificationStatus: "idle",
    verificationStarted: false,
    isCopied: false,
    isSubmitting: false,
    activeVerificationKey: null,
  })

  // On mount: restore UI state and resume any active verifications
  useEffect(() => {
    try {
      const saved = localStorage.getItem("transactionState")
      if (saved) {
        setState(prev => ({ ...prev, ...JSON.parse(saved), showActionModal: false }))
      }
    } catch (err) {
      console.error("Error restoring transactionState:", err)
    }

    // Resume polling/timeout for each persisted verification
    getActiveVerifications().forEach(async ([key, v]) => {
      // Rehydrate tracker logic
      const { status } = await verifyTransaction(v.transactionId, v.currency, v.minAmount)
      if (status === 'failed') {
        setState(prev => ({ ...prev, verificationStatus: 'failed'}))
        stopVerification(key)
        return
      }
      if (status === 'confirmed') {
        setState(prev => ({ ...prev, verificationStatus: 'verified'}))
        stopVerification(key)
        return
      }
      startVerification(
        v.transactionId,
        v.currency,
        v.minAmount,
        v.planName,
        () => setState(prev => ({ ...prev, verificationStatus: "verified" })),
        () => setState(prev => ({ ...prev, verificationStatus: "failed" })),
        v.startTime,
      )

      // Update UI to pending
      setState(prev => ({
        ...prev,
        verificationStarted: true,
        verificationStatus: "pending",
        currency: v.currency,
        selectedPlan: v.planName
          ? { name: v.planName, range: "", minAmount: v.minAmount, bonus: "", duration: "", color: "" }
          : null,
        activeVerificationKey: key,
      }))

      toast.info("Resuming transaction verification…")
    })
  }, [])

  // Persist minimal state
  useEffect(() => {
    const toSave = {
      currency: state.currency,
      verificationStatus: state.verificationStatus,
      verificationStarted: state.verificationStarted,
      activeVerificationKey: state.activeVerificationKey,
    }
    localStorage.setItem("transactionState", JSON.stringify(toSave))
  }, [
    state.currency,
    state.verificationStatus,
    state.verificationStarted,
    state.activeVerificationKey,
  ])

  const handleQuickAction = (action: "send" | "receive" | "history") => {
    setState(prev => ({ ...prev, activeAction: action, showActionModal: true }))
  }

  const closeModal = () => setState(prev => ({ ...prev, activeAction: null, showActionModal: false }))

  const setCurrency = (currency: "BTC" | "USDT") => setState(prev => ({ ...prev, currency }))

  const setSelectedPlan = (plan: Plan | null) => setState(prev => ({ ...prev, selectedPlan: plan }))

  const resetVerification = () => {
    if (state.activeVerificationKey) stopVerification(state.activeVerificationKey)
    setState(prev => ({
      ...prev,
      verificationStatus: "idle",
      verificationStarted: false,
      activeVerificationKey: null,
    }))
  }

  const handleCreateTransaction = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!state.selectedPlan) return

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      verificationStarted: true,
      verificationStatus: "pending",
    }))

    try {
      const txId = await createAndTrackTransaction({
        amount: state.selectedPlan.minAmount,
        currency: state.currency,
        toAddress: walletConfig[state.currency].address,
        planName: state.selectedPlan.name,
        onSuccess: () => setState(prev => ({ ...prev, verificationStatus: "verified" })),
        onFailure: () => setState(prev => ({ ...prev, verificationStatus: "failed" })),
      })

      if (!txId) {
        setState(prev => ({ ...prev, verificationStatus: "failed" }))
      } else {
        const pend = getActiveVerifications()
        if (pend.length > 0) setState(prev => ({ ...prev, activeVerificationKey: pend[0][0] }))
      }
    } catch (err) {
      console.error(err)
      setState(prev => ({ ...prev, verificationStatus: "failed" }))
      toast.error("Transaction error", { description: (err as Error).message })
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletConfig[state.currency].address)
      setState(prev => ({ ...prev, isCopied: true }))
      setTimeout(() => setState(prev => ({ ...prev, isCopied: false })), 2000)
    } catch {
      toast.error("Failed to copy address")
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        state,
        handleQuickAction,
        closeModal,
        setCurrency,
        setSelectedPlan,
        handleCreateTransaction,
        handleCopyAddress,
        resetVerification,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
