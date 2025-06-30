// src/components/SendModal.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user/user-context"
import { useTransaction, walletConfig } from "@/contexts/transaction/transaction-context"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import * as Select from "@radix-ui/react-select"
import { PLANS } from "@/types/plan"
import { AnimatePresence, motion } from "framer-motion"

export default function SendModal() {
  const { user, loading } = useUser()
  const router = useRouter()
  const { state, setCurrency, setSelectedPlan, handleCreateTransaction, handleCopyAddress, resetVerification } =
    useTransaction()

  const { currency, selectedPlan, verificationStatus, isSubmitting, isCopied } = state

  // Derive a light background class from the plan's color
  const bgClass = (planColor: string) => planColor.replace('border', 'bg') + ' bg-opacity-20'

  return (
    <div className="space-y-6">
      {/* Plan Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-muted-foreground">Select Investment Tier</label>

        <Select.Root
          value={selectedPlan?.name || ""}
          onValueChange={(value) => {
            const plan = PLANS.find((p) => p.name === value)
            setSelectedPlan(plan || null)
          }}
        >
          <Select.Trigger className="w-full flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
            <Select.Value placeholder="Choose investment tier">
              {selectedPlan ? (
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${selectedPlan.color.replace('border', 'bg')}`} />
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
              ) : (
                "Choose investment tier"
              )}
            </Select.Value>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Select.Trigger>

          <Select.Content
            position="popper"
            className="w-[var(--radix-select-trigger-width)] rounded-lg border bg-background shadow-lg overflow-hidden"
          >
            <Select.Viewport className="p-2 max-h-60 overflow-auto space-y-2">
              {PLANS.map((plan) => (
                <Select.Item
                  key={plan.name}
                  value={plan.name}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${plan.color} ${bgClass(plan.color)} data-[state=checked]:bg-opacity-40 data-[highlighted]:scale-[0.98]`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${plan.color.replace('border', 'bg')}`} />
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{plan.range}</div>
                    <div className="text-sm text-green-600">{plan.bonus}</div>
                    <div className="text-xs text-muted-foreground">Duration: {plan.duration}</div>
                  </div>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Root>
      </div>

      {/* Currency Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-muted-foreground">Select Settlement Currency</label>
        <div className="grid grid-cols-2 gap-3">
          {(['BTC', 'USDT'] as const).map((c) => (
            <Button
              key={c}
              variant={currency === c ? 'default' : 'secondary'}
              onClick={() => setCurrency(c)}
              className="h-12 flex items-center justify-center gap-2"
              type="button"
            >
              <img src={walletConfig[c].image} alt={c} className="w-6 h-6 rounded-full object-contain" />
              <span>{c}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Payment & Verification */}
      <AnimatePresence initial={false}>
        {selectedPlan && (
          <motion.div
            key={`${currency}-${selectedPlan.name}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.1 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Instructions */}
            <div className="p-4 bg-blue-50 dark:bg-gray-800 dark:text-gray-100 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Send exactly ${selectedPlan.minAmount.toLocaleString()} {currency} to the{' '}
                    {walletConfig[currency].network} address below
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="p-4 bg-muted rounded-lg text-center dark:bg-white">
              <QRCodeSVG value={walletConfig[currency].address} size={200} className="mx-auto" />
            </div>

            {/* Address + Copy */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={walletConfig[currency].address}
                readOnly
                className="flex-1 p-2 bg-background rounded-lg border font-mono text-sm"
              />
              <Button onClick={handleCopyAddress} variant="outline" size="sm" disabled={isCopied}>
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* Verify Button & Status */}
            <div className="space-y-4 sticky bottom-0 bg-background pt-4 border-t">
              <Button
                onClick={handleCreateTransaction}
                className="w-full"
                disabled={!selectedPlan || verificationStatus !== 'idle' || isSubmitting}
              >
                {isSubmitting
                  ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      <span>Processing...</span>
                    </div>
                  )
                  : `Verify ${selectedPlan.name} Payment`}
              </Button>

              {verificationStatus !== 'idle' && (
                <div className="text-center space-y-2">
                  {verificationStatus === 'pending' && (
                    <div className="flex flex-col items-center text-blue-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                      <span>Verifying transaction...</span>
                    </div>
                  )}
                  {verificationStatus === 'verified' && (
                    <div className="flex flex-col items-center text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Payment verified!</span>
                      <Button size="sm" onClick={resetVerification} className="mt-2">
                        New Transaction
                      </Button>
                    </div>
                  )}
                  {verificationStatus === 'failed' && (
                    <div className="flex flex-col items-center text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <span>Verification failed. Please try again.</span>
                      <Button size="sm" onClick={resetVerification} className="mt-2">
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
