# Database Rename Plan: `sonarr_series` → `series`

This plan documents all changes needed to rename the `sonarr_series` table to `series` and update all related references throughout the codebase.

> [!NOTE]
> Since the database will be dropped and recreated, no migration files are needed. Just regenerate migrations after schema changes using `npm run db:generate`.

---

## Summary of Changes

| Change Type | Count |
|-------------|-------|
| Table rename | 1 |
| Column renames (`sonarr_series_id` → `series_id`) | 6 |
| Index renames | 6 |
| Foreign key constraint renames | 6 |
| JavaScript variable/export renames | Multiple |

---

## 1. Schema File Changes

### File: [schema.js](file:///home/coder/project/autoanime/backend/src/db/schema.js)

#### 1.1 Rename Table Definition (Line 14)

```diff
-const sonarrSeries = pgTable('sonarr_series', {
+const series = pgTable('series', {
```

#### 1.2 Rename Index Names (Lines 62-67)

```diff
-  index('idx_sonarr_series_title').on(table.title),
-  index('idx_sonarr_series_status').on(table.status),
-  index('idx_sonarr_series_last_synced').on(table.lastSyncedAt),
-  index('idx_sonarr_series_imdb').on(table.imdbId),
-  index('idx_sonarr_series_tmdb').on(table.tmdbId),
-  index('idx_sonarr_series_tvdb').on(table.tvdbId),
+  index('idx_series_title').on(table.title),
+  index('idx_series_status').on(table.status),
+  index('idx_series_last_synced').on(table.lastSyncedAt),
+  index('idx_series_imdb').on(table.imdbId),
+  index('idx_series_tmdb').on(table.tmdbId),
+  index('idx_series_tvdb').on(table.tvdbId),
```

#### 1.3 Update Foreign Key References

| Table | Line | Change |
|-------|------|--------|
| `rss_anime_configs` | 86 | `sonarr_series_id` → `series_id`, reference `series.id` |
| `qbittorrent_downloads` | 117 | `sonarr_series_id` → `series_id`, reference `series.id` |
| `series_images` | 135 | `sonarr_series_id` → `series_id`, reference `series.id` |
| `series_alternate_titles` | 148 | `sonarr_series_id` → `series_id`, reference `series.id` |
| `series_seasons` | 160 | `sonarr_series_id` → `series_id`, reference `series.id` |
| `series_episodes` | 181 | `sonarr_series_id` → `series_id`, reference `series.id` |

**Example change:**

```diff
-  sonarrSeriesId: integer('sonarr_series_id').references(() => sonarrSeries.id),
+  seriesId: integer('series_id').references(() => series.id),
```

#### 1.4 Update Index References on Foreign Keys

Update indexes that reference `sonarrSeriesId` to use `seriesId`:

| Table | Line | Change |
|-------|------|--------|
| `qbittorrent_downloads` | 130 | `table.sonarrSeriesId` → `table.seriesId` |
| `series_images` | 142 | `table.sonarrSeriesId` → `table.seriesId` |
| `series_alternate_titles` | 154 | `table.sonarrSeriesId` → `table.seriesId` |
| `series_seasons` | 175 | `table.sonarrSeriesId` → `table.seriesId` |
| `series_episodes` | 204 | `table.sonarrSeriesId` → `table.seriesId` |

#### 1.5 Update Module Exports (Lines 209-220)

```diff
 module.exports = {
-  sonarrSeries,
+  series,
   rssSources,
   rssAnimeConfigs,
   rssFeedItems,
   qbittorrentDownloads,
   settings,
   seriesImages,
   seriesAlternateTitles,
   seriesSeasons,
   seriesEpisodes
 };
```

---

## 2. Service & Controller Updates

Update all imports and usages of `sonarrSeries` and `sonarrSeriesId`.

### 2.1 File: [app.js](file:///home/coder/project/autoanime/backend/src/app.js)

| Line | Change |
|------|--------|
| 10 | Import `series` instead of `sonarrSeries` |
| 64, 83, 101 | `seriesImages.sonarrSeriesId` → `seriesImages.seriesId` |
| 67, 86, 104 | Object property `sonarrSeriesId` → `seriesId` |
| 180, 186, 188, 190 | `sonarrSeries` → `series` |

### 2.2 File: [sonarrService.js](file:///home/coder/project/autoanime/backend/src/services/sonarrService.js)

| Line | Change |
|------|--------|
| 3 | Import `series` instead of `sonarrSeries` |
| 141, 147, 149 | `sonarrSeries` → `series` |
| 158, 185, 210, 233 | `seriesSeasons.sonarrSeriesId` / `seriesEpisodes.sonarrSeriesId` → `.seriesId` |

### 2.3 File: [sonarrController.js](file:///home/coder/project/autoanime/backend/src/controllers/sonarrController.js)

| Line | Change |
|------|--------|
| 3 | Import `series` instead of `sonarrSeries` |
| 21, 40, 58, 87, 94 | `.sonarrSeriesId` → `.seriesId` |
| 24, 43, 61 | Object property `sonarrSeriesId` → `seriesId` |
| 80, 83 | Parameter rename if needed |

### 2.4 File: [rssController.js](file:///home/coder/project/autoanime/backend/src/controllers/rssController.js)

| Line | Change |
|------|--------|
| 125, 134 | `sonarrSeriesId` → `seriesId` |
| 148, 154 | `sonarrSeriesId` → `seriesId` |

### 2.5 File: [qbittorrentController.js](file:///home/coder/project/autoanime/backend/src/controllers/qbittorrentController.js)

| Line | Change |
|------|--------|
| 3 | Import `series` instead of `sonarrSeries` |
| 28, 46 | `sonarrSeriesId` → `seriesId` |

---

## 3. Post-Change Actions

1. **Delete existing migration files** in `backend/drizzle/`:
   - `0000_pretty_sebastian_shaw.sql`
   - `meta/0000_snapshot.json`
   - Any other migration files

2. **Regenerate migrations**:
   ```bash
   cd backend
   npm run db:generate
   ```

3. **Drop and recreate the database**:
   ```bash
   npm run db:migrate
   ```

---

## 4. Verification Checklist

- [ ] Schema file updated with new table name
- [ ] All `sonarrSeriesId` columns renamed to `seriesId`  
- [ ] All `sonarr_series_id` DB columns renamed to `series_id`
- [ ] All index names updated
- [ ] Module exports updated
- [ ] All service/controller imports updated
- [ ] All service/controller usages updated
- [ ] Migration files regenerated
- [ ] Database recreated successfully
- [ ] Application runs without errors
