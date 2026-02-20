import { useState, useEffect, useMemo } from "react"
import { Layout } from "../components/Layout"
import { XmlTreeNode } from "../components/XmlTreeNode"
import { FieldMappingPanel } from "../components/FieldMappingPanel"
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import {
  Plus, ArrowLeft, Edit2, Trash2, RefreshCw, Search, Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// ---------------------------------------------------------------------------
// Helper: navigate an object by dot-notation path
// ---------------------------------------------------------------------------
function getByPath(obj, path) {
  if (!path) return undefined
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current == null) return undefined
    current = current[part]
  }
  return current
}

// ---------------------------------------------------------------------------
// Helper: auto-detect common RSS item array paths
// ---------------------------------------------------------------------------
function autoDetectItemPath(tree) {
  const common = ['rss.channel.item', 'feed.entry', 'rdf:RDF.item']
  for (const p of common) {
    const val = getByPath(tree, p)
    if (val && (Array.isArray(val) || typeof val === 'object')) return p
  }
  return ''
}

// ---------------------------------------------------------------------------
// Helper: build a selectedPaths Map from fieldMappings (inverted)
// e.g. { title: "title", magnetLink: "enclosure.@_url" }
// -> Map { "title" -> "title", "enclosure.@_url" -> "magnetLink" }
// ---------------------------------------------------------------------------
function buildSelectedPathsMap(fieldMappings) {
  const map = new Map()
  for (const [fieldKey, xmlPath] of Object.entries(fieldMappings || {})) {
    if (xmlPath) map.set(xmlPath, fieldKey)
  }
  return map
}

