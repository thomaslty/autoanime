import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, CheckCircle2, Clock, AlertCircle, FileVideo, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

function EpisodeRow({ episode }) {
  const hasFile = episode.hasFile
  const isMonitored = episode.monitored

  const getStatusIcon = () => {
    if (hasFile) return <CheckCircle2 className="h-4 w-4 text-green-500" />
    if (isMonitored) return <Clock className="h-4 w-4 text-yellow-500" />
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />
  }

  const getStatusText = () => {
    if (hasFile) return "Downloaded"
    if (isMonitored) return "Pending"
    return "Not Monitored"
  }

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
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-xs text-muted-foreground">{getStatusText()}</span>
      </div>
    </div>
  )
}

export function SeasonCard({ season, episodes }) {
  const monitoredEpisodes = episodes.filter(e => e.monitored)
  const downloadedCount = monitoredEpisodes.filter(e => e.hasFile).length
  const totalCount = monitoredEpisodes.length
  const progress = totalCount > 0 ? (downloadedCount / totalCount) * 100 : 0

  return (
    <Collapsible defaultOpen={season.monitored}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="p-4">
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
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
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
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-0 pt-0">
            {monitoredEpisodes.length > 0 ? (
              <div className="border-t">
                {monitoredEpisodes
                  .sort((a, b) => a.episodeNumber - b.episodeNumber)
                  .map(episode => (
                    <EpisodeRow key={episode.id} episode={episode} />
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
