import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router"
import { Layout } from "../components/Layout"
import { SeasonCard } from "../components/SeasonCard"
import { ArrowLeft, RefreshCw, Settings, AlertCircle, WifiOff, Download, Rss, ChevronDown, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { RssFilterDialog } from "@/components/dialogs/RssFilterDialog"
import { RssMatchesDialog } from "@/components/dialogs/RssMatchesDialog"
// WebSocket-based hook disabled — using polling instead
// import { useDownloadStatus } from "@/hooks/useDownloadStatus"
import { useDownloadPolling } from "@/hooks/useDownloadPolling"

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
  const [showRssModal, setShowRssModal] = useState(false)
  const [rssConfigs, setRssConfigs] = useState([])
  const [savingRss, setSavingRss] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingSeries, setDeletingSeries] = useState(false)
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

    fetchHealth()
    fetchSeries()
  }, [id])

  // Map backend status names to frontend AutoDownloadStatus enum values
  const statusNameToEnum = {
    PENDING: AutoDownloadStatus.PENDING,
    DOWNLOADING: AutoDownloadStatus.DOWNLOADING,
    DOWNLOADED: AutoDownloadStatus.DOWNLOADED,
    FAILED: AutoDownloadStatus.FAILED,
  }

  // WebSocket-based handler disabled — using polling instead
  // const handleDownloadUpdate = useCallback((data) => {
  //   if (!data?.episodes) return
  //   setSeries(prev => {
  //     if (!prev) return prev
  //     const updatedEpisodeIds = new Set(data.episodes.map(e => e.episodeId))
  //     const episodeUpdateMap = {}
  //     for (const ep of data.episodes) { episodeUpdateMap[ep.episodeId] = ep }
  //     return {
  //       ...prev,
  //       episodes: prev.episodes.map(e => {
  //         if (!updatedEpisodeIds.has(e.id)) return e
  //         const update = episodeUpdateMap[e.id]
  //         return {
  //           ...e,
  //           autoDownloadStatus: statusNameToEnum[update.downloadStatusName] ?? e.autoDownloadStatus,
  //           hasFile: update.downloadStatusName === 'DOWNLOADED' ? true : e.hasFile,
  //         }
  //       })
  //     }
  //   })
  //   fetch(`/api/sonarr/series/${id}/auto-download-status`)
  //     .then(res => res.ok ? res.json() : null)
  //     .then(statusData => { if (statusData) setDownloadStatus(statusData) })
  //     .catch(() => {})
  // }, [id])
  // useDownloadStatus(id, handleDownloadUpdate)

  // Polling-based download status updates
  const handlePollingUpdate = useCallback((data) => {
    if (!data?.episodes) return

    // Update episode-level autoDownloadStatus in series state
    setSeries(prev => {
      if (!prev) return prev
      const episodeUpdateMap = {}
      for (const ep of data.episodes) {
        episodeUpdateMap[ep.episodeId] = ep
      }

      return {
        ...prev,
        episodes: prev.episodes.map(e => {
          const update = episodeUpdateMap[e.id]
          if (!update) return e
          return {
            ...e,
            autoDownloadStatus: statusNameToEnum[update.downloadStatusName] ?? e.autoDownloadStatus,
            hasFile: update.hasFile ?? e.hasFile,
            downloadProgress: update.progress != null ? parseFloat(update.progress) : e.downloadProgress,
          }
        })
      }
    })

    // Update aggregated download status counts from the same response
    if (data.summary) {
      setDownloadStatus(data.summary)
    }
  }, [])

  useDownloadPolling(id, handlePollingUpdate)

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

  const openRssModal = async () => {
    try {
      const configsRes = await fetch("/api/rss-config")
      if (configsRes.ok) {
        setRssConfigs(await configsRes.json())
      }
      setShowRssModal(true)
    } catch (err) {
      console.error("Error loading RSS configs:", err)
    }
  }

  const handleSaveRssConfig = async ({ seriesRssConfigId, seasonRssConfigs }) => {
    setSavingRss(true)
    try {
      // Save series-level config
      await fetch(`/api/sonarr/series/${id}/rss-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rssConfigId: seriesRssConfigId && seriesRssConfigId !== "none" ? parseInt(seriesRssConfigId) : null })
      })

      // Save per-season overrides
      const monitoredSeasons = series?.seasons?.filter(s => s.monitored) || []
      for (const season of monitoredSeasons) {
        const configId = seasonRssConfigs[season.seasonNumber]
        await fetch(`/api/sonarr/series/${id}/seasons/${season.seasonNumber}/rss-config`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rssConfigId: configId && configId !== "none" ? parseInt(configId) : null })
        })
      }

      // Refresh series data
      const response = await fetch(`/api/sonarr/series/${id}`)
      if (response.ok) {
        setSeries(await response.json())
      }
      setShowRssModal(false)
    } catch (err) {
      console.error("Error saving RSS config:", err)
    } finally {
      setSavingRss(false)
    }
  }

  const handleDeleteSeries = async () => {
    setDeletingSeries(true)
    try {
      const response = await fetch(`/api/sonarr/series/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) {
        throw new Error("Failed to delete series")
      }
      navigate("/")
    } catch (err) {
      console.error("Error deleting series:", err)
    } finally {
      setDeletingSeries(false)
      setShowDeleteConfirm(false)
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
                {series.rssConfigId && (
                  <Badge variant="outline" className="gap-1">
                    <Rss size={12} />
                    RSS Configured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-sm text-muted-foreground">Auto Download</span>
                  <Switch
                    checked={isAutoDownloadEnabled}
                    onCheckedChange={handleToggleSeriesAutoDownload}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions
                      <ChevronDown size={16} className="ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleRefresh}>
                      <RefreshCw size={16} className="mr-2" />
                      Refresh
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openRssModal}>
                      <Rss size={16} className="mr-2" />
                      Configure RSS
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowPreviewModal(true)}>
                      <Eye size={16} className="mr-2" />
                      Configure RSS Matches
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive focus:text-destructive">
                      <Trash2 size={16} className="mr-2 text-destructive" />
                      Delete Series
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              .sort((a, b) => b.seasonNumber - a.seasonNumber)
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

      <RssFilterDialog
        open={showRssModal}
        onOpenChange={setShowRssModal}
        series={series}
        rssConfigs={rssConfigs}
        initialSeriesConfigId={series?.rssConfigId ? String(series.rssConfigId) : "none"}
        initialSeasonConfigs={(() => {
          const map = {}
          if (series?.seasons) {
            for (const s of series.seasons) {
              if (s.rssConfigId) map[s.seasonNumber] = String(s.rssConfigId)
            }
          }
          return map
        })()}
        onSave={handleSaveRssConfig}
        saving={savingRss}
      />

      <RssMatchesDialog
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        seriesId={id}
        onRefreshSeries={handleRefresh}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Series"
        description={`Are you sure you want to delete "${series?.title}"? This will permanently remove the series and all related data including episodes, seasons, downloads, and metadata. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteSeries}
        loading={deletingSeries}
        loadingLabel="Deleting..."
      />
    </Layout>
  )
}
