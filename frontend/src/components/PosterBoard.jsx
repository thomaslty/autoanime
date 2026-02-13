import { useMemo } from "react"
import { useSearchParams } from "react-router"
import { SeriesCard } from "./SeriesCard"
import { RefreshCw, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const VALID_FILTERS = ["all", "with-auto-download", "without-auto-download"]

export function PosterBoard({ series = [], onSeriesClick, loading = false, syncing = false, syncStatus, onRefresh }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const searchTerm = searchParams.get("q") || ""
  const autoDownloadFilter = VALID_FILTERS.includes(searchParams.get("filter"))
    ? searchParams.get("filter")
    : "all"

  const setSearchTerm = (value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set("q", value)
      } else {
        next.delete("q")
      }
      return next
    }, { replace: true })
  }

  const setAutoDownloadFilter = (value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value && value !== "all") {
        next.set("filter", value)
      } else {
        next.delete("filter")
      }
      return next
    }, { replace: true })
  }

  const filteredSeries = useMemo(() => {
    let filtered = series

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(lowerTerm)
      )
    }

    if (autoDownloadFilter === "with-auto-download") {
      filtered = filtered.filter(s => s.hasAutoDownloadEpisodes === true)
    } else if (autoDownloadFilter === "without-auto-download") {
      filtered = filtered.filter(s => !s.hasAutoDownloadEpisodes)
    }

    return filtered
  }, [searchTerm, autoDownloadFilter, series])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Anime Library</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search anime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={syncing} variant="outline">
                <RefreshCw size={18} className={syncing ? "animate-spin mr-2" : "mr-2"} />
                <span>
                  {syncing
                    ? syncStatus?.progress?.total > 0
                      ? `Syncing ${syncStatus.progress.current}/${syncStatus.progress.total}...`
                      : "Syncing..."
                    : "Sync"}
                </span>
                <ChevronDown size={14} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRefresh("delta")} disabled={syncing}>
                Sync Delta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRefresh("full")} disabled={syncing}>
                Sync All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={autoDownloadFilter} onValueChange={setAutoDownloadFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Series</SelectItem>
              <SelectItem value="with-auto-download">With Auto-Download</SelectItem>
              <SelectItem value="without-auto-download">Without Auto-Download</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && !series.length ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={40} className="animate-spin text-muted-foreground" />
        </div>
      ) : filteredSeries.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          {searchTerm ? "No anime found" : "No anime series synced yet"}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredSeries.map((item) => (
            <SeriesCard
              key={item.id}
              series={item}
              onClick={onSeriesClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
