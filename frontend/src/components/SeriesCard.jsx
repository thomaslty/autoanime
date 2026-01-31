import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function getStatusColor(series) {
  if (!series.monitored) {
    return "bg-destructive"
  }
  if (series.status === "ended") {
    return "bg-blue-500"
  }
  if (series.status === "warning" || series.totalEpisodeCount > series.episodeFileCount) {
    return "bg-yellow-500"
  }
  if (series.isAutoDownloadEnabled && series.monitored) {
    return "bg-green-500"
  }
  return "bg-green-500"
}

export function SeriesCard({ series, onClick }) {
  const statusColor = getStatusColor(series)
  const posterUrl = series.posterPath || null

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden p-0"
      onClick={() => onClick && onClick(series)}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={series.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 150'%3E%3Crect fill='%23333' width='100' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='12'%3ENo Poster%3C/text%3E%3C/svg%3E"
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-sm">No Poster</span>
          </div>
        )}

        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1 transition-all",
          statusColor
        )} />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full transition-transform group-hover:translate-y-0 group-hover:text-white">
          <h3 className="text-sm font-medium line-clamp-2">{series.title}</h3>
          <p className="text-xs text-white/80 mt-1">
            {series.seasonCount} Season{series.seasonCount !== 1 ? 's' : ''} • {series.episodeFileCount}/{series.totalEpisodeCount} Eps
          </p>
        </div>
      </div>
    </Card>
  )
}
