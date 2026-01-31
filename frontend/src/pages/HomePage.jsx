import { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { PosterBoard } from "../components/PosterBoard"
import { useNavigate } from "react-router"

export function HomePage() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const fetchSeries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/sonarr/series")
      if (!response.ok) {
        throw new Error("Failed to fetch series")
      }
      const data = await response.json()
      setSeries(data)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching series:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      await fetch("/api/sonarr/sync", { method: "POST" })
      await fetchSeries()
    } catch (err) {
      console.error("Error syncing:", err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSeries()
  }, [])

  const handleSeriesClick = (series) => {
    navigate(`/series/${series.id}`)
  }
  return (
    <Layout>
      <div className="min-h-screen">
        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-2 m-6 rounded-lg">
            Error: {error}
          </div>
        )}
        <PosterBoard
          series={series}
          onSeriesClick={handleSeriesClick}
          loading={loading}
          onRefresh={handleRefresh}
        />
      </div>
    </Layout>
  )
}
