import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DEFAULT_FORM = { name: "", url: "", description: "", templateId: "0", isEnabled: true, refreshInterval: "1h", refreshIntervalType: "human" }

export function RssFeedFormDialog({ open, onOpenChange, feed, templates, onSave }) {
  const [formData, setFormData] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (open) {
      if (feed) {
        setFormData({
          name: feed.name,
          url: feed.url,
          description: feed.description || "",
          templateId: String(feed.templateId),
          isEnabled: feed.isEnabled,
          refreshInterval: feed.refreshInterval || "1h",
          refreshIntervalType: feed.refreshIntervalType || "human",
        })
      } else {
        setFormData(DEFAULT_FORM)
      }
    }
  }, [open, feed])

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{feed ? "Edit RSS Feed" : "Add RSS Feed"}</DialogTitle>
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} disabled={!formData.name || !formData.url}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
