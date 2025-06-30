"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { mainRoutes, otherRoutes } from "@/components/ui/sidebar-data"

interface MobileNavBarProps {
  className?: string
}

export default function MobileBottomNavBar({ className }: MobileNavBarProps) {
  // Track which section dropdown is open
  const [openSection, setOpenSection] = useState<"main" | "other" | null>(null)

  const handleSectionToggle = (section: "main" | "other") => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  // Get the routes for the currently open section
  const openSectionRoutes = openSection === "main" ? mainRoutes : openSection === "other" ? otherRoutes : []

  // Select primary routes to show in the bottom bar (limit to 5 for space)
  const primaryRoutes = [
    mainRoutes[0], // Dashboard
    mainRoutes[1], // Portfolio
    { title: "Main", url: "#", icon: mainRoutes[0].icon, section: "main" as const }, // Main menu toggle
    { title: "Other", url: "#", icon: otherRoutes[0].icon, section: "other" as const }, // Other menu toggle
    otherRoutes[otherRoutes.length - 1], // Support
  ]

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className={cn("fixed bottom-0 left-0 right-0 z-30 bg-background border-t", className)}>
        <div className="flex justify-around items-center p-2 safe-bottom">
          {primaryRoutes.map((item) => {
            const Icon = item.icon

            // Special handling for section toggles
            if (item.title === "Main" || item.title === "Other") {
              return (
                <button
                  key={item.title}
                  onClick={() => handleSectionToggle(item.section as "main" | "other")}
                  className={cn(
                    "p-3 rounded-full hover:bg-accent transition-colors",
                    openSection === item.section && "bg-accent",
                  )}
                >
                  <Icon className="w-6 h-6" />
                </button>
              )
            }

            // Regular navigation items
            return (
              <Link key={item.title} href={item.url} className="p-3 rounded-full hover:bg-accent transition-colors">
                <Icon className="w-6 h-6" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Dropdown Panel */}
      <div
        className={cn(
          "fixed left-0 right-0 bg-background border-t z-30 transition-transform duration-300",
          "bottom-[var(--nav-height)] shadow-lg", // positions the panel above the navbar
          openSection ? "translate-y-0" : "translate-y-[calc(100%+var(--nav-height))]",
        )}
        style={{ "--nav-height": "calc(56px + env(safe-area-inset-bottom))" } as React.CSSProperties}
      >
        <div className="p-2 grid grid-cols-2 gap-2">
          {openSectionRoutes.map((route) => {
            const Icon = route.icon

            return (
              <Link
                key={route.title}
                href={route.url}
                className="flex flex-col items-center rounded-lg gap-2 p-3 hover:bg-accent transition-colors"
                onClick={() => setOpenSection(null)} // Close panel after selection
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs text-center">{route.title}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
