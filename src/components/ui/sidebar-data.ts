import { Home, PieChart, LineChart, CreditCard, BarChart3, User, LifeBuoy } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type SideBarRoute = {
  title: string
  url: string
  icon: LucideIcon
  section?: "main" | "other"
}

// Main routes - primary navigation items
export const mainRoutes: SideBarRoute[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    section: "main",
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: PieChart,
    section: "main",
  },
  {
    title: "Investments",
    url: "/investments",
    icon: LineChart,
    section: "main",
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: CreditCard,
    section: "main",
  },
]

// Other routes - secondary navigation items
export const otherRoutes: SideBarRoute[] = [
  {
    title: "Markets",
    url: "/markets",
    icon: BarChart3,
    section: "other",
  },
  {
    title: "Account",
    url: "/account",
    icon: User,
    section: "other",
  },
  {
    title: "Support",
    url: "/support",
    icon: LifeBuoy,
    section: "other",
  },
]

// Combined routes for components that need all routes
export const allRoutes = [...mainRoutes, ...otherRoutes]
