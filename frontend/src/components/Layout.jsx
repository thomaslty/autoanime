import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { getSocket } from "../hooks/useSocket"

export function Layout({ children }) {
  const [disconnected, setDisconnected] = useState([])

  useEffect(() => {
    // Fetch initial status
    const fetchHealth = async () => {
      try {
        const response = await fetch("/health")
        const data = await response.json()
        updateDisconnected(data)
      } catch (err) {
        // Backend itself is down
        setDisconnected(["Backend"])
      }
    }
    fetchHealth()

    // Real-time updates via WebSocket
    const socket = getSocket()
    const handleStatus = (status) => updateDisconnected(status)
    socket.on('services:status', handleStatus)
    return () => socket.off('services:status', handleStatus)
  }, [])

  const updateDisconnected = (status) => {
    const down = []
    if (status.database && status.database !== 'connected') down.push('Database')
    if (status.sonarr && !status.sonarr.connected) down.push('Sonarr')
    if (status.qbittorrent && !status.qbittorrent.connected) down.push('qBittorrent')
    setDisconnected(down)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {disconnected.length > 0 && (
          <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {disconnected.join(', ')} {disconnected.length === 1 ? 'is' : 'are'} disconnected
            </AlertDescription>
          </Alert>
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
