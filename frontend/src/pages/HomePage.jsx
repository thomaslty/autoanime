import { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { PosterBoard } from "../components/PosterBoard"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Settings, AlertCircle, WifiOff } from "lucide-react"

export function HomePage() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)
  const navigate = useNavigate()

  const fetchSeries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/sonarr/series")
      if (!response.ok) {
        throw new Error("Failed to fetch series")
      }
      const data = await response.json()
      setSeries(data)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching series:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      await fetch("/api/sonarr/sync", { method: "POST" })
      await fetchSeries()
    } catch (err) {
      console.error("Error syncing:", err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    fetchSeries()
  }, [])

  const fetchHealth = async () => {
    try {
      const response = await fetch("/health")
      if (response.ok) {
        const data = await response.json()
        setHealth(data)
      }
    } catch (err) {
      console.error("Error fetching health:", err)
    }
  }

  const handleSeriesClick = (series) => {
    navigate(`/series/${series.id}`)
  }
  const getServiceError = () => {
    if (!health) return null
    if (!health.sonarr?.connected) {
      return {
        title: "Sonarr Not Configured",
        message: health.sonarr?.error || "Sonarr is not configured or unreachable. Please configure your Sonarr connection to view your anime library.",
        service: "Sonarr"
      }
    }
    if (!health.qbittorrent?.connected) {
      return {
        title: "qBittorrent Not Configured",
        message: health.qbittorrent?.error || "qBittorrent is not configured or unreachable. Some features may be limited.",
        service: "qBittorrent"
      }
    }
    return null
  }

  const serviceError = getServiceError()

  return (
    <Layout>
      <div className="min-h-screen">
        {serviceError && (
          <div className="p-6">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                {serviceError.title}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">{serviceError.message}</p>
                <Button onClick={() => navigate("/settings")} variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Now
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        {error && !serviceError && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 m-6 rounded-lg">
            Error: {error}
          </div>
        )}
        <PosterBoard
          series={series}
          onSeriesClick={handleSeriesClick}
          loading={loading}
          onRefresh={handleRefresh}
        />
      </div>
    </Layout>
  )
}
