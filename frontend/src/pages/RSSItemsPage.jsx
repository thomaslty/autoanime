import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { Layout } from "../components/Layout"
import { ArrowLeft, Search, Download, Edit2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function RSSItemsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [feed, setFeed] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({ title: "", link: "", magnetLink: "" })

  const fetchFeed = async () => {
    try {
      const response = await fetch(`/api/rss/${id}`)
      if (response.ok) {
        const data = await response.json()
        setFeed(data)
      }
    } catch (err) {
      console.error("Error fetching feed:", err)
    }
  }

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rss/${id}/items`)
      if (!response.ok) throw new Error("Failed to fetch items")
      const data = await response.json()
      setItems(data)
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

  useEffect(() => {
    fetchFeed()
    fetchItems()
  }, [id])

  const handleEditSave = async () => {
    try {
      const response = await fetch(`/api/rss/${id}/items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      if (!response.ok) throw new Error("Failed to update item")
      setEditingItem(null)
      fetchItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDownload = async (item) => {
    try {
      const response = await fetch(`/api/rss/${id}/items/${item.id}/download`, { method: "POST" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send to qBittorrent")
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/rss/sources")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">RSS Items</h2>
            {feed && <p className="text-sm text-muted-foreground">{feed.name}</p>}
          </div>
        </div>

        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Loading...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {searchTerm ? "No items found" : "No RSS items"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs pl-4">
                      <div className="font-medium truncate">{item.title || "-"}</div>
                      {item.author && <div className="text-xs text-muted-foreground truncate">{item.author}</div>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.category || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.publishedDate ? new Date(item.publishedDate).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.link && (
                          <Button variant="ghost" size="icon" asChild title="Open Link">
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={16} />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(item)} title="Send to qBittorrent">
                          <Download size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingItem(item)
                          setEditForm({
                            title: item.title || "",
                            link: item.link || "",
                            magnetLink: item.magnetLink || ""
                          })
                        }} title="Edit">
                          <Edit2 size={16} />
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

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
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
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
