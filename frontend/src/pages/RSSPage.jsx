import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Layout } from "../components/Layout"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Settings, AlertCircle, WifiOff, Loader2 } from "lucide-react"

export function RSSPage() {
  const navigate = useNavigate()
  const [health, setHealth] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/health")
        if (response.ok) {
          const data = await response.json()
          setHealth(data)
        }
      } catch (err) {
        console.error("Error fetching health:", err)
      } finally {
        setChecking(false)
      }
    }
    checkHealth()
  }, [])

  useEffect(() => {
    if (!checking && health?.sonarr?.connected) {
      navigate("/rss/sources", { replace: true })
    }
  }, [checking, health, navigate])

  if (checking) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Checking service status...
        </div>
      </Layout>
    )
  }

  if (!health?.sonarr?.connected) {
    return (
      <Layout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              Sonarr Not Configured
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                {health?.sonarr?.error || "Sonarr is not configured or unreachable. RSS management requires Sonarr to be properly configured."}
              </p>
              <Button onClick={() => navigate("/settings")} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure Now
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    )
  }

  return null
}
