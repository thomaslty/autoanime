import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { Eye, RefreshCw, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function RssMatchesDialog({ open, onOpenChange, seriesId, onRefreshSeries }) {
  const [previewData, setPreviewData] = useState([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewSearch, setPreviewSearch] = useState("")
  const [previewSort, setPreviewSort] = useState({ field: 'seasonNumber', dir: 'desc' })
  const [updatingEpisodeIds, setUpdatingEpisodeIds] = useState(new Set())
  const [downloadingEpisodeIds, setDownloadingEpisodeIds] = useState(new Set())
  const [applyingMatches, setApplyingMatches] = useState(false)
  const [resettingRss, setResettingRss] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showApplyConfirm, setShowApplyConfirm] = useState(false)

  const fetchPreviewData = async () => {
    setPreviewLoading(true)
    try {
      const response = await fetch(`/api/rss-config/preview/series/${seriesId}`)
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

  useEffect(() => {
    if (open) {
      fetchPreviewData()
    }
  }, [open])

  const handleApplyMatches = async () => {
    setShowApplyConfirm(false)
    setApplyingMatches(true)
    try {
      const response = await fetch(`/api/rss-config/preview/series/${seriesId}/apply`, { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to apply matches")
      }
      fetchPreviewData()
      onRefreshSeries()
    } catch (err) {
      console.error("Error applying matches:", err)
    } finally {
      setApplyingMatches(false)
    }
  }

  const handleResetRssMatches = async () => {
    setShowResetConfirm(false)
    setResettingRss(true)
    try {
      const response = await fetch(`/api/sonarr/series/${seriesId}/rss-matches/reset`, { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to reset RSS matches")
      }
      fetchPreviewData()
      onRefreshSeries()
    } catch (err) {
      console.error("Error resetting RSS matches:", err)
    } finally {
      setResettingRss(false)
    }
  }

  const handleLinkEpisode = async (episodeId, rssItemId) => {
    setUpdatingEpisodeIds(prev => new Set(prev).add(episodeId))
    try {
      const response = await fetch(`/api/sonarr/episodes/${episodeId}/rss-item`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rssItemId }),
      })
      if (!response.ok) {
        throw new Error("Failed to link episode")
      }
      fetchPreviewData()
    } catch (err) {
      console.error("Error linking episode:", err)
    } finally {
      setUpdatingEpisodeIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(episodeId)
        return newSet
      })
    }
  }

  const handleUnlinkEpisode = async (episodeId) => {
    setUpdatingEpisodeIds(prev => new Set(prev).add(episodeId))
    try {
      const response = await fetch(`/api/sonarr/episodes/${episodeId}/rss-item`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rssItemId: null }),
      })
      if (!response.ok) {
        throw new Error("Failed to unlink episode")
      }
      fetchPreviewData()
    } catch (err) {
      console.error("Error unlinking episode:", err)
    } finally {
      setUpdatingEpisodeIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(episodeId)
        return newSet
      })
    }
  }

  const handleDownloadEpisode = async (episodeId) => {
    setDownloadingEpisodeIds(prev => new Set(prev).add(episodeId))
    try {
      const response = await fetch(`/api/sonarr/episodes/${episodeId}/download`, { method: "POST" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to download episode")
      }
    } catch (err) {
      console.error("Error downloading episode:", err)
    } finally {
      setDownloadingEpisodeIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(episodeId)
        return newSet
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[70vw] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={18} />
                Configure RSS Matches
              </div>
              <Button className="mr-10" variant="outline" size="sm" onClick={fetchPreviewData} disabled={previewLoading}>
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
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
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {updatingEpisodeIds.has(item.episodeId) ? (
                                <Button size="sm" variant="ghost" disabled>
                                  <RefreshCw size={14} className="animate-spin" />
                                </Button>
                              ) : item.rssItemId && item.rssItemId !== item.currentRssItemId ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleLinkEpisode(item.episodeId, item.rssItemId)}
                                  className="text-green-700 border-green-200 hover:bg-green-50"
                                >
                                  Link
                                </Button>
                              ) : item.currentRssItemId ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadEpisode(item.episodeId)}
                                    disabled={downloadingEpisodeIds.has(item.episodeId)}
                                    className="text-blue-700 border-blue-200 hover:bg-blue-50"
                                  >
                                    {downloadingEpisodeIds.has(item.episodeId) ? (
                                      <RefreshCw size={14} className="animate-spin" />
                                    ) : (
                                      <Download size={14} />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnlinkEpisode(item.episodeId)}
                                    className="text-red-700 border-red-200 hover:bg-red-50"
                                  >
                                    Unlink
                                  </Button>
                                </>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {previewData.filter(i => i.rssItemTitle && i.rssItemTitle !== i.currentRssItemTitle).length} new matches found
              </div>
              <Button variant="destructive" size="sm" onClick={() => setShowResetConfirm(true)} disabled={resettingRss}>
                {resettingRss ? "Resetting..." : "Reset All Matches"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={() => setShowApplyConfirm(true)} disabled={applyingMatches || previewLoading || previewData.length === 0}>
                {applyingMatches ? "Applying..." : "Apply All Matches"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Reset RSS Matches"
        description="Are you sure you want to reset all RSS matches? This will clear the link between episodes and RSS items."
        confirmLabel="Reset"
        onConfirm={handleResetRssMatches}
      />

      <ConfirmDialog
        open={showApplyConfirm}
        onOpenChange={setShowApplyConfirm}
        title="Apply RSS Matches"
        description="Are you sure you want to apply these RSS matches to the episodes? This will update the database."
        confirmLabel="Apply"
        confirmVariant="default"
        onConfirm={handleApplyMatches}
      />
    </>
  )
}
