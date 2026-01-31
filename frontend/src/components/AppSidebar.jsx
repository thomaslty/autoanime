"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
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
    items: [
      { title: "Main Sources", href: "/rss/sources" },
      { title: "Anime Configs", href: "/rss/anime-configs" }
    ]
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
  const [openMenus, setOpenMenus] = useState({})

  const toggleMenu = (href) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href]
    }))
  }

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
                  <button
                    onClick={() => item.items ? toggleMenu(item.href) : null}
                    className="flex items-center gap-2 w-full hover:bg-sidebar-accent rounded-md py-2 px-2 cursor-pointer"
                  >
                    <item.icon className="size-4" />
                    <span className="font-medium text-sm">{item.title}</span>
                    {item.items && (
                      <ChevronRight
                        className={`ml-auto size-4 transition-transform ${openMenus[item.href] ? "rotate-90" : ""}`}
                      />
                    )}
                  </button>
                  {item.items && openMenus[item.href] && (
                    <SidebarMenu>
                      {item.items.map((sub) => (
                        <SidebarMenuItem key={sub.href}>
                          <SidebarMenuButton asChild isActive={currentPath === sub.href}>
                            <a href={sub.href} className="pl-5">
                              <span>{sub.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  )}
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
