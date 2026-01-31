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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useLocation, useNavigate, Link } from "react-router"
import { Home, Rss, Settings } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
  const navigate = useNavigate()
  const currentPath = location.pathname
  const [openMenus, setOpenMenus] = useState({})

  const toggleMenu = (href) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href]
    }))
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between py-4">
        <span className="text-lg font-bold px-2 group-data-[collapsible=icon]:hidden">AutoAnime</span>
        <SidebarTrigger className="size-7" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                item.items ? (
                  <Collapsible
                    key={item.href}
                    open={openMenus[item.href]}
                    onOpenChange={() => toggleMenu(item.href)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((sub) => (
                            <SidebarMenuSubItem key={sub.href}>
                              <SidebarMenuSubButton asChild isActive={currentPath === sub.href}>
                                <Link to={sub.href}>
                                  <span>{sub.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={currentPath === item.href}
                      onClick={() => navigate(item.href)}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
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
