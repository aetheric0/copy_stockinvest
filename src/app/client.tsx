"use client"

import type React from "react"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { initTransactionTracker } from "@/lib/services/transaction-tracker"

function RootLayoutClient({ children }: { children: React.ReactNode }) {
  // Initialize transaction tracker on client side
  useEffect(() => {
    initTransactionTracker()
  }, [])

  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

export default RootLayoutClient
