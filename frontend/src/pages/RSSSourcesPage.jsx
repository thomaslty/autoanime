import { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { Plus, Edit2, Trash2, RefreshCw, Power, PowerOff, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "../lib/utils"

export function RSSSourcesPage() {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingSource, setEditingSource] = useState(null)
  const [formData, setFormData] = useState({ name: "", url: "", isEnabled: true })
  const [searchTerm, setSearchTerm] = useState("")

  const fetchSources = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/rss/sources")
      if (!response.ok) throw new Error("Failed to fetch sources")
      const data = await response.json()
      setSources(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const handleSave = async () => {
    try {
      const url = editingSource
        ? `/api/rss/sources/${editingSource.id}`
        : "/api/rss/sources"
      const method = editingSource ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to save source")

      setShowModal(false)
      setEditingSource(null)
      setFormData({ name: "", url: "", isEnabled: true })
      fetchSources()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this source?")) return

    try {
      const response = await fetch(`/api/rss/sources/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete source")
      fetchSources()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`/api/rss/sources/${id}/toggle`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to toggle source")
      fetchSources()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleFetch = async (id) => {
    try {
      const response = await fetch(`/api/rss/sources/${id}/fetch`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to fetch source")
      fetchSources()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredSources = sources.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">RSS Sources</h2>

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
                  placeholder="Search sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setEditingSource(null)
                setFormData({ name: "", url: "", isEnabled: true })
                setShowModal(true)
              }}>
                <Plus size={18} className="mr-2" />
                Add Source
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Loading...
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {searchTerm ? "No sources found" : "No RSS sources configured"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Fetch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="text-muted-foreground">#{source.id}</TableCell>
                    <TableCell>{source.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{source.url}</TableCell>
                    <TableCell>
                      <Badge variant={source.isEnabled ? "default" : "secondary"}>
                        {source.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {source.lastFetchedAt
                        ? new Date(source.lastFetchedAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleFetch(source.id)} title="Fetch">
                          <RefreshCw size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggle(source.id)} title={source.isEnabled ? "Disable" : "Enable"}>
                          {source.isEnabled ? <PowerOff size={16} /> : <Power size={16} />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingSource(source)
                          setFormData({ name: source.name, url: source.url, isEnabled: source.isEnabled })
                          setShowModal(true)
                        }} title="Edit">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(source.id)} title="Delete" className="hover:text-destructive">
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
            <DialogTitle>{editingSource ? "Edit RSS Source" : "Add RSS Source"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Source name"
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
              setEditingSource(null)
              setFormData({ name: "", url: "", isEnabled: true })
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
