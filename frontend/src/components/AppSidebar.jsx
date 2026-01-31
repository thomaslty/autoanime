"use client"

import * as Collapsible from "@radix-ui/react-collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useLocation } from "react-router"
import { Home, Rss, Settings } from "lucide-react"

const navItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "RSS Management",
    href: "/rss",
    icon: Rss,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
]

function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between py-4">
        <span className="text-lg font-bold px-2">AutoAnime</span>
        <SidebarTrigger className="size-7" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={currentPath === item.href}>
                    <a href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

export { AppSidebar }
