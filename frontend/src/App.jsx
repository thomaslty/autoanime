import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check backend health on mount
    fetch('/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data)
        setLoading(false)
      })
      .catch(err => {
        setApiStatus({ status: 'error', message: err.message })
        setLoading(false)
      })
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>AutoAnime</h1>
        <p className="subtitle">Chinese Community Focused Anime Auto Download Tool</p>
      </header>

      <main className="main">
        <section className="status-card">
          <h2>System Status</h2>
          {loading ? (
            <p>Checking backend connection...</p>
          ) : (
            <div className="status-info">
              <p>
                <strong>Backend:</strong>{' '}
                <span className={apiStatus?.status === 'ok' ? 'status-ok' : 'status-error'}>
                  {apiStatus?.status === 'ok' ? 'Connected' : 'Disconnected'}
                </span>
              </p>
              {apiStatus?.timestamp && (
                <p><strong>Last check:</strong> {new Date(apiStatus.timestamp).toLocaleString()}</p>
              )}
            </div>
          )}
        </section>

        <section className="features">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>RSS Parser</h3>
              <p>Custom and predefined RSS feed support</p>
            </div>
            <div className="feature-card">
              <h3>Sonarr Integration</h3>
              <p>Seamless integration with Sonarr</p>
            </div>
            <div className="feature-card">
              <h3>qBittorrent</h3>
              <p>Download management integration</p>
            </div>
            <div className="feature-card">
              <h3>AI Features</h3>
              <p>Coming in Phase 2</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>AutoAnime v1.0.0</p>
      </footer>
    </div>
  )
}

export default App
