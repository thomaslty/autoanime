import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Layout } from "../components/Layout"
import { Plus, Edit2, Trash2, Power, PowerOff, Search, Settings, AlertCircle, WifiOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const EMPTY_FORM = { name: "", description: "", regex: "", rssSourceId: "", isEnabled: true }

export function RSSAnimeConfigsPage() {
  const [configs, setConfigs] = useState([])
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [regexError, setRegexError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [preview, setPreview] = useState(null)
  const [previewing, setPreviewing] = useState(false)
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [configsRes, sourcesRes] = await Promise.all([
        fetch("/api/rss-config"),
        fetch("/api/rss/sources")
      ])

      if (!configsRes.ok) throw new Error("Failed to fetch configs")
      if (!sourcesRes.ok) throw new Error("Failed to fetch sources")

      setConfigs(await configsRes.json())
      setSources(await sourcesRes.json())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    fetchData()
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

  const getServiceError = () => {
    if (!health) return null
    if (!health.sonarr?.connected) {
      return {
        title: "Sonarr Not Configured",
        message: health.sonarr?.error || "Sonarr is not configured or unreachable.",
        service: "Sonarr"
      }
    }
    return null
  }

  const validateRegex = (pattern) => {
    try {
      new RegExp(pattern)
      setRegexError(null)
      return true
    } catch (e) {
      setRegexError(e.message)
      return false
    }
  }

  const handleRegexChange = (value) => {
    setFormData({ ...formData, regex: value })
    if (value) validateRegex(value)
    else setRegexError(null)
    setPreview(null)
  }

  const handlePreview = async () => {
    if (!formData.rssSourceId || !formData.regex) return
    if (!validateRegex(formData.regex)) return
    setPreviewing(true)
    try {
      const response = await fetch("/api/rss-config/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rssSourceId: parseInt(formData.rssSourceId),
          regex: formData.regex
        })
      })
      if (!response.ok) {
        const data = await response.json()
        setRegexError(data.error)
      } else {
        const data = await response.json()
        setPreview(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setPreviewing(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.regex) return
    if (!validateRegex(formData.regex)) return

    try {
      const url = editingConfig
        ? `/api/rss-config/${editingConfig.id}`
        : "/api/rss-config"
      const method = editingConfig ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rssSourceId: formData.rssSourceId ? parseInt(formData.rssSourceId) : null,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to save config")
        return
      }

      setShowModal(false)
      setEditingConfig(null)
      setFormData(EMPTY_FORM)
      setPreview(null)
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this config?")) return
    try {
      const response = await fetch(`/api/rss-config/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete config")
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggle = async (config) => {
    try {
      const response = await fetch(`/api/rss-config/${config.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !config.isEnabled })
      })
      if (!response.ok) throw new Error("Failed to toggle config")
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const getSourceName = (id) => {
    const s = sources.find(s => s.id === id)
    return s ? s.name : "-"
  }

  const filteredConfigs = configs.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const serviceError = getServiceError()

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">RSS Configs</h2>

        {serviceError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              {serviceError.title}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">{serviceError.message}</p>
              <Button onClick={() => navigate("/settings")} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {error && !serviceError && (
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
                setFormData(EMPTY_FORM)
                setPreview(null)
                setRegexError(null)
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
              {searchTerm ? "No configs found" : "No RSS configs configured"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Regex</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="text-muted-foreground">#{config.id}</TableCell>
                    <TableCell>
                      <div>{config.name}</div>
                      {config.description && <div className="text-xs text-muted-foreground">{config.description}</div>}
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground">{config.regex}</TableCell>
                    <TableCell className="text-muted-foreground">{getSourceName(config.rssSourceId)}</TableCell>
                    <TableCell>
                      <Badge variant={config.isEnabled ? "default" : "secondary"}>
                        {config.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggle(config)} title={config.isEnabled ? "Disable" : "Enable"}>
                          {config.isEnabled ? <PowerOff size={16} /> : <Power size={16} />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingConfig(config)
                          setFormData({
                            name: config.name,
                            description: config.description || "",
                            regex: config.regex,
                            rssSourceId: config.rssSourceId ? String(config.rssSourceId) : "",
                            isEnabled: config.isEnabled
                          })
                          setPreview(null)
                          setRegexError(null)
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

      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open)
        if (!open) {
          setEditingConfig(null)
          setFormData(EMPTY_FORM)
          setPreview(null)
          setRegexError(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingConfig ? "Edit RSS Config" : "Add RSS Config"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Blue Lock Season 2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regex">Regex Pattern</Label>
              <Input
                id="regex"
                value={formData.regex}
                onChange={(e) => handleRegexChange(e.target.value)}
                placeholder="e.g. Blue.?Lock.*S2|1080p"
                className={regexError ? "border-destructive" : ""}
              />
              {regexError && <p className="text-xs text-destructive">{regexError}</p>}
              <p className="text-xs text-muted-foreground">Case-insensitive regex to match RSS item titles</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">RSS Source (optional)</Label>
              <div className="flex gap-2">
                <Select value={formData.rssSourceId} onValueChange={(value) => {
                  setFormData({ ...formData, rssSourceId: value })
                  setPreview(null)
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select source..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!formData.rssSourceId || !formData.regex || !!regexError || previewing}
                >
                  <Eye size={16} className="mr-2" />
                  {previewing ? "Loading..." : "Preview"}
                </Button>
              </div>
            </div>

            {preview && (
              <div className="space-y-2">
                <Label>Preview Results</Label>
                <div className="text-sm text-muted-foreground mb-1">
                  {preview.matched.length} of {preview.total} items matched
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {preview.matched.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">No items matched</div>
                  ) : (
                    <div className="divide-y">
                      {preview.matched.map(item => (
                        <div key={item.id} className="px-3 py-2 text-xs">{item.title}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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
              setFormData(EMPTY_FORM)
              setPreview(null)
              setRegexError(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.regex || !!regexError}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
