import { useState, useEffect } from "react"
import { SearchableSelect } from "@/components/SearchableSelect"
import { Rss } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function RssFilterDialog({
  open,
  onOpenChange,
  series,
  rssConfigs,
  initialSeriesConfigId,
  initialSeasonConfigs,
  onSave,
  saving,
}) {
  const [seriesRssConfigId, setSeriesRssConfigId] = useState("none")
  const [seasonRssConfigs, setSeasonRssConfigs] = useState({})

  const seriesRssItems = [
    { label: "No config", value: "none" },
    ...rssConfigs.map(c => ({ label: c.name, value: String(c.id) })),
  ]
  const seasonRssItems = [
    { label: "Use series config", value: "none" },
    ...rssConfigs.map(c => ({ label: c.name, value: String(c.id) })),
  ]

  useEffect(() => {
    if (open) {
      setSeriesRssConfigId(initialSeriesConfigId || "none")
      setSeasonRssConfigs(initialSeasonConfigs || {})
    }
  }, [open, initialSeriesConfigId, initialSeasonConfigs])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <SearchableSelect
              items={seriesRssItems}
              value={seriesRssConfigId || "none"}
              onChange={setSeriesRssConfigId}
            />
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
                    <div className="flex-1 min-w-0">
                      <SearchableSelect
                        items={seasonRssItems}
                        value={seasonRssConfigs[season.seasonNumber] || "none"}
                        onChange={(value) => setSeasonRssConfigs(prev => ({
                          ...prev,
                          [season.seasonNumber]: value,
                        }))}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave({ seriesRssConfigId, seasonRssConfigs })} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
