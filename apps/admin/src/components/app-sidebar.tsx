"use client"

import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Home,
  LayoutGrid,
  Folder,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { useRegistry, type MenuItemConfig } from "@nexoc/core"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Sample data
const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "https://github.com/shadcn.png",
  },
  teams: [
    {
      name: "Nexo Platform",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Development",
      logo: AudioWaveform,
      plan: "Dev",
    },
    {
      name: "Production",
      logo: Command,
      plan: "Prod",
    },
  ],
}

// Platform menus
const platformMenus = [
  { id: "home", title: "Home", url: "/", icon: Home },
  { id: "apps", title: "Apps", url: "/apps", icon: LayoutGrid },
]

// Render icon - handles React nodes, strings (emoji), and null
function renderIcon(icon: React.ReactNode): React.ReactNode {
  // Handle emoji strings
  if (typeof icon === "string") {
    return <span className="text-base">{icon}</span>
  }
  // Handle React elements (lucide icons)
  if (React.isValidElement(icon)) {
    return icon
  }
  // Fallback
  return <Folder className="h-4 w-4" />
}

// Menu item component with children support
function MenuItem({ 
  menu, 
  isActive, 
  onNavigate 
}: { 
  menu: MenuItemConfig
  isActive: boolean
  onNavigate: (path: string) => void
}) {
  const hasChildren = menu.children && menu.children.length > 0

  if (hasChildren) {
    return (
      <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={menu.label}>
              {renderIcon(menu.icon)}
              <span>{menu.label}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {menu.children!.map((child) => (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton
                    asChild
                    onClick={() => onNavigate(child.path)}
                  >
                    <span className="cursor-pointer">
                      {renderIcon(child.icon)}
                      <span>{child.label}</span>
                    </span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={menu.label}
        isActive={isActive}
        onClick={() => onNavigate(menu.path)}
      >
        {renderIcon(menu.icon)}
        <span>{menu.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { menus } = useRegistry()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Platform Menus */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {platformMenus.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={location.pathname === item.url}
                  onClick={() => navigate(item.url)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Dynamic Modules */}
        {menus.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Modules</SidebarGroupLabel>
            <SidebarMenu>
              {menus.map((menu) => (
                <MenuItem
                  key={menu.id}
                  menu={menu}
                  isActive={location.pathname.startsWith(menu.path)}
                  onNavigate={navigate}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
