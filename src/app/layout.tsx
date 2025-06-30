import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { UserProvider } from "@/contexts/user/user-context"
import { TransactionProvider } from "@/contexts/transaction/transaction-context"
import { Toaster } from "sonner"
//import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: "StockInvest",
  description: "Heurisitc guided approach to trading",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1'/>
      </head>
      <body className='overflow-x-hidden'>
        
          <UserProvider>
            <TransactionProvider>
              {children}
              <Toaster position="top-right" />
            </TransactionProvider>
          </UserProvider>
        
        </body>
    </html>
  )
}
