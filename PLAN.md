# AutoAnime Series Episode Tracking Enhancement

## Overview

Enhance the autoanime application to track individual episodes and display season/episode information on the series detail page.

## Current State

### Database
- `sonarr_series` table: stores series metadata with aggregate statistics (`season_count`, `episode_count`, `total_episode_count`, `episode_file_count`)
- `series_seasons` table: stores per-season statistics synced from Sonarr (`episode_count`, `episode_file_count`, `total_episode_count`, `monitored`)
- **Missing**: individual episode tracking for autoanime download status

### Backend
- `sonarrController.js`: syncs series, seasons, images, and alternate titles from Sonarr API
- `sonarrService.js`: provides API methods for Sonarr (`getAllSeries`, `getSeriesById`, etc.)
- **Missing**: episode-level sync from Sonarr `/api/v3/episode` endpoint

### Frontend
- `SeriesDetailPage.jsx`: displays series overview with status cards (status, seasons, episodes, monitored)
- **Missing**: season/episode list UI grouped by monitored status

---

## Phase 1: Database Schema - Individual Episode Tracking

### 1.1 Create `series_episodes` table

Create new table in `backend/src/db/schema.js`:

```javascript
const seriesEpisodes = pgTable('series_episodes', {
  id: serial('id').primaryKey(),
  sonarrSeriesId: integer('sonarr_series_id').notNull().references(() => sonarrSeries.id, { onDelete: 'cascade' }),
  seasonId: integer('season_id').references(() => seriesSeasons.id, { onDelete: 'cascade' }),
  sonarrEpisodeId: integer('sonarr_episode_id').notNull(),
  
  // Episode metadata
  title: text('title'),
  episodeNumber: integer('episode_number').notNull(),
  seasonNumber: integer('season_number').notNull(),
  overview: text('overview'),
  airDate: timestamp('air_date'),
  
  // Status flags from Sonarr
  hasFile: boolean('has_file').default(false),
  monitored: boolean('monitored').default(true),
  
  // AutoAnime-specific tracking
  autoDownloadStatus: varchar('auto_download_status'), // 'pending', 'downloading', 'completed', 'failed'
  downloadedAt: timestamp('downloaded_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_episodes_series').on(table.sonarrSeriesId),
  index('idx_episodes_season').on(table.seasonId),
  index('idx_episodes_sonarr_id').on(table.sonarrEpisodeId),
]);
```

### 1.2 Generate and Run Migration

```bash
cd backend
npm run db:generate
npm run db:migrate
```

---

## Phase 2: Backend - Episode Sync from Sonarr

### 2.1 Add Episode API Methods to `sonarrService.js`

```javascript
// Get all episodes for a series
const getEpisodesBySeries = async (seriesId) => {
  // GET /api/v3/episode?seriesId={seriesId}
};

// Get specific episode
const getEpisode = async (episodeId) => {
  // GET /api/v3/episode/{id}
};
```

### 2.2 Update `sonarrController.js`

- Add `syncEpisodes()` function to sync episodes from Sonarr API
- Update `syncSeries()` to call `syncEpisodes()` after syncing seasons
- Add `getSeriesEpisodes()` endpoint to return episodes grouped by season

### 2.3 Add New Routes

In `backend/src/routes/sonarr.js`:
- `GET /api/sonarr/series/:id/episodes` - get all episodes for a series
- `POST /api/sonarr/series/:id/episodes/sync` - sync episodes from Sonarr

---

## Phase 3: Frontend - Season/Episode List Display

### 3.1 Update `SeriesDetailPage.jsx`

Add season/episode section below the overview card:

```jsx
{/* Season/Episode List */}
<div className="mt-6 space-y-4">
  {seasons
    .filter(s => s.monitored)
    .sort((a, b) => a.seasonNumber - b.seasonNumber)
    .map(season => (
      <SeasonCard 
        key={season.id} 
        season={season} 
        episodes={episodes.filter(e => e.seasonNumber === season.seasonNumber)} 
      />
    ))}
</div>
```

### 3.2 Create `SeasonCard` Component

Display:
- Season header with number and monitored status
- Episode count: `{episodeFileCount}/{totalEpisodeCount}`
- Expandable episode list grouped by `monitored == true`
- Progress bar showing download percentage

### 3.3 Episode Count Logic

Per user requirement:
> "total episode count should be sum of all seasons with `monitored==true`"

Calculate in frontend:
```javascript
const totalMonitoredEpisodes = seasons
  .filter(s => s.monitored)
  .reduce((sum, s) => sum + (s.totalEpisodeCount || 0), 0);
```

---

## Phase 4: AutoAnime Download Status Tracking

### 4.1 Episode Status Values

| Status | Description |
|--------|-------------|
| `null` | Not tracked by autoanime |
| `pending` | Queued for download |
| `downloading` | Currently downloading via qBittorrent |
| `completed` | Downloaded successfully |
| `failed` | Download failed |

### 4.2 Integration Points

- Link `seriesEpisodes.autoDownloadStatus` with `qbittorrent_downloads` table
- Update status when RSS feed matches an episode
- Track download progress from qBittorrent API

---

## References

| Resource | Path |
|----------|------|
| Sonarr API v3 Spec | [@/api_docs/sonarr_v3.json](./api_docs/sonarr_v3.json) |
| Sonarr Series Example | [@/api_docs/sonarr_series_example.json](./api_docs/sonarr_series_example.json) |
| Database Schema | [@/backend/src/db/schema.js](./backend/src/db/schema.js) |
| qBittorrent API | [@/api_docs/WebUI-API-(qBittorrent-5.0).md](./api_docs/WebUI-API-(qBittorrent-5.0).md) |

---

## Verification Checklist

- [ ] Migration runs without errors
- [ ] Episodes sync from Sonarr API
- [ ] Series detail page displays season list
- [ ] Episode counts match Sonarr data
- [ ] Only monitored seasons shown in default view