import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { Layout } from "../components/Layout"
import { Plus, Edit2, Trash2, Power, PowerOff, Search, Settings, AlertCircle, WifiOff, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { RssConfigFormDialog } from "@/components/dialogs/RssConfigFormDialog"

export function RSSAnimeConfigsPage() {
  const [configs, setConfigs] = useState([])
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("id")
  const [sortDir, setSortDir] = useState("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
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

  const handleSave = async (formData) => {
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
          offset: formData.offset ? parseInt(formData.offset, 10) : null,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to save config")
        return
      }

      setShowModal(false)
      setEditingConfig(null)
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return
    try {
      const response = await fetch(`/api/rss-config/${deleteConfirmId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete config")
      fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteConfirmId(null)
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

  const handleSort = (field) => {
    setPage(1)
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronsUpDown size={14} className="ml-1 opacity-40" />
    return sortDir === "asc" ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
  }

  const sortedConfigs = useMemo(() => {
    const filtered = configs.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    return [...filtered].sort((a, b) => {
      let av = a[sortField], bv = b[sortField]
      if (sortField === "id") {
        av = Number(av) || 0
        bv = Number(bv) || 0
      } else if (sortField === "rssSourceId") {
        av = getSourceName(av) || ""
        bv = getSourceName(bv) || ""
        av = av.toLowerCase()
        bv = bv.toLowerCase()
      } else if (typeof av === "boolean") {
        av = av ? 1 : 0
        bv = bv ? 1 : 0
      } else {
        av = (av || "").toLowerCase()
        bv = (bv || "").toLowerCase()
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [configs, searchTerm, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedConfigs.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedConfigs = sortedConfigs.slice((safePage - 1) * pageSize, safePage * pageSize)

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
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setEditingConfig(null)
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
          ) : sortedConfigs.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {searchTerm ? "No configs found" : "No RSS configs configured"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("id")}>
                      <span className="inline-flex items-center">ID<SortIcon field="id" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                      <span className="inline-flex items-center">Name<SortIcon field="name" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("regex")}>
                      <span className="inline-flex items-center">Regex<SortIcon field="regex" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("rssSourceId")}>
                      <span className="inline-flex items-center">Source<SortIcon field="rssSourceId" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("isEnabled")}>
                      <span className="inline-flex items-center">Status<SortIcon field="isEnabled" /></span>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedConfigs.map((config) => (
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
                            setShowModal(true)
                          }} title="Edit">
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(config.id)} title="Delete" className="hover:text-destructive">
                            <Trash2 size={16} />
                          </Button>
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
                  <span>{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedConfigs.length)} of {sortedConfigs.length}</span>
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

      <RssConfigFormDialog
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open)
          if (!open) setEditingConfig(null)
        }}
        config={editingConfig}
        sources={sources}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete RSS Config"
        description="Are you sure you want to delete this config? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </Layout>
  )
}
