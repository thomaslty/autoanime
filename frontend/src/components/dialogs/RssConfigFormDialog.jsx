import { useState, useEffect, useMemo } from "react"
import { SearchableSelect } from "@/components/SearchableSelect"
import { Eye, HelpCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const EMPTY_FORM = { name: "", description: "", regex: "", rssSourceId: "", offset: "", isEnabled: true }

export function RssConfigFormDialog({ open, onOpenChange, config, sources, onSave }) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [regexError, setRegexError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewing, setPreviewing] = useState(false)

  const sourceItems = useMemo(() =>
    sources.map(s => ({ label: s.name, value: String(s.id) })),
    [sources]
  )

  useEffect(() => {
    if (open) {
      if (config) {
        setFormData({
          name: config.name,
          description: config.description || "",
          regex: config.regex,
          rssSourceId: config.rssSourceId ? String(config.rssSourceId) : "",
          offset: config.offset !== null && config.offset !== undefined ? String(config.offset) : "",
          isEnabled: config.isEnabled,
        })
      } else {
        setFormData(EMPTY_FORM)
      }
      setPreview(null)
      setRegexError(null)
    }
  }, [open, config])

  const validateRegex = (pattern) => {
    if (!pattern || pattern.trim() === "") {
      setRegexError("Regex pattern cannot be empty")
      return false
    }
    if (!pattern.includes(":ep:")) {
      setRegexError("Pattern must include :ep: placeholder for episode matching")
      return false
    }
    setRegexError(null)
    return true
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
          regex: formData.regex,
          offset: formData.offset ? parseInt(formData.offset, 10) : null,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        setRegexError(data.error)
      } else {
        const data = await response.json()
        setPreview(data)
      }
    } catch (err) {
      console.error("Preview error:", err)
    } finally {
      setPreviewing(false)
    }
  }

  const handleSave = () => {
    if (!formData.name || !formData.regex) return
    if (!validateRegex(formData.regex)) return
    onSave(formData)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o)
      if (!o) {
        setFormData(EMPTY_FORM)
        setPreview(null)
        setRegexError(null)
      }
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{config ? "Edit RSS Config" : "Add RSS Config"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
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
            <div className="flex items-center gap-2">
              <Label htmlFor="regex">Regex Pattern</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-2">Custom Regex Symbols:</p>
                    <ul className="space-y-1">
                      <li><b>:ep:</b> - Episode number placeholder</li>
                      <li><b>:*:</b> - Any character (wildcard)</li>
                    </ul>
                    <p className="mt-2 text-xs">Example: <code>:*:[:ep:]:*:</code> matches any episode of that series</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="regex"
              value={formData.regex}
              onChange={(e) => handleRegexChange(e.target.value)}
              placeholder="e.g. :*:[Blue Lock][:ep:]:*:"
              className={regexError ? "border-destructive" : ""}
            />
            {regexError && <p className="text-xs text-destructive">{regexError}</p>}
            <p className="text-xs text-muted-foreground">Use custom syntax with :ep: for episode number and :*: for wildcards</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="offset">Episode Offset (optional)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Some anime releases continue episode numbering from previous seasons. For example, S02E01 might be labeled as E13 if S01 had 12 episodes. Set offset to subtract from the episode number (e.g., offset 12 means E13 → E1).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="offset"
              type="number"
              min="0"
              value={formData.offset}
              onChange={(e) => setFormData({ ...formData, offset: e.target.value })}
              placeholder="e.g. 12"
            />
            <p className="text-xs text-muted-foreground">Offset subtracted from RSS episode numbers (e.g., 12 means E13 becomes E1)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">RSS Source (optional)</Label>
            <div className="flex gap-2">
              <SearchableSelect
                items={sourceItems}
                value={formData.rssSourceId}
                onChange={(value) => {
                  setFormData({ ...formData, rssSourceId: value })
                  setPreview(null)
                }}
                placeholder="Select source..."
                className="flex-1"
              />
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
              <div className="max-h-64 overflow-auto border rounded-md w-full">
                {preview.matched.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No items matched</div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="max-w-0">RSS Title</TableHead>
                          <TableHead className="w-32 text-right">Matched Episode</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.matched.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs font-mono max-w-0 overflow-hidden text-ellipsis">{item.title}</TableCell>
                            <TableCell className="text-xs font-semibold text-right whitespace-nowrap">
                              {item.matchedEpisode || (
                                <span className="text-muted-foreground">
                                  {item.rssEpisode ? `E${item.rssEpisode}` : '-'}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.regex || !!regexError}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
