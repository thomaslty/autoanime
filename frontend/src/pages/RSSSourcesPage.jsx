import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Layout } from "../components/Layout"
import { Plus, Edit2, Trash2, RefreshCw, Power, PowerOff, Search, Settings, AlertCircle, WifiOff, X, Eye, MoreHorizontal, Trash } from "lucide-react"
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
import { cn } from "../lib/utils"

export function RSSSourcesPage() {
  const [feeds, setFeeds] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingFeed, setEditingFeed] = useState(null)
  const [formData, setFormData] = useState({ name: "", url: "", description: "", templateId: "0", isEnabled: true })
  const [searchTerm, setSearchTerm] = useState("")
  const [dismissedWarnings, setDismissedWarnings] = useState(new Set())
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

      setShowModal(false)
      setEditingFeed(null)
      setFormData({ name: "", url: "", description: "", templateId: "0", isEnabled: true })
      fetchFeeds()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this feed?")) return

    try {
      const response = await fetch(`/api/rss/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete feed")
      fetchFeeds()
    } catch (err) {
      setError(err.message)
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
    try {
      const response = await fetch(`/api/rss/${id}/fetch`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to fetch feed")
      fetchFeeds()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleClearItems = async (id) => {
    if (!confirm("Are you sure you want to clear all RSS items for this feed?")) return

    try {
      const response = await fetch(`/api/rss/${id}/items`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to clear RSS items")
      fetchFeeds()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredFeeds = feeds.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setEditingFeed(null)
                setFormData({ name: "", url: "", description: "", templateId: "0", isEnabled: true })
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
          ) : filteredFeeds.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {searchTerm ? "No feeds found" : "No RSS feeds configured"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Fetch</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeeds.map((feed) => (
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleFetch(feed.id)} title="Fetch">
                          <RefreshCw size={16} />
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
                                isEnabled: feed.isEnabled
                              })
                              setShowModal(true)
                            }}>
                              <Edit2 size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleClearItems(feed.id)}>
                              <Trash size={14} className="mr-2" />
                              Clear RSS Items
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(feed.id)}
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
              setFormData({ name: "", url: "", description: "", templateId: "0", isEnabled: true })
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.url}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
