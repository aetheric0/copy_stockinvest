"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Clock, Plus, BarChart3, Wallet, RefreshCw, CreditCard } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SendModal from "@/components/SendModal"
import ReceiveModal from "@/components/receive-modal"
import TransactionHistoryModal from "@/components/transaction-history-modal"
import { useRouter } from "next/navigation"
import { useTransaction } from "@/contexts/transaction/transaction-context"
import { useState } from "react"

interface QuickActionMenuProps {
  className?: string
}

export default function QuickActionMenu({}: QuickActionMenuProps) {
  const router = useRouter()
  const { state, handleQuickAction, closeModal } = useTransaction()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleNavigate = (path: string) => {
    setDropdownOpen(false) // Close dropdown when navigating
    router.push(path)
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          variant={state.activeAction === "send" ? "default" : "secondary"}
          className="h-24 flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer hover:shadow-md"
          onClick={() => handleQuickAction("send")}
        >
          <ArrowUpRight className="w-6 h-6" />
          <span>Send</span>
        </Button>
        <Button
          variant={state.activeAction === "receive" ? "default" : "secondary"}
          className="h-24 flex flex-col items-center justify-center space-y-2 transition-all"
          onClick={() => handleQuickAction("receive")}
        >
          <ArrowDownRight className="w-6 h-6" />
          <span>Receive</span>
        </Button>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="h-24 flex flex-col items-center justify-center space-y-2 transition-all relative group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
              <span>More Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => {
                setDropdownOpen(false)
                handleQuickAction("history")
              }}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>Transaction History</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/portfolio")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Portfolio Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/investments")}>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Investments</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/markets")}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Market Data</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/account")}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={state.showActionModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[425px] border-0 rounded-xl shadow-xl bg-background top-1/2 left-1/2 w-full max-w-full sm:w-auto -translate-x-1/2 -translate-y-1/2 h-[95vh] max-h-[100dvh] flex flex-col overflow-hidden">
          <div className="absolute inset-0 rounded-xl border-2 border-primary/10 backdrop-blur-sm" />
          <div className="relative z-10 h-full flex flex-col">
            <DialogHeader className="shrink-0 px-6 pt-6 pb-3">
              <DialogTitle className="text-lg font-semibold capitalize">{state.activeAction}</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {state.activeAction === "send" && <SendModal />}
              {state.activeAction === "receive" && <ReceiveModal />}
              {state.activeAction === "history" && <TransactionHistoryModal />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
