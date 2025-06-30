"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2, AlertCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/user/user-context"

// Wallet configuration with fallback addresses
const walletConfig = {
  BTC: {
    address: process.env.NEXT_PUBLIC_BTC_ADDRESS || "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    network: "Bitcoin Network",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  USDT: {
    address: process.env.NEXT_PUBLIC_USDT_ADDRESS || "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    network: "ERC20 Network",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  },
}

export default function ReceiveModal() {
  const { user } = useUser()
  const [currency, setCurrency] = useState<"BTC" | "USDT">("BTC")
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletConfig[currency].address)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Receive cryptocurrency to your wallet</p>
            <p className="text-xs text-muted-foreground">
              Share this address with the sender. Make sure they send through the {walletConfig[currency].network}.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="BTC" className="w-full" onValueChange={(value) => setCurrency(value as "BTC" | "USDT")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="BTC" className="flex items-center gap-2">
            <Image
              src={walletConfig.BTC.image || "/placeholder.svg"}
              alt="Bitcoin"
              width={20}
              height={20}
              className="rounded-full"
              unoptimized
            />
            <span>Bitcoin</span>
          </TabsTrigger>
          <TabsTrigger value="USDT" className="flex items-center gap-2">
            <Image
              src={walletConfig.USDT.image || "/placeholder.svg"}
              alt="Tether"
              width={20}
              height={20}
              className="rounded-full"
              unoptimized
            />
            <span>USDT</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="BTC" className="space-y-4 mt-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <QRCodeSVG value={walletConfig.BTC.address} size={200} className="mx-auto" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={walletConfig.BTC.address}
              readOnly
              className="flex-1 p-2 bg-background rounded-lg border font-mono text-sm"
            />
            <Button onClick={handleCopyAddress} variant="outline" size="sm" disabled={isCopied}>
              {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">Bitcoin Network (BTC)</p>
        </TabsContent>
        <TabsContent value="USDT" className="space-y-4 mt-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <QRCodeSVG value={walletConfig.USDT.address} size={200} className="mx-auto" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={walletConfig.USDT.address}
              readOnly
              className="flex-1 p-2 bg-background rounded-lg border font-mono text-sm"
            />
            <Button onClick={handleCopyAddress} variant="outline" size="sm" disabled={isCopied}>
              {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">ERC20 Network (USDT)</p>
        </TabsContent>
      </Tabs>

      <div className="space-y-2 pt-4 border-t">
        <h4 className="text-sm font-medium">Important Notes</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Only send {currency} to this address</li>
          <li>• Ensure the sender uses the {walletConfig[currency].network}</li>
          <li>• Transactions may take 10-30 minutes to appear in your wallet</li>
          <li>• Contact support if you encounter any issues</li>
        </ul>
      </div>
    </div>
  )
}
