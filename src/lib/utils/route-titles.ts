import { type SideBarRoute, allRoutes } from "@/components/ui/sidebar-data"

// Since our routes are now flat, we don't need to flatten them
// but we'll keep the function for consistency and future flexibility
const flattenRoutes = (routes: SideBarRoute[]): Array<{ path: string; title: string }> => {
  return routes.map((route) => ({
    path: route.url,
    title: route.title,
  }))
}

// Combine all routes for the page title lookup
const routeTitles = flattenRoutes(allRoutes)

export const getPageTitle = (pathname: string): string => {
  // Exact match for full path
  const exactMatch = routeTitles.find((route) => route.path === pathname)
  if (exactMatch) return exactMatch.title

  // Partial match for nested routes (e.g., /portfolio/123/analytics)
  const baseMatch = routeTitles.find((route) => pathname.startsWith(route.path + "/") || route.path === pathname)

  return baseMatch?.title || formatPathnameFallback(pathname)
}

const formatPathnameFallback = (pathname: string): string => {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/-/g, " "))
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" → ")
}
