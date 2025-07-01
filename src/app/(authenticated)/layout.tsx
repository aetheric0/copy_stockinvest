// src/app/(authenticated)/layout.tsx
"use client"

import React, { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import MobileBottomNavBar from "@/components/MobileBottomNavBar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { UserProvider } from "@/contexts/user/user-context"
import { TransactionProvider } from "@/contexts/transaction/transaction-context"
import { usePathname } from "next/navigation"
import { getPageTitle } from "@/lib/utils/route-titles"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem={true}>
    <UserProvider>
      <TransactionProvider>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background relative w-full overflow-x-hidden">
            {/* Desktop Sidebar */}
            <AppSidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />

            {/* Desktop Toggle */}
            <div
              className={cn(
                "hidden md:flex fixed top-4 z-50 transition-all duration-300",
                collapsed ? "left-20" : "left-72"
              )}
            >
              <SidebarTrigger onClick={() => setCollapsed(!collapsed)} className="w-8 h-8">
                {collapsed ? <ChevronRight /> : <ChevronLeft />}
              </SidebarTrigger>
            </div>

            {/* Mobile Drawer */}
            {/* <div
              className={cn(
                "fixed inset-0 z-50 md:hidden transform transition-transform duration-300 ease-in-out",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <div className="relative w-[300px] h-full bg-background shadow-xl z-20 overflow-y-auto">
                <AppSidebar collapsed={false} toggleSidebar={() => {}} />
              </div>
              <div className="absolute inset-0 bg-black/50 z-10" onClick={() => setMobileOpen(false)} />
            </div> */}

            {/* Main Content */}
            <main
              className={cn(
                "flex-1 flex flex-col",
                // full width on mobile, but constrain at md+
                "w-full md:max-w-7xl mx-auto",
                // responsive horizontal padding
                "px-4 sm:px-6 lg:px-8",
                "transition-[margin] duration-300"
              )}
            >
              <header className="sticky top-0 bg-background/95 backdrop-blur z-40 border-b flex items-center px-4 py-3 h-16">
                {/* <button
                  className="md:hidden p-2 rounded-full hover:bg-accent transition"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  <Menu className="w-6 h-6" />
                </button> */}
                <h1 className="flex-1 text-xl sm:text-2xl font-semibold text-center md:text-left truncate">
                  {pageTitle || "Dashboard"}
                </h1>
              </header>

              <div className="flex-1 overflow-y-auto py-6">
                {children}
              </div>
            </main>

            <MobileBottomNavBar className="md:hidden" />
          </div>
        </SidebarProvider>
      </TransactionProvider>
    </UserProvider>
    </ThemeProvider>
  )
}
