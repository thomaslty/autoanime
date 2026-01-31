import { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

export function SettingsPage() {
  const [health, setHealth] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [config, setConfig] = useState({
    qbitUrl: import.meta.env.VITE_QBITTORRENT_URL || "http://localhost:8080",
    qbitUsername: "",
    qbitPassword: ""
  })

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/health")
        const data = await response.json()
        setHealth(data)
      } catch (err) {
        console.error("Error fetching health:", err)
      }
    }
    fetchHealth()
  }, [])

  const handleSaveQbittorrent = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/qbittorrent/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: config.qbitUrl,
          username: config.qbitUsername,
          password: config.qbitPassword
        })
      })

      if (!response.ok) throw new Error("Failed to save configuration")

      setMessage({ type: "success", text: "Configuration saved successfully" })
    } catch (err) {
      setMessage({ type: "error", text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">Settings</h2>

        {message && (
          <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}>
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Backend</span>
              <Badge variant="default">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Database</span>
              <Badge variant={health?.database === 'connected' ? "default" : "destructive"}>
                {health?.database || "Unknown"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sonarr</span>
              <Badge variant={health?.sonarr?.connected ? "default" : "destructive"}>
                {health?.sonarr?.connected ? `Connected (${health?.sonarr?.version || ""})` : "Disconnected"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">qBittorrent</span>
              <Badge variant={health?.qbittorrent?.connected ? "default" : "destructive"}>
                {health?.qbittorrent?.connected ? `Connected (${health?.qbittorrent?.version || ""})` : "Disconnected"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sonarr Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Sonarr URL</Label>
              <Input
                value={import.meta.env.VITE_SONARR_URL || "http://localhost:8989"}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={import.meta.env.VITE_SONARR_API_KEY ? "••••••••" : ""}
                readOnly
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>qBittorrent Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>qBittorrent URL</Label>
              <Input
                value={config.qbitUrl}
                onChange={(e) => setConfig({ ...config, qbitUrl: e.target.value })}
                placeholder="http://localhost:8080"
              />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={config.qbitUsername}
                onChange={(e) => setConfig({ ...config, qbitUsername: e.target.value })}
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={config.qbitPassword}
                onChange={(e) => setConfig({ ...config, qbitPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <Button onClick={handleSaveQbittorrent} disabled={saving}>
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
