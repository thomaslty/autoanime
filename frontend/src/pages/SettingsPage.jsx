import { useState, useEffect, useRef } from "react"
import { Layout } from "../components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, XCircle, X, TestTube, Eye, EyeOff } from "lucide-react"
import { getSocket } from "../hooks/useSocket"

export function SettingsPage() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState({
    savingSonarr: false,
    savingQbit: false,
    testingSonarr: false,
    testingQbit: false,
    saving: false
  })
  const [showPassword, setShowPassword] = useState({
    sonarrApiKey: false,
    qbitPassword: false
  })
  const [sonarrMessage, setSonarrMessage] = useState(null)
  const [qbitMessage, setQbitMessage] = useState(null)
  const sonarrTimerRef = useRef(null)
  const qbitTimerRef = useRef(null)
  const [config, setConfig] = useState({
    sonarrUrl: "",
    sonarrApiKey: "",
    qbitUrl: "",
    qbitUsername: "",
    qbitPassword: ""
  })
  const [originalConfig, setOriginalConfig] = useState({
    sonarrUrl: "",
    sonarrApiKey: "",
    qbitUrl: "",
    qbitUsername: "",
    qbitPassword: ""
  })

  useEffect(() => {
    fetchHealth()
    fetchSettings()
  }, [])

  // Real-time service status via WebSocket
  useEffect(() => {
    const socket = getSocket()
    const handleStatus = (status) => {
      setHealth((prev) => ({ ...prev, ...status }))
    }
    socket.on('services:status', handleStatus)
    return () => socket.off('services:status', handleStatus)
  }, [])

  const fetchHealth = async () => {
    try {
      const response = await fetch("/health")
      const data = await response.json()
      setHealth(data)
    } catch (err) {
      console.error("Error fetching health:", err)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      if (data.success) {
        const newConfig = {
          sonarrUrl: data.config.sonarr.url || "",
          sonarrApiKey: data.config.sonarr.apiKey || "",
          qbitUrl: data.config.qbittorrent.url || "",
          qbitUsername: data.config.qbittorrent.username || "",
          qbitPassword: data.config.qbittorrent.password || ""
        }
        setConfig(newConfig)
        setOriginalConfig(newConfig)
      }
    } catch (err) {
      console.error("Error fetching settings:", err)
      setSonarrMessage({ type: "error", text: "Failed to load settings" })
      setQbitMessage({ type: "error", text: "Failed to load settings" })
    }
  }

  const showSonarrMessage = (type, text) => {
    if (sonarrTimerRef.current) clearTimeout(sonarrTimerRef.current)
    setSonarrMessage({ type, text })
    sonarrTimerRef.current = setTimeout(() => {
      setSonarrMessage(null)
      sonarrTimerRef.current = null
    }, 10000)
  }

  const dismissSonarrMessage = () => {
    if (sonarrTimerRef.current) clearTimeout(sonarrTimerRef.current)
    sonarrTimerRef.current = null
    setSonarrMessage(null)
  }

  const showQbitMessage = (type, text) => {
    if (qbitTimerRef.current) clearTimeout(qbitTimerRef.current)
    setQbitMessage({ type, text })
    qbitTimerRef.current = setTimeout(() => {
      setQbitMessage(null)
      qbitTimerRef.current = null
    }, 10000)
  }

  const dismissQbitMessage = () => {
    if (qbitTimerRef.current) clearTimeout(qbitTimerRef.current)
    qbitTimerRef.current = null
    setQbitMessage(null)
  }

  const handleSaveSonarr = async () => {
    setLoading(prev => ({ ...prev, savingSonarr: true }))

    try {
      // Test connection first
      const testResponse = await fetch("/api/settings/sonarr/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: config.sonarrUrl,
          apiKey: config.sonarrApiKey.includes("•") ? undefined : config.sonarrApiKey
        })
      })
      const testData = await testResponse.json()
      if (!testData.connected) {
        showSonarrMessage("error", testData.error || "Cannot connect to Sonarr")
        return
      }

      const response = await fetch("/api/settings/sonarr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: config.sonarrUrl,
          apiKey: config.sonarrApiKey.includes("•") ? undefined : config.sonarrApiKey
        })
      })

      const data = await response.json()

      if (data.success) {
        showSonarrMessage("success", "Sonarr configuration saved successfully")
        setOriginalConfig(prev => ({ ...prev, sonarrUrl: config.sonarrUrl }))
        fetchHealth()
      } else {
        showSonarrMessage("error", data.error || "Failed to save Sonarr configuration")
      }
    } catch (err) {
      showSonarrMessage("error", err.message)
    } finally {
      setLoading(prev => ({ ...prev, savingSonarr: false }))
    }
  }

  const handleTestSonarr = async () => {
    setLoading(prev => ({ ...prev, testingSonarr: true }))
    
    try {
      const response = await fetch("/api/settings/sonarr/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: config.sonarrUrl,
          apiKey: config.sonarrApiKey.includes("•") ? undefined : config.sonarrApiKey
        })
      })

      const data = await response.json()
      
      if (data.connected) {
        showSonarrMessage("success", `Sonarr connection successful (${data.version})`)
      } else {
        showSonarrMessage("error", data.error || "Sonarr connection failed")
      }
    } catch (err) {
      showSonarrMessage("error", err.message)
    } finally {
      setLoading(prev => ({ ...prev, testingSonarr: false }))
    }
  }

  const handleSaveQbittorrent = async () => {
    setLoading(prev => ({ ...prev, savingQbit: true }))

    try {
      // Test connection first
      const testResponse = await fetch("/api/settings/qbittorrent/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: config.qbitUrl,
          username: config.qbitUsername,
          password: config.qbitPassword.includes("•") ? undefined : config.qbitPassword
        })
      })
      const testData = await testResponse.json()
      if (!testData.connected) {
        showQbitMessage("error", testData.error || "Cannot connect to qBittorrent")
        return
      }

      const response = await fetch("/api/settings/qbittorrent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: config.qbitUrl,
          username: config.qbitUsername,
          password: config.qbitPassword.includes("•") ? undefined : config.qbitPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        showQbitMessage("success", "qBittorrent configuration saved successfully")
        setOriginalConfig(prev => ({
          ...prev,
          qbitUrl: config.qbitUrl,
          qbitUsername: config.qbitUsername
        }))
        fetchHealth()
      } else {
        showQbitMessage("error", data.error || "Failed to save qBittorrent configuration")
      }
    } catch (err) {
      showQbitMessage("error", err.message)
    } finally {
      setLoading(prev => ({ ...prev, savingQbit: false }))
    }
  }

  const handleTestQbittorrent = async () => {
    setLoading(prev => ({ ...prev, testingQbit: true }))
    
    try {
      const response = await fetch("/api/settings/qbittorrent/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: config.qbitUrl,
          username: config.qbitUsername,
          password: config.qbitPassword.includes("•") ? undefined : config.qbitPassword
        })
      })

      const data = await response.json()
      
      if (data.connected) {
        showQbitMessage("success", `qBittorrent connection successful (${data.version})`)
      } else {
        showQbitMessage("error", data.error || "qBittorrent connection failed")
      }
    } catch (err) {
      showQbitMessage("error", err.message)
    } finally {
      setLoading(prev => ({ ...prev, testingQbit: false }))
    }
  }

  const isSonarrChanged = config.sonarrUrl !== originalConfig.sonarrUrl || 
                         (config.sonarrApiKey && !config.sonarrApiKey.includes("•"))
  const isQbitChanged = config.qbitUrl !== originalConfig.qbitUrl ||
                        config.qbitUsername !== originalConfig.qbitUsername ||
                        (config.qbitPassword && !config.qbitPassword.includes("•"))

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl">
        <h2 className="text-2xl font-bold">Settings</h2>

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
            <CardTitle className="flex items-center justify-between">
              Sonarr Configuration
              {isSonarrChanged && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  Unsaved changes
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sonarrUrl">Sonarr URL</Label>
              <Input
                id="sonarrUrl"
                value={config.sonarrUrl}
                onChange={(e) => setConfig({ ...config, sonarrUrl: e.target.value })}
                placeholder="http://localhost:8989"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sonarrApiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="sonarrApiKey"
                  type={showPassword.sonarrApiKey ? "text" : "password"}
                  value={config.sonarrApiKey}
                  onChange={(e) => setConfig({ ...config, sonarrApiKey: e.target.value })}
                  placeholder="Enter Sonarr API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9 px-0"
                  onClick={() => setShowPassword(prev => ({ ...prev, sonarrApiKey: !prev.sonarrApiKey }))}
                >
                  {showPassword.sonarrApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleTestSonarr} 
                disabled={loading.testingSonarr || !config.sonarrUrl}
                variant="outline"
              >
                {loading.testingSonarr ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              <Button
                onClick={handleSaveSonarr}
                disabled={loading.savingSonarr || (!isSonarrChanged && !config.sonarrUrl)}
              >
                {loading.savingSonarr ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </div>
            {sonarrMessage && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm relative pr-9 ${
                sonarrMessage.type === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }`}>
                {sonarrMessage.type === "success" ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                {sonarrMessage.text}
                <button
                  onClick={dismissSonarrMessage}
                  className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              qBittorrent Configuration
              {isQbitChanged && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  Unsaved changes
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qbitUrl">qBittorrent URL</Label>
              <Input
                id="qbitUrl"
                value={config.qbitUrl}
                onChange={(e) => setConfig({ ...config, qbitUrl: e.target.value })}
                placeholder="http://localhost:8080"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qbitUsername">Username</Label>
              <Input
                id="qbitUsername"
                value={config.qbitUsername}
                onChange={(e) => setConfig({ ...config, qbitUsername: e.target.value })}
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qbitPassword">Password</Label>
              <div className="relative">
                <Input
                  id="qbitPassword"
                  type={showPassword.qbitPassword ? "text" : "password"}
                  value={config.qbitPassword}
                  onChange={(e) => setConfig({ ...config, qbitPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9 px-0"
                  onClick={() => setShowPassword(prev => ({ ...prev, qbitPassword: !prev.qbitPassword }))}
                >
                  {showPassword.qbitPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleTestQbittorrent} 
                disabled={loading.testingQbit || !config.qbitUrl || !config.qbitUsername}
                variant="outline"
              >
                {loading.testingQbit ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              <Button
                onClick={handleSaveQbittorrent}
                disabled={loading.savingQbit || (!isQbitChanged && !config.qbitUrl)}
              >
                {loading.savingQbit ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </div>
            {qbitMessage && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm relative pr-9 ${
                qbitMessage.type === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }`}>
                {qbitMessage.type === "success" ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                {qbitMessage.text}
                <button
                  onClick={dismissQbitMessage}
                  className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
