import { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { Plus, Edit2, Trash2, Power, PowerOff, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RSSAnimeConfigsPage() {
  const [configs, setConfigs] = useState([])
  const [series, setSeries] = useState([])
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [formData, setFormData] = useState({ name: "", url: "", rssSourceId: "", sonarrSeriesId: "", isEnabled: true })
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const [configsRes, seriesRes, sourcesRes] = await Promise.all([
        fetch("/api/rss/anime-configs"),
        fetch("/api/sonarr/series"),
        fetch("/api/rss/sources")
      ])

      if (!configsRes.ok) throw new Error("Failed to fetch configs")
      if (!seriesRes.ok) throw new Error("Failed to fetch series")
      if (!sourcesRes.ok) throw new Error("Failed to fetch sources")

      setConfigs(await configsRes.json())
      setSeries(await seriesRes.json())
      setSources(await sourcesRes.json())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = async () => {
    try {
      const url = editingConfig
        ? `/api/rss/anime-configs/${editingConfig.id}`
        : "/api/rss/anime-configs"
      const method = editingConfig ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rssSourceId: formData.rssSourceId ? parseInt(formData.rssSourceId) : null,
          sonarrSeriesId: formData.sonarrSeriesId ? parseInt(formData.sonarrSeriesId) : null
        })
      })

      if (!response.ok) throw new Error("Failed to save config")

      setShowModal(false)
      setEditingConfig(null)
      setFormData({ name: "", url: "", rssSourceId: "", sonarrSeriesId: "", isEnabled: true })
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this config?")) return

    try {
      const response = await fetch(`/api/rss/anime-configs/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete config")
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`/api/rss/anime-configs/${id}/toggle`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to toggle config")
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const getSeriesTitle = (id) => {
    const s = series.find(s => s.id === id)
    return s ? s.title : "-"
  }

  const getSourceName = (id) => {
    const s = sources.find(s => s.id === id)
    return s ? s.name : "-"
  }

  const filteredConfigs = configs.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSeriesTitle(c.sonarrSeriesId).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">Anime RSS Configs</h2>

        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 rounded-lg">
            Error: {error}
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search configs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setEditingConfig(null)
                setFormData({ name: "", url: "", rssSourceId: "", sonarrSeriesId: "", isEnabled: true })
                setShowModal(true)
              }}>
                <Plus size={18} className="mr-2" />
                Add Config
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Loading...
            </div>
          ) : filteredConfigs.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {searchTerm ? "No configs found" : "No anime RSS configs configured"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Linked Anime</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="text-muted-foreground">#{config.id}</TableCell>
                    <TableCell>{config.name}</TableCell>
                    <TableCell className="text-muted-foreground">{getSeriesTitle(config.sonarrSeriesId)}</TableCell>
                    <TableCell className="text-muted-foreground">{getSourceName(config.rssSourceId)}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{config.url}</TableCell>
                    <TableCell>
                      <Badge variant={config.isEnabled ? "default" : "secondary"}>
                        {config.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggle(config.id)} title={config.isEnabled ? "Disable" : "Enable"}>
                          {config.isEnabled ? <PowerOff size={16} /> : <Power size={16} />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingConfig(config)
                          setFormData({
                            name: config.name,
                            url: config.url,
                            rssSourceId: config.rssSourceId || "",
                            sonarrSeriesId: config.sonarrSeriesId || "",
                            isEnabled: config.isEnabled
                          })
                          setShowModal(true)
                        }} title="Edit">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(config.id)} title="Delete" className="hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
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
            <DialogTitle>{editingConfig ? "Edit Anime RSS Config" : "Add Anime RSS Config"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Config name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/feed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sonarr">Linked Anime (optional)</Label>
              <Select value={formData.sonarrSeriesId} onValueChange={(value) => setFormData({ ...formData, sonarrSeriesId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select anime..." />
                </SelectTrigger>
                <SelectContent>
                  {series.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">RSS Source (optional)</Label>
              <Select value={formData.rssSourceId} onValueChange={(value) => setFormData({ ...formData, rssSourceId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
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
              setEditingConfig(null)
              setFormData({ name: "", url: "", rssSourceId: "", sonarrSeriesId: "", isEnabled: true })
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
