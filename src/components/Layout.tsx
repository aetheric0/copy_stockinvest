"use client"

import type React from "react"

import { useState } from "react"
import { AppSidebar } from "./AppSidebar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center h-16 px-4 border-b">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
