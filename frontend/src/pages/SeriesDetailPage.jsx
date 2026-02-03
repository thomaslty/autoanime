import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router"
import { Layout } from "../components/Layout"
import { SeasonCard } from "../components/SeasonCard"
import { ArrowLeft, RefreshCw, Settings, AlertCircle, WifiOff, Download, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

const AutoDownloadStatus = {
  DISABLED: 0,
  PENDING: 1,
  DOWNLOADING: 2,
  DOWNLOADED: 3,
  FAILED: 4,
  SKIPPED: 5
}

function getStatusLabel(status) {
  switch (status) {
    case AutoDownloadStatus.DOWNLOADING:
      return "Downloading"
    case AutoDownloadStatus.PENDING:
      return "Pending"
    case AutoDownloadStatus.DOWNLOADED:
      return "Downloaded"
    case AutoDownloadStatus.FAILED:
      return "Failed"
    case AutoDownloadStatus.SKIPPED:
      return "Skipped"
    case AutoDownloadStatus.DISABLED:
    default:
      return "Disabled"
  }
}

export function SeriesDetailPage() {
  const { id } = useParams()
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)
  const [downloadStatus, setDownloadStatus] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
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

    const fetchSeries = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/sonarr/series/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch series")
        }
        const data = await response.json()
        setSeries(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchDownloadStatus = async () => {
      try {
        const response = await fetch(`/api/sonarr/series/${id}/auto-download-status`)
        if (response.ok) {
          const data = await response.json()
          setDownloadStatus(data)
        }
      } catch (err) {
        console.error("Error fetching download status:", err)
      }
    }

    fetchHealth()
    fetchSeries()
    fetchDownloadStatus()
  }, [id])

  const getServiceError = () => {
    if (!health) return null
    if (!health.sonarr?.connected) {
      return {
        title: "Sonarr Not Configured",
        message: health.sonarr?.error || "Sonarr is not configured or unreachable. Please configure your Sonarr connection to view series details.",
        service: "Sonarr"
      }
    }
    return null
  }

  const handleRefresh = async () => {
    try {
      await fetch(`/api/sonarr/series/${id}/refresh`, { method: "POST" })
    } catch (err) {
      console.error("Error triggering refresh:", err)
    }
  }

  const handleToggleSeriesAutoDownload = async (enabled) => {
    try {
      const response = await fetch(`/api/sonarr/series/${id}/auto-download`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(prev => ({ ...prev, isAutoDownloadEnabled: enabled, downloadStatus: enabled ? AutoDownloadStatus.PENDING : AutoDownloadStatus.DISABLED }))
        setDownloadStatus(data.downloadStatus)
      }
    } catch (err) {
      console.error("Error toggling series auto-download:", err)
    }
  }

  const handleToggleSeasonAutoDownload = async (seasonNumber, enabled) => {
    try {
      const response = await fetch(`/api/sonarr/series/${id}/seasons/${seasonNumber}/auto-download`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(prev => ({
          ...prev,
          seasons: prev.seasons.map(s =>
            s.seasonNumber === seasonNumber
              ? { ...s, isAutoDownloadEnabled: enabled, autoDownloadStatus: enabled ? AutoDownloadStatus.PENDING : AutoDownloadStatus.DISABLED }
              : s
          ),
          episodes: prev.episodes.map(e =>
            e.seasonNumber === seasonNumber
              ? { ...e, isAutoDownloadEnabled: enabled, autoDownloadStatus: enabled ? AutoDownloadStatus.PENDING : AutoDownloadStatus.DISABLED }
              : e
          )
        }))
      }
    } catch (err) {
      console.error("Error toggling season auto-download:", err)
    }
  }

  const handleToggleEpisodeAutoDownload = async (episodeId, enabled) => {
    try {
      const response = await fetch(`/api/sonarr/series/${id}/episodes/${episodeId}/auto-download`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(prev => ({
          ...prev,
          episodes: prev.episodes.map(e =>
            e.id === episodeId
              ? { ...e, isAutoDownloadEnabled: enabled, autoDownloadStatus: enabled ? AutoDownloadStatus.PENDING : AutoDownloadStatus.DISABLED }
              : e
          )
        }))
      }
    } catch (err) {
      console.error("Error toggling episode auto-download:", err)
    }
  }

  const serviceError = getServiceError()

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen text-muted-foreground">
          Loading...
        </div>
      </Layout>
    )
  }

  if (serviceError) {
    return (
      <Layout>
        <div className="p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Library</span>
          </Link>
          <Alert variant="destructive">
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
      </Layout>
    )
  }

  if (error || !series) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 rounded-lg">
            Error: {error || "Series not found"}
          </div>
        </div>
      </Layout>
    )
  }

  const posterUrl = series.posterPath || null
  const isAutoDownloadEnabled = series.isAutoDownloadEnabled

  return (
    <Layout>
      <div className="p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Library</span>
        </Link>

        <div className="flex gap-8">
          <div className="flex-shrink-0">
            <Card className="w-64 overflow-hidden py-0">
              <div className="aspect-[2/3]">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={series.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 150'%3E%3Crect fill='%23333' width='100' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='12'%3ENo Poster%3C/text%3E%3C/svg%3E"
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No Poster</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-sm text-muted-foreground">Auto Download</span>
                  <Switch
                    checked={isAutoDownloadEnabled}
                    onCheckedChange={handleToggleSeriesAutoDownload}
                  />
                </div>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw size={18} className="mr-2" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {/* Calculate monitored seasons episode count */}
            {(() => {
              const monitoredSeasons = series.seasons?.filter(s => s.monitored) || []
              const monitoredEpisodeCount = monitoredSeasons.reduce((sum, s) => sum + (s.episodeFileCount || 0), 0)
              const totalMonitoredEpisodes = monitoredSeasons.reduce((sum, s) => sum + (s.totalEpisodeCount || 0), 0)

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-sm">Status</p>
                      <p className="font-medium">{series.status || "Unknown"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-sm">Seasons</p>
                      <p className="font-medium">{series.seasonCount || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-sm">Episodes</p>
                      <p className="font-medium">{monitoredEpisodeCount}/{totalMonitoredEpisodes}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-sm">Monitored</p>
                      <p className="font-medium">{series.monitored ? "Yes" : "No"}</p>
                    </CardContent>
                  </Card>
                </div>
              )
            })()}

            {/* AutoAnime Status Card */}
            {downloadStatus && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    AutoAnime Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{downloadStatus.enabledCount}</p>
                      <p className="text-xs text-muted-foreground">Enabled</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">{downloadStatus.downloadedCount}</p>
                      <p className="text-xs text-muted-foreground">Downloaded</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">{downloadStatus.downloadingCount}</p>
                      <p className="text-xs text-muted-foreground">Downloading</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-500">{downloadStatus.pendingCount}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{downloadStatus.failedCount}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                  {isAutoDownloadEnabled && downloadStatus.totalEpisodes > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Overall Progress
                        </span>
                        <span className="font-medium">
                          {Math.round((downloadStatus.downloadedCount / downloadStatus.totalEpisodes) * 100)}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${(downloadStatus.downloadedCount / downloadStatus.totalEpisodes) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {series.overview && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm mb-2">Overview</p>
                  <p>{series.overview}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Season/Episode List */}
        {series.seasons && series.seasons.length > 0 && series.episodes && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Seasons & Episodes</h2>
            {series.seasons
              .filter(s => s.monitored)
              .sort((a, b) => a.seasonNumber - b.seasonNumber)
              .map(season => (
                <SeasonCard
                  key={season.id}
                  season={season}
                  episodes={series.episodes.filter(e => e.seasonNumber === season.seasonNumber)}
                  seriesId={parseInt(id)}
                  onToggleSeasonAutoDownload={handleToggleSeasonAutoDownload}
                  onToggleEpisodeAutoDownload={handleToggleEpisodeAutoDownload}
                />
              ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