// ---------------------------------------------------------------------------
// RSSParserCreatorPage
// ---------------------------------------------------------------------------
export function RSSParserCreatorPage() {
  // -- List state -----------------------------------------------------------
  const [parsers, setParsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // -- Editor state ---------------------------------------------------------
  const [showEditor, setShowEditor] = useState(false)
  const [editingParser, setEditingParser] = useState(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sampleUrl, setSampleUrl] = useState('')
  const [xmlTree, setXmlTree] = useState(null)
  const [itemPath, setItemPath] = useState('')
  const [sampleItem, setSampleItem] = useState(null)
  const [fieldMappings, setFieldMappings] = useState({})
  const [activeField, setActiveField] = useState(null)
  const [previewItems, setPreviewItems] = useState(null)

  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [error, setError] = useState(null)

  // Phase: 'selectItemPath' (show full tree, pick array node)
  //         'mapFields'      (show single item, map fields)
  const [phase, setPhase] = useState('selectItemPath')

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------
  const fetchParsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/rss-parser')
      if (!res.ok) throw new Error('Failed to fetch parsers')
      setParsers(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParsers()
  }, [])

  // -------------------------------------------------------------------------
  // Editor helpers
  // -------------------------------------------------------------------------
  const resetEditor = () => {
    setName('')
    setDescription('')
    setSampleUrl('')
    setXmlTree(null)
    setItemPath('')
    setSampleItem(null)
    setFieldMappings({})
    setActiveField(null)
    setPreviewItems(null)
    setPhase('selectItemPath')
    setError(null)
  }

  const openEditorForNew = () => {
    resetEditor()
    setEditingParser(null)
    setShowEditor(true)
  }

  const openEditorForEdit = async (parser) => {
    resetEditor()
    setEditingParser(parser)
    setName(parser.name || '')
    setDescription(parser.description || '')
    setSampleUrl(parser.sampleUrl || '')
    setItemPath(parser.itemPath || '')
    setFieldMappings(parser.fieldMappings || {})
    setShowEditor(true)

    // If the parser has a sampleUrl, fetch the tree to restore the editor
    if (parser.sampleUrl) {
      await fetchXmlTree(parser.sampleUrl, parser.itemPath, parser.fieldMappings)
    }
  }

  // -------------------------------------------------------------------------
  // XML fetch
  // -------------------------------------------------------------------------
  const fetchXmlTree = async (url, existingItemPath, existingMappings) => {
    setFetching(true)
    setError(null)
    try {
      const res = await fetch('/api/rss-parser/fetch-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to fetch XML')
      }
      const data = await res.json()
      const tree = data.tree || data

      setXmlTree(tree)

      // Use provided itemPath or auto-detect
      const resolvedItemPath = existingItemPath || autoDetectItemPath(tree)

      if (resolvedItemPath) {
        setItemPath(resolvedItemPath)
        const itemsArray = getByPath(tree, resolvedItemPath)
        const firstItem = Array.isArray(itemsArray) ? itemsArray[0] : itemsArray
        setSampleItem(firstItem || null)
        setPhase('mapFields')
      } else {
        setPhase('selectItemPath')
      }

      if (existingMappings) {
        setFieldMappings(existingMappings)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }

  const handleFetchXml = () => {
    if (!sampleUrl.trim()) return
    fetchXmlTree(sampleUrl.trim(), '', null)
  }

  // -------------------------------------------------------------------------
  // Tree node selection
  // -------------------------------------------------------------------------
  const handleTreeNodeSelect = (path) => {
    if (phase === 'selectItemPath') {
      // User clicked an array node — set as item path
      const val = getByPath(xmlTree, path)
      if (!val) return
      const itemsArray = Array.isArray(val) ? val : [val]
      const firstItem = itemsArray[0]

      setItemPath(path)
      setSampleItem(firstItem || null)
      setPhase('mapFields')
    } else {
      // phase === 'mapFields'
      if (!activeField) return
      setFieldMappings(prev => ({ ...prev, [activeField]: path }))
      setActiveField(null)
    }
  }

  const handleMappingChange = (field, path) => {
    if (path === null) {
      setFieldMappings(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    } else {
      setFieldMappings(prev => ({ ...prev, [field]: path }))
    }
  }

  const handleFieldSelect = (field) => {
    setActiveField(prev => (prev === field ? null : field))
  }

  // -------------------------------------------------------------------------
  // Preview
  // -------------------------------------------------------------------------
  const handlePreview = async () => {
    setPreviewing(true)
    setError(null)
    try {
      const res = await fetch('/api/rss-parser/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sampleUrl, itemPath, fieldMappings }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Preview failed')
      }
      const data = await res.json()
      setPreviewItems(data.items || data)
    } catch (err) {
      setError(err.message)
    } finally {
      setPreviewing(false)
    }
  }

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const body = { name, description, itemPath, fieldMappings, sampleUrl }
      const url = editingParser ? `/api/rss-parser/${editingParser.id}` : '/api/rss-parser'
      const method = editingParser ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save parser')
      }
      setShowEditor(false)
      setEditingParser(null)
      fetchParsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteConfirmId) return
    try {
      const res = await fetch(`/api/rss-parser/${deleteConfirmId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete parser')
      fetchParsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteConfirmId(null)
    }
  }

  // -------------------------------------------------------------------------
  // Filtered list
  // -------------------------------------------------------------------------
  const filteredParsers = useMemo(() => {
    const term = searchTerm.toLowerCase()
    if (!term) return parsers
    return parsers.filter(p =>
      (p.name || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term) ||
      (p.itemPath || '').toLowerCase().includes(term)
    )
  }, [parsers, searchTerm])

  // -------------------------------------------------------------------------
  // Render: Editor mode
  // -------------------------------------------------------------------------
  if (showEditor) {
    const selectedPathsMap = buildSelectedPathsMap(fieldMappings)

    const canPreview = sampleUrl && itemPath && Object.keys(fieldMappings).length > 0
    const canSave = name.trim() && itemPath

    return (
      <Layout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowEditor(false)
                setEditingParser(null)
                resetEditor()
              }}
            >
              <ArrowLeft className="size-4 mr-1" />
              Back to List
            </Button>
            <h2 className="text-2xl font-bold">
              {editingParser ? 'Edit Parser' : 'New Parser'}
            </h2>
          </div>

          {error && (
            <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic info */}
          <Card>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="parser-name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="parser-name"
                  placeholder="My Custom Parser"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parser-desc">Description</Label>
                <Input
                  id="parser-desc"
                  placeholder="Optional description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="parser-url">RSS Feed URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="parser-url"
                    placeholder="https://example.com/rss"
                    value={sampleUrl}
                    onChange={e => setSampleUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleFetchXml} disabled={fetching || !sampleUrl.trim()}>
                    {fetching
                      ? <RefreshCw className="size-4 mr-2 animate-spin" />
                      : <RefreshCw className="size-4 mr-2" />}
                    Fetch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase indicator */}
          {xmlTree && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={phase === 'selectItemPath' ? 'font-semibold text-foreground' : ''}>
                1. Select Items Path
              </span>
              <span>/</span>
              <span className={phase === 'mapFields' ? 'font-semibold text-foreground' : ''}>
                2. Map Fields
              </span>
              {itemPath && (
                <Badge variant="outline" className="ml-2 font-mono text-xs">{itemPath}</Badge>
              )}
              {phase === 'mapFields' && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => {
                    setPhase('selectItemPath')
                    setItemPath('')
                    setSampleItem(null)
                    setFieldMappings({})
                    setActiveField(null)
                    setPreviewItems(null)
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          )}

          {/* Tree + Field mapping split */}
          {xmlTree && (
            <div className="flex gap-4 items-start">
              {/* XML Tree */}
              <Card className="flex-[3] min-w-0">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    {phase === 'selectItemPath'
                      ? 'Click an array node to set it as the items path.'
                      : activeField
                        ? `Assign path for "${activeField}" — click a leaf node.`
                        : 'Select a field on the right, then click a tree node to assign.'}
                  </p>
                  <div className="overflow-auto max-h-[60vh] font-mono text-xs">
                    {phase === 'selectItemPath' ? (
                      <XmlTreeNode
                        nodeKey="root"
                        data={xmlTree}
                        path=""
                        depth={0}
                        onSelect={handleTreeNodeSelect}
                        selectedPaths={selectedPathsMap}
                        isItemRoot={true}
                      />
                    ) : (
                      sampleItem && (
                        <XmlTreeNode
                          nodeKey="item"
                          data={sampleItem}
                          path=""
                          depth={0}
                          onSelect={handleTreeNodeSelect}
                          selectedPaths={selectedPathsMap}
                          isItemRoot={true}
                        />
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Field Mapping Panel */}
              {phase === 'mapFields' && (
                <Card className="flex-[2] min-w-0">
                  <CardContent className="p-3">
                    <FieldMappingPanel
                      mappings={fieldMappings}
                      onMappingChange={handleMappingChange}
                      activeField={activeField}
                      onFieldSelect={handleFieldSelect}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {phase === 'mapFields' && (
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={previewing || !canPreview}
              >
                {previewing
                  ? <RefreshCw className="size-4 mr-2 animate-spin" />
                  : <Eye className="size-4 mr-2" />}
                Preview
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || !canSave}>
              {saving ? <RefreshCw className="size-4 mr-2 animate-spin" /> : null}
              {editingParser ? 'Update Parser' : 'Save Parser'}
            </Button>
          </div>

          {/* Preview results */}
          {previewItems && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">
                  Preview (first {Math.min(previewItems.length, 10)} of {previewItems.length} items)
                </h3>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Magnet / Link</TableHead>
                        <TableHead>Published Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewItems.slice(0, 10).map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate text-sm" title={item.title}>{item.title || '-'}</div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate text-xs text-muted-foreground font-mono" title={item.magnetLink || item.link}>
                              {item.magnetLink
                                ? (item.magnetLink.startsWith('magnet:')
                                  ? item.magnetLink.slice(0, 50) + '…'
                                  : item.magnetLink)
                                : (item.link || '-')}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {item.publishedDate
                              ? new Date(item.publishedDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    )
  }

  // -------------------------------------------------------------------------
  // Render: List mode
  // -------------------------------------------------------------------------
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">RSS Parser Creator</h2>

        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Search + Add */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search parsers..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={openEditorForNew}>
                <Plus size={18} className="mr-2" />
                Add Parser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Loading...
            </div>
          ) : filteredParsers.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {searchTerm ? 'No parsers found' : 'No custom parsers configured'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Item Path</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParsers.map(parser => (
                  <TableRow key={parser.id}>
                    <TableCell className="pl-4">
                      <div className="font-medium">{parser.name}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {parser.description || '-'}
                    </TableCell>
                    <TableCell>
                      {parser.itemPath ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {parser.itemPath}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => openEditorForEdit(parser)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          className="hover:text-destructive"
                          onClick={() => setDeleteConfirmId(parser.id)}
                        >
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

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={open => !open && setDeleteConfirmId(null)}
        title="Delete Parser"
        description="Are you sure you want to delete this parser? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </Layout>
  )
}
