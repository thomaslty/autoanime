import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router"
import { Layout } from "../components/Layout"
import { SeasonCard } from "../components/SeasonCard"
import { ArrowLeft, RefreshCw, Settings, AlertCircle, WifiOff, Download, Rss, ChevronDown, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

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
  const [seriesRssConfigId, setSeriesRssConfigId] = useState("")
  const [seasonRssConfigs, setSeasonRssConfigs] = useState({})
  const [savingRss, setSavingRss] = useState(false)
  const [resettingRss, setResettingRss] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewData, setPreviewData] = useState([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [applyingMatches, setApplyingMatches] = useState(false)
  const [previewSearch, setPreviewSearch] = useState("")
  const [previewSort, setPreviewSort] = useState({ field: 'seasonNumber', dir: 'desc' })
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

  const openRssModal = async () => {
    try {
      const configsRes = await fetch("/api/rss-config")
      if (configsRes.ok) {
        setRssConfigs(await configsRes.json())
      }
      // Initialize from current series data
      setSeriesRssConfigId(series?.rssConfigId ? String(series.rssConfigId) : "none")
      const seasonMap = {}
      if (series?.seasons) {
        for (const s of series.seasons) {
          if (s.rssConfigId) seasonMap[s.seasonNumber] = String(s.rssConfigId)
        }
      }
      setSeasonRssConfigs(seasonMap)
      setShowRssModal(true)
    } catch (err) {
      console.error("Error loading RSS configs:", err)
    }
  }

  const handleSaveRssConfig = async () => {
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

  const handleResetRssMatches = async () => {
    if (!confirm("Are you sure you want to reset all RSS matches? This will clear the link between episodes and RSS items.")) return

    setResettingRss(true)
    try {
      const response = await fetch(`/api/sonarr/series/${id}/rss-matches/reset`, { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to reset RSS matches")
      }
      // Refresh series data to reflect changes if any (though primarily affects episodes table)
      handleRefresh()
    } catch (err) {
      console.error("Error resetting RSS matches:", err)
    } finally {
      setResettingRss(false)
    }
  }

  const fetchPreviewData = async () => {
    setPreviewLoading(true)
    try {
      const response = await fetch(`/api/rss-config/preview/series/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPreviewData(data.data || [])
      } else {
        console.error("Failed to fetch preview")
        setPreviewData([])
      }
    } catch (err) {
      console.error("Error fetching preview:", err)
      setPreviewData([])
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleApplyMatches = async () => {
    if (!confirm("Are you sure you want to apply these RSS matches to the episodes? This will update the database.")) return

    setApplyingMatches(true)
    try {
      const response = await fetch(`/api/rss-config/preview/series/${id}/apply`, { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to apply matches")
      }
      const data = await response.json()
      // Refresh preview to show updated status
      fetchPreviewData()
      // Also refresh series data to keep everything in sync
      handleRefresh()
      // Optional: Show success message or toast
    } catch (err) {
      console.error("Error applying matches:", err)
    } finally {
      setApplyingMatches(false)
    }
  }

  const openPreviewModal = () => {
    setShowPreviewModal(true)
  }

  useEffect(() => {
    if (showPreviewModal) {
      fetchPreviewData()
    }
  }, [showPreviewModal])

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
                    <DropdownMenuItem onClick={openPreviewModal}>
                      <Eye size={16} className="mr-2" />
                      Preview RSS Matches
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

      {/* RSS Config Modal */}
      <Dialog open={showRssModal} onOpenChange={setShowRssModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rss size={18} />
              Configure RSS Filter
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Series-level RSS Config</Label>
              <Select value={seriesRssConfigId} onValueChange={setSeriesRssConfigId}>
                <SelectTrigger>
                  <SelectValue placeholder="No config (disabled)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No config</SelectItem>
                  {rssConfigs.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Applied to all seasons unless overridden</p>
            </div>

            {series?.seasons?.filter(s => s.monitored).length > 0 && (
              <div className="space-y-3">
                <Label>Per-Season Overrides</Label>
                {series.seasons
                  .filter(s => s.monitored)
                  .sort((a, b) => b.seasonNumber - a.seasonNumber)
                  .map(season => (
                    <div key={season.seasonNumber} className="flex items-center gap-3">
                      <span className="text-sm w-24 shrink-0">
                        {season.seasonNumber === 0 ? "Specials" : `Season ${season.seasonNumber}`}
                      </span>
                      <Select
                        value={seasonRssConfigs[season.seasonNumber] || "none"}
                        onValueChange={(value) => setSeasonRssConfigs(prev => ({
                          ...prev,
                          [season.seasonNumber]: value
                        }))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Use series config" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Use series config</SelectItem>
                          {rssConfigs.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex w-full justify-between items-center">
              <Button variant="destructive" size="sm" onClick={handleResetRssMatches} disabled={resettingRss}>
                {resettingRss ? "Resetting..." : "Reset Matches"}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowRssModal(false)}>Cancel</Button>
                <Button onClick={handleSaveRssConfig} disabled={savingRss}>
                  {savingRss ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RSS Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="sm:max-w-[70vw] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={18} />
                RSS Preview - Episode Matches
              </div>
              <Button variant="outline" size="sm" onClick={fetchPreviewData} disabled={previewLoading}>
                <RefreshCw size={14} className={`mr-2 ${previewLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col py-4">
            <div className="mb-4">
              <Input
                placeholder="Search episodes or RSS items..."
                value={previewSearch}
                onChange={(e) => setPreviewSearch(e.target.value)}
              />
            </div>
            {previewLoading ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Loading preview...
              </div>
            ) : previewData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No episodes found or no RSS config assigned
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => setPreviewSort({ field: 'seasonNumber', dir: previewSort.field === 'seasonNumber' && previewSort.dir === 'asc' ? 'desc' : 'asc' })}
                      >
                        Season {previewSort.field === 'seasonNumber' && (previewSort.dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => setPreviewSort({ field: 'episodeNumber', dir: previewSort.field === 'episodeNumber' && previewSort.dir === 'asc' ? 'desc' : 'asc' })}
                      >
                        Episode {previewSort.field === 'episodeNumber' && (previewSort.dir === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Episode Title</TableHead>
                      <TableHead>Current RSS</TableHead>
                      <TableHead>Preview Match</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData
                      .filter(item =>
                        previewSearch === "" ||
                        (item.episodeTitle && item.episodeTitle.toLowerCase().includes(previewSearch.toLowerCase())) ||
                        (item.rssItemTitle && item.rssItemTitle.toLowerCase().includes(previewSearch.toLowerCase()))
                      )
                      .sort((a, b) => {
                        let av = a[previewSort.field]
                        let bv = b[previewSort.field]
                        if (previewSort.field === 'episodeNumber') {
                          av = Number(av) || 0
                          bv = Number(bv) || 0
                        }
                        if (av < bv) return previewSort.dir === 'asc' ? -1 : 1
                        if (av > bv) return previewSort.dir === 'asc' ? 1 : -1
                        return 0
                      })
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>S{item.seasonNumber}</TableCell>
                          <TableCell>E{item.episodeNumber}</TableCell>
                          <TableCell className="max-w-md truncate">{item.episodeTitle || "-"}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {item.currentRssItemTitle ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help text-blue-600 truncate block">{item.currentRssItemTitle}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{item.currentRssItemTitle}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">None</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {item.rssItemTitle ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help text-green-600 truncate block">{item.rssItemTitle}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{item.rssItemTitle}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">No match</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.rssItemTitle && item.rssItemTitle !== item.currentRssItemTitle ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">New Match</Badge>
                            ) : item.currentRssItemTitle && !item.rssItemTitle ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Will Unlink</Badge>
                            ) : item.rssItemTitle ? (
                              <Badge variant="outline" className="text-muted-foreground">Unchanged</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {previewData.filter(i => i.rssItemTitle && i.rssItemTitle !== i.currentRssItemTitle).length} new matches found
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>Close</Button>
              <Button onClick={handleApplyMatches} disabled={applyingMatches || previewLoading || previewData.length === 0}>
                {applyingMatches ? "Applying..." : "Apply Matches"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
