"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Circle, Wifi, WifiOff } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  const [health, setHealth] = useState(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/health")
        const data = await response.json()
        setHealth(data)
      } catch (err) {
        console.error("Error fetching health:", err)
      }
    }
    fetchHealth()

    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-expand menu when child route is active
  useEffect(() => {
    navItems.forEach(item => {
      if (item.items) {
        const isChildActive = item.items.some(sub => currentPath.startsWith(sub.href))
        if (isChildActive) {
          setOpenMenus(prev => ({ ...prev, [item.href]: true }))
        }
      }
    })
  }, [currentPath])

  const toggleMenu = (href) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href]
    }))
  }

  return (
    <Sidebar collapsible="icon" className="overflow-hidden">
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
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <TooltipProvider>
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {health?.sonarr?.connected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span className="truncate">Sonarr</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{health?.sonarr?.connected ? `Connected (${health.sonarr.version || ''})` : 'Disconnected'}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {health?.qbittorrent?.connected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span className="truncate">qBittorrent</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{health?.qbittorrent?.connected ? `Connected (${health.qbittorrent.version || ''})` : 'Disconnected'}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {health?.database === 'connected' ? (
                    <Circle className="h-3 w-3 text-green-500 fill-green-500" />
                  ) : (
                    <Circle className="h-3 w-3 text-red-500 fill-red-500" />
                  )}
                  <span className="truncate">Database</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{health?.database === 'connected' ? 'Connected' : 'Disconnected'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar }
