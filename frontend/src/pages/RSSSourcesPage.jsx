import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { Layout } from "../components/Layout"
import { Plus, Edit2, Trash2, RefreshCw, Power, PowerOff, Search, Settings, AlertCircle, WifiOff, X, Eye, MoreHorizontal, Trash, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { cn } from "../lib/utils"

export function RSSSourcesPage() {
  const [feeds, setFeeds] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingFeed, setEditingFeed] = useState(null)
  const [formData, setFormData] = useState({ name: "", url: "", description: "", templateId: "0", isEnabled: true, refreshInterval: "1h", refreshIntervalType: "human" })
  const [searchTerm, setSearchTerm] = useState("")
  const [dismissedWarnings, setDismissedWarnings] = useState(new Set())
  const [fetchingId, setFetchingId] = useState(null)
  const [sortField, setSortField] = useState("id")
  const [sortDir, setSortDir] = useState("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [clearConfirmId, setClearConfirmId] = useState(null)
  const navigate = useNavigate()

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/rss")
      if (!response.ok) throw new Error("Failed to fetch feeds")
      const data = await response.json()
      setFeeds(data)
      setError(null)
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Unable to connect to backend server. Please check if the backend is running on port 3000.")
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/rss/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (err) {
      console.error("Error fetching templates:", err)
    }
  }

  useEffect(() => {
    fetchHealth()
    fetchFeeds()
    fetchTemplates()
  }, [])

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

  const getServiceWarnings = () => {
    if (!health) return []
    const warnings = []
    if (!health.sonarr?.connected) {
      warnings.push({
        key: "sonarr",
        title: "Sonarr Not Configured",
        message: health.sonarr?.error || "Sonarr is not configured or unreachable. RSS feed management requires Sonarr to be properly configured.",
      })
    }
    if (!health.qbittorrent?.connected) {
      warnings.push({
        key: "qbittorrent",
        title: "qBittorrent Not Configured",
        message: health.qbittorrent?.error || "qBittorrent is not configured or unreachable. Some RSS features may be limited.",
      })
    }
    return warnings
  }

  const getTemplateName = (templateId) => {
    const template = templates.find(t => t.id === templateId)
    return template ? template.name : "Unknown"
  }

  const handleSave = async () => {
    try {
      const url = editingFeed
        ? `/api/rss/${editingFeed.id}`
        : "/api/rss"
      const method = editingFeed ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to save feed")

      const savedFeed = await response.json()

      // Close modal and reset form immediately
      setShowModal(false)
      setEditingFeed(null)
      setFormData({ name: "", url: "", description: "", templateId: "0", isEnabled: true, refreshInterval: "1h", refreshIntervalType: "human" })

      // Refresh feed list to show the new feed
      fetchFeeds()

      // If creating a new feed, trigger RSS fetch in the background (don't wait)
      if (!editingFeed && savedFeed?.id) {
        setFetchingId(savedFeed.id)
        fetch(`/api/rss/${savedFeed.id}/fetch`, { method: "POST" })
          .then(() => fetchFeeds())
          .catch((fetchErr) => console.error("Error fetching new feed:", fetchErr))
          .finally(() => setFetchingId(null))
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return
    try {
      const response = await fetch(`/api/rss/${deleteConfirmId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete feed")
      fetchFeeds()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`/api/rss/${id}/toggle`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to toggle feed")
      fetchFeeds()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleFetch = async (id) => {
    setFetchingId(id)
    try {
      const response = await fetch(`/api/rss/${id}/fetch`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to fetch feed")
      fetchFeeds()
    } catch (err) {
      setError(err.message)
    } finally {
      setFetchingId(null)
    }
  }

  const handleClearItems = async () => {
    if (!clearConfirmId) return
    try {
      const id = clearConfirmId
      setClearConfirmId(null)
      const response = await fetch(`/api/rss/${id}/items`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to clear RSS items")
      fetchFeeds()
    } catch (err) {
      setError(err.message)
    }
  }

  const formatRelativeTime = (date) => {
    if (!date) return "-"
    const diff = new Date(date) - new Date()
    if (diff < 0) return "overdue"
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `in ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `in ${hrs}h`
    return `in ${Math.floor(hrs / 24)}d`
  }

  const handleSort = (field) => {
    setPage(1)
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir(field === "lastFetchedAt" || field === "nextFetchAt" ? "desc" : "asc")
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronsUpDown size={14} className="ml-1 opacity-40" />
    return sortDir === "asc" ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
  }

  const sortedFeeds = useMemo(() => {
    const filtered = feeds.filter(f =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.url.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return [...filtered].sort((a, b) => {
      let av = a[sortField], bv = b[sortField]
      if (sortField === "lastFetchedAt" || sortField === "nextFetchAt") {
        av = av ? new Date(av).getTime() : 0
        bv = bv ? new Date(bv).getTime() : 0
      } else if (sortField === "id") {
        av = Number(av) || 0
        bv = Number(bv) || 0
      } else {
        av = (av || "").toLowerCase()
        bv = (bv || "").toLowerCase()
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [feeds, searchTerm, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedFeeds.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedFeeds = sortedFeeds.slice((safePage - 1) * pageSize, safePage * pageSize)

  const activeWarnings = getServiceWarnings().filter(w => !dismissedWarnings.has(w.key))

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">RSS Feeds</h2>

        {activeWarnings.map(warning => (
          <Alert key={warning.key} variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              {warning.title}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">{warning.message}</p>
              <Button onClick={() => navigate("/settings")} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure Now
              </Button>
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setDismissedWarnings(prev => new Set([...prev, warning.key]))}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        ))}

        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search feeds..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setEditingFeed(null)
                setFormData({ name: "", url: "", description: "", templateId: "0", isEnabled: true, refreshInterval: "1h", refreshIntervalType: "human" })
                setShowModal(true)
              }}>
                <Plus size={18} className="mr-2" />
                Add Feed
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Loading...
            </div>
          ) : sortedFeeds.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {searchTerm ? "No feeds found" : "No RSS feeds configured"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4 cursor-pointer select-none" onClick={() => handleSort("id")}>
                      <span className="inline-flex items-center">ID<SortIcon field="id" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                      <span className="inline-flex items-center">Name<SortIcon field="name" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("url")}>
                      <span className="inline-flex items-center">URL<SortIcon field="url" /></span>
                    </TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("isEnabled")}>
                      <span className="inline-flex items-center">Status<SortIcon field="isEnabled" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("lastFetchedAt")}>
                      <span className="inline-flex items-center">Last Fetch<SortIcon field="lastFetchedAt" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("nextFetchAt")}>
                      <span className="inline-flex items-center">Next Fetch<SortIcon field="nextFetchAt" /></span>
                    </TableHead>
                    <TableHead className="text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedFeeds.map((feed) => (
                    <TableRow key={feed.id}>
                      <TableCell className="text-muted-foreground pl-4">#{feed.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{feed.name}</div>
                        {feed.description && <div className="text-xs text-muted-foreground">{feed.description}</div>}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">{feed.url}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTemplateName(feed.templateId)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={feed.isEnabled ? "default" : "secondary"}>
                          {feed.isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {feed.lastFetchedAt
                          ? new Date(feed.lastFetchedAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelativeTime(feed.nextFetchAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleFetch(feed.id)} title="Fetch" disabled={fetchingId === feed.id}>
                            <RefreshCw size={16} className={fetchingId === feed.id ? "animate-spin" : ""} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/rss/${feed.id}/items`)} title="View Items">
                            <Eye size={16} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" title="Manage">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleToggle(feed.id)}>
                                {feed.isEnabled ? <PowerOff size={14} className="mr-2" /> : <Power size={14} className="mr-2" />}
                                {feed.isEnabled ? "Disable" : "Enable"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingFeed(feed)
                                setFormData({
                                  name: feed.name,
                                  url: feed.url,
                                  description: feed.description || "",
                                  templateId: String(feed.templateId),
                                  isEnabled: feed.isEnabled,
                                  refreshInterval: feed.refreshInterval || "1h",
                                  refreshIntervalType: feed.refreshIntervalType || "human"
                                })
                                setShowModal(true)
                              }}>
                                <Edit2 size={14} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setClearConfirmId(feed.id)}>
                                <Trash size={14} className="mr-2" />
                                Clear RSS Items
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirmId(feed.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Rows per page</span>
                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
                    <SelectTrigger className="h-8 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <span>{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedFeeds.length)} of {sortedFeeds.length}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(1)} disabled={safePage === 1}>
                      «
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
                      ‹
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                      ›
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>
                      »
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFeed ? "Edit RSS Feed" : "Add RSS Feed"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Feed name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/rss"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Feed description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select
                value={formData.templateId}
                onValueChange={(value) => setFormData({ ...formData, templateId: value })}
              >
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={String(template.id)}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Refresh Interval</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.refreshIntervalType}
                  onValueChange={(value) => setFormData({ ...formData, refreshIntervalType: value, refreshInterval: value === "cron" ? "0 */1 * * *" : "1h" })}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human">Simple</SelectItem>
                    <SelectItem value="cron">Cron</SelectItem>
                  </SelectContent>
                </Select>
                {formData.refreshIntervalType === "human" ? (
                  <Select
                    value={formData.refreshInterval}
                    onValueChange={(value) => setFormData({ ...formData, refreshInterval: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["15m", "30m", "1h", "2h", "4h", "8h", "12h", "24h"].map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="flex-1"
                    value={formData.refreshInterval}
                    onChange={(e) => setFormData({ ...formData, refreshInterval: e.target.value })}
                    placeholder="*/30 * * * *"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isEnabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
              />
              <Label htmlFor="isEnabled">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowModal(false)
              setEditingFeed(null)
              setFormData({ name: "", url: "", description: "", templateId: "0", isEnabled: true, refreshInterval: "1h", refreshIntervalType: "human" })
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.url}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RSS Feed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feed? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!clearConfirmId} onOpenChange={(open) => !open && setClearConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear RSS Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all RSS items for this feed? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearItems} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  )
}
