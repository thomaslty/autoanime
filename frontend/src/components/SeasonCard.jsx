import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, CheckCircle2, Clock, AlertCircle, FileVideo, Eye, Download, XCircle, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

const AutoDownloadStatus = {
  DISABLED: 0,
  PENDING: 1,
  DOWNLOADING: 2,
  DOWNLOADED: 3,
  FAILED: 4,
  SKIPPED: 5
}

function getStatusIcon(status, hasFile) {
  if (hasFile) return <CheckCircle2 className="h-4 w-4 text-green-500" />

  switch (status) {
    case AutoDownloadStatus.DOWNLOADING:
      return <Download className="h-4 w-4 text-blue-500" />
    case AutoDownloadStatus.PENDING:
      return <Clock className="h-4 w-4 text-yellow-500" />
    case AutoDownloadStatus.FAILED:
      return <XCircle className="h-4 w-4 text-red-500" />
    case AutoDownloadStatus.SKIPPED:
      return <SkipForward className="h-4 w-4 text-gray-500" />
    case AutoDownloadStatus.DISABLED:
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusText(status, hasFile) {
  if (hasFile) return "Downloaded"

  switch (status) {
    case AutoDownloadStatus.DOWNLOADING:
      return "Downloading"
    case AutoDownloadStatus.PENDING:
      return "Pending"
    case AutoDownloadStatus.FAILED:
      return "Failed"
    case AutoDownloadStatus.SKIPPED:
      return "Skipped"
    case AutoDownloadStatus.DISABLED:
    default:
      return "Not Monitored"
  }
}

function getAggregatedStatus(episodes) {
  if (episodes.length === 0) return AutoDownloadStatus.DISABLED

  const enabledEpisodes = episodes.filter(e => e.isAutoDownloadEnabled)
  if (enabledEpisodes.length === 0) return AutoDownloadStatus.DISABLED

  const statusCounts = {}
  enabledEpisodes.forEach(e => {
    const status = e.autoDownloadStatus || AutoDownloadStatus.PENDING
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

  if (statusCounts[AutoDownloadStatus.DOWNLOADING] > 0) {
    return AutoDownloadStatus.DOWNLOADING
  } else if (statusCounts[AutoDownloadStatus.PENDING] > 0) {
    return AutoDownloadStatus.PENDING
  } else if (statusCounts[AutoDownloadStatus.FAILED] > 0) {
    return AutoDownloadStatus.FAILED
  } else if (statusCounts[AutoDownloadStatus.DOWNLOADED] === enabledEpisodes.length) {
    return AutoDownloadStatus.DOWNLOADED
  } else if (statusCounts[AutoDownloadStatus.SKIPPED] > 0) {
    return AutoDownloadStatus.SKIPPED
  }

  return AutoDownloadStatus.DISABLED
}

function EpisodeRow({ episode, seriesId, onToggleAutoDownload }) {
  const hasFile = episode.hasFile
  const isMonitored = episode.monitored
  const isAutoDownloadEnabled = episode.isAutoDownloadEnabled
  const status = episode.autoDownloadStatus || AutoDownloadStatus.DISABLED

  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-3 border-b last:border-b-0",
      !isMonitored && "opacity-60"
    )}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground w-8">
          E{episode.episodeNumber}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium line-clamp-1">
            {episode.title || `Episode ${episode.episodeNumber}`}
          </span>
          {episode.airDate && (
            <span className="text-xs text-muted-foreground">
              {new Date(episode.airDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(status, hasFile)}
          <span className="text-xs text-muted-foreground">{getStatusText(status, hasFile)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Auto</span>
          <Switch
            checked={isAutoDownloadEnabled}
            onCheckedChange={(checked) => onToggleAutoDownload(episode.id, checked)}
          />
        </div>
      </div>
    </div>
  )
}

export function SeasonCard({ season, episodes, seriesId, onToggleSeasonAutoDownload, onToggleEpisodeAutoDownload }) {
  const monitoredEpisodes = episodes.filter(e => e.monitored)
  const downloadedCount = monitoredEpisodes.filter(e => e.hasFile).length
  const totalCount = monitoredEpisodes.length
  const progress = totalCount > 0 ? (downloadedCount / totalCount) * 100 : 0

  const isAutoDownloadEnabled = season.isAutoDownloadEnabled
  const aggregatedStatus = getAggregatedStatus(episodes)

  const getStatusBadge = () => {
    if (!isAutoDownloadEnabled) {
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Auto Disabled
        </Badge>
      )
    }

    switch (aggregatedStatus) {
      case AutoDownloadStatus.DOWNLOADING:
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">
            <Download className="h-3 w-3 mr-1" />
            Downloading
          </Badge>
        )
      case AutoDownloadStatus.PENDING:
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case AutoDownloadStatus.DOWNLOADED:
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        )
      case AutoDownloadStatus.FAILED:
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Auto Enabled
          </Badge>
        )
    }
  }

  return (
    <Collapsible defaultOpen={season.monitored}>
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">Season {season.seasonNumber}</CardTitle>
                  {season.monitored ? (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                      <Eye className="h-3 w-3 mr-1" />
                      Monitored
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Not Monitored
                    </Badge>
                  )}
                  {getStatusBadge()}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {downloadedCount}/{totalCount} Episodes
                    </p>
                    {season.monitored && progress < 100 && progress > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Math.round(progress)}% Complete
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {season.monitored && (
                <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      progress === 100 ? "bg-green-500" : "bg-yellow-500"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-4 border-l">
              <span className="text-sm text-muted-foreground">Auto</span>
              <Switch
                checked={isAutoDownloadEnabled}
                onCheckedChange={(checked) => onToggleSeasonAutoDownload(season.seasonNumber, checked)}
              />
            </div>

            <CollapsibleTrigger asChild>
              <button className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                <span className="sr-only">Toggle</span>
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-0 pt-0">
            {monitoredEpisodes.length > 0 ? (
              <div className="border-t">
                {monitoredEpisodes
                  .sort((a, b) => a.episodeNumber - b.episodeNumber)
                  .map(episode => (
                    <EpisodeRow
                      key={episode.id}
                      episode={episode}
                      seriesId={seriesId}
                      onToggleAutoDownload={onToggleEpisodeAutoDownload}
                    />
                  ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground border-t">
                No monitored episodes for this season
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
