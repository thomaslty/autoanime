import { useEffect } from "react"
import { useNavigate } from "react-router"

export function RSSPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate("/rss/sources", { replace: true })
  }, [navigate])

  return null
}
