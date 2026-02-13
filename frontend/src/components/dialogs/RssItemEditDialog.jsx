import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function RssItemEditDialog({ open, onOpenChange, item, onSave }) {
  const [editForm, setEditForm] = useState({ title: "", link: "", magnetLink: "" })

  useEffect(() => {
    if (open && item) {
      setEditForm({
        title: item.title || "",
        link: item.link || "",
        magnetLink: item.magnetLink || "",
      })
    }
  }, [open, item])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit RSS Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="item-title">Title</Label>
            <Input
              id="item-title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-link">Link</Label>
            <Input
              id="item-link"
              value={editForm.link}
              onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-magnet">Magnet Link</Label>
            <Input
              id="item-magnet"
              value={editForm.magnetLink}
              onChange={(e) => setEditForm({ ...editForm, magnetLink: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(editForm)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
