import { useState, useEffect } from "react"
import { SeriesCard } from "./SeriesCard"
import { RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PosterBoard({ series = [], onSeriesClick, loading = false, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSeries, setFilteredSeries] = useState(series)

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSeries(series)
    } else {
      const lowerTerm = searchTerm.toLowerCase()
      setFilteredSeries(series.filter(s =>
        s.title.toLowerCase().includes(lowerTerm)
      ))
    }
  }, [searchTerm, series])

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
