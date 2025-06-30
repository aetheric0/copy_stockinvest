"use client"
import type { ReactElement } from "react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/contexts/user/user-context"
import { cn } from "@/lib/utils"
import { type SideBarRoute, mainRoutes, otherRoutes } from "./ui/sidebar-data"
import { useEffect, useState } from "react"

type AppSidebarProps = {
  collapsed: boolean
  className?: string
  toggleSidebar?: () => void
}

type UserProfileProps = {
  collapsed: boolean
  user?: { username?: string } | null
}

const UserProfile = ({ collapsed, user }: UserProfileProps) => {
  const username = user?.username || "User"
  const initial = username[0].toUpperCase()
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    // Load profile image from localStorage
    const savedImage = localStorage.getItem("profileImage")
    if (savedImage) {
      setProfileImage(savedImage)
    }
  }, [])

  return (
    <div className="flex flex-1 items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={profileImage || undefined} />
        <AvatarFallback className="bg-blue-500 text-white">
          {collapsed ? initial : <span className="text-sm">{initial}</span>}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{username}</span>
          <span className="text-xs text-muted-foreground">@{username.toLowerCase()}</span>
        </div>
      )}
    </div>
  )
}

const MenuItemContent = ({ entry, collapsed }: { entry: SideBarRoute; collapsed: boolean }): ReactElement => {
  const Icon = entry.icon

  return (
    <>
      {Icon && <Icon className={collapsed ? "w-6 h-6" : "w-5 h-5"} />}
      {!collapsed && <span>{entry.title}</span>}
    </>
  )
}

export function AppSidebar({ collapsed, className, toggleSidebar }: AppSidebarProps) {
  const { user, loading, error } = useUser()

  const renderRoutes = (routes: SideBarRoute[]) => {
    return routes.map((route) => (
      <SidebarMenuItem key={route.title} className="p-2">
        <SidebarMenuButton asChild>
          <Link href={route.url} className="flex items-center gap-2">
            <MenuItemContent entry={route} collapsed={collapsed} />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))
  }

  return (
    <Sidebar
      style={{ overflow: "visible" }}
      className={cn(`${collapsed ? "w-[80px]" : "w-[300px]"} transition-all duration-300`, "bg-background", className)}
    >
      <SidebarHeader className="relative flex overflow-visible items-center justify-between mt-4 mb-4 px-4">
        {loading ? (
          <div className="animate-pulse h-8 w-8 rounded-full bg-gray-200" />
        ) : error ? (
          <span className="text-red-500">⚠️</span>
        ) : (
          <UserProfile collapsed={collapsed} user={user || undefined} />
        )}
      </SidebarHeader>

      <SidebarSeparator className="my-2" />

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Main</SidebarGroupLabel>}
          <SidebarMenu>{renderRoutes(mainRoutes)}</SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Other</SidebarGroupLabel>}
          <SidebarMenu>{renderRoutes(otherRoutes)}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t mt-auto">
        {!collapsed && (
          <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">© 2025 Your Company</div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
