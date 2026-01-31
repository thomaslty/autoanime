import { useState, useEffect } from "react"
import { useParams, Link } from "react-router"
import { Layout } from "../components/Layout"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function SeriesDetailPage() {
  const { id } = useParams()
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/sonarr/series/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch series")
        }
        const data = await response.json()
        setSeries(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSeries()
  }, [id])

  const handleRefresh = async () => {
    try {
      await fetch(`/api/sonarr/series/${id}/refresh`, { method: "POST" })
    } catch (err) {
      console.error("Error triggering refresh:", err)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen text-muted-foreground">
          Loading...
        </div>
      </Layout>
    )
  }

  if (error || !series) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 rounded-lg">
            Error: {error || "Series not found"}
          </div>
        </div>
      </Layout>
    )
  }

  const posterUrl = series.posterPath
    ? `${import.meta.env.VITE_SONARR_URL}/api/v3/mediacover/${series.sonarrId}/poster.jpg?apikey=${import.meta.env.VITE_SONARR_API_KEY}`
    : null

  return (
    <Layout>
      <div className="p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Library</span>
        </Link>

        <div className="flex gap-8">
          <div className="flex-shrink-0">
            <Card className="w-64 overflow-hidden">
              <div className="aspect-[2/3]">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={series.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 150'%3E%3Crect fill='%23333' width='100' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='12'%3ENo Poster%3C/text%3E%3C/svg%3E"
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No Poster</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
                <p className="text-muted-foreground">{series.titleSlug}</p>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw size={18} className="mr-2" />
                <span>Refresh</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Status</p>
                  <p className="font-medium">{series.status || "Unknown"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Seasons</p>
                  <p className="font-medium">{series.seasonCount || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Episodes</p>
                  <p className="font-medium">{series.episodeFileCount}/{series.totalEpisodeCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Monitored</p>
                  <p className="font-medium">{series.monitored ? "Yes" : "No"}</p>
                </CardContent>
              </Card>
            </div>

            {series.overview && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm mb-2">Overview</p>
                  <p>{series.overview}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
