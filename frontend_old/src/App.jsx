import { Routes, Route } from 'react-router'
import { HomePage } from './pages/HomePage'
import { SeriesDetailPage } from './pages/SeriesDetailPage'
import { RSSPage } from './pages/RSSPage'
import { RSSSourcesPage } from './pages/RSSSourcesPage'
import { RSSAnimeConfigsPage } from './pages/RSSAnimeConfigsPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/series/:id" element={<SeriesDetailPage />} />
        <Route path="/rss" element={<RSSPage />} />
        <Route path="/rss/sources" element={<RSSSourcesPage />} />
        <Route path="/rss/anime-configs" element={<RSSAnimeConfigsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
  )
}

export default App
