import { useState, useEffect } from "react"
import { SeriesCard } from "./SeriesCard"
import { RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function PosterBoard({ series = [], onSeriesClick, loading = false, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [autoDownloadFilter, setAutoDownloadFilter] = useState("all")
  const [filteredSeries, setFilteredSeries] = useState(series)

  useEffect(() => {
    let filtered = series

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(lowerTerm)
      )
    }

    // Apply auto-download filter
    if (autoDownloadFilter === "with-auto-download") {
      filtered = filtered.filter(s => s.hasAutoDownloadEpisodes === true)
    } else if (autoDownloadFilter === "without-auto-download") {
      filtered = filtered.filter(s => !s.hasAutoDownloadEpisodes)
    }

    setFilteredSeries(filtered)
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
          <Button onClick={onRefresh} disabled={loading} variant="outline">
            <RefreshCw size={18} className={loading ? "animate-spin mr-2" : "mr-2"} />
            <span>Sync</span>
          </Button>
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

      {loading ? (
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
