"use client"

import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import * as LucideIcons from "lucide-react"
import { GalleryVerticalEnd, type LucideIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

// Get icon component from lucide-react by name
function getIconComponent(iconName?: string): LucideIcon | undefined {
  if (!iconName) return undefined
  const pascalCase = iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
  return (LucideIcons as any)[pascalCase] as LucideIcon | undefined
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  appName: string
  appIcon?: string
  pages?: {
    id: string
    path: string
    label: string
    icon?: string
    children?: {
      id: string
      path: string
      label: string
      icon?: string
    }[]
  }[]
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function AppSidebar({ 
  appName, 
  appIcon, 
  pages = [], 
  user,
  ...props 
}: AppSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Transform pages to nav items format
  const navItems = pages.map((page) => ({
    title: page.label,
    url: page.path,
    icon: getIconComponent(page.icon),
    isActive: location.pathname === page.path || 
              location.pathname.startsWith(page.path + "/") ||
              page.children?.some(child => location.pathname === child.path),
    items: page.children?.map((child) => ({
      title: child.label,
      url: child.path,
    })),
  }))

  // Default user if not provided
  const displayUser = user || {
    name: "Guest User",
    email: "guest@example.com",
    avatar: "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {appIcon ? (
                  <span className="text-lg">{appIcon}</span>
                ) : (
                  <GalleryVerticalEnd className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{appName}</span>
                <span className="truncate text-xs">Standalone App</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} onNavigate={navigate} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
