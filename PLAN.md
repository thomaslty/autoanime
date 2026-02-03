# Fix: Series Episodes Data Loss on Server Restart

## Problem Description

When the backend server restarts, all records in the `series_episodes` table are cleared due to cascade deletes triggered by season deletion.

## Root Cause

`syncSeasons()` uses destructive delete-then-insert, which triggers cascade deletion on `series_episodes` via the `seasonId` foreign key.

---

## Proposed Changes

### Strategy: Progressive Upsert (Non-Destructive)

Use **insert-if-missing, update-metadata-only** logic across ALL sync operations (startup and explicit `/api/sonarr/sync`):

- **Insert** new records if they don't exist
- **Update** only metadata fields (title, overview, stats, etc.)
- **Preserve** user-controlled fields (`isAutoDownloadEnabled`, `autoDownloadStatus`, `downloadedAt`)
- **Never delete** existing records

---

### Backend

#### [MODIFY] [app.js](file:///home/coder/project/autoanime/backend/src/app.js)

Replace destructive sync functions with progressive upsert:

**`upsertSeasons()` - Progressive update:**
```javascript
const upsertSeasons = async (seriesId, seasons, now) => {
  if (!seasons || seasons.length === 0) return;

  for (const season of seasons) {
    const existing = await db.select().from(seriesSeasons).where(
      and(
        eq(seriesSeasons.seriesId, seriesId),
        eq(seriesSeasons.seasonNumber, season.seasonNumber)
      )
    );

    // Metadata fields only (preserve auto-download fields)
    const metadataUpdate = {
      monitored: season.monitored,
      episodeCount: season.statistics?.episodeCount,
      episodeFileCount: season.statistics?.episodeFileCount,
      totalEpisodeCount: season.statistics?.totalEpisodeCount,
      sizeOnDisk: season.statistics?.sizeOnDisk,
      percentOfEpisodes: season.statistics?.percentOfEpisodes,
      nextAiring: parseTimestamp(season.statistics?.nextAiring),
      previousAiring: parseTimestamp(season.statistics?.previousAiring),
      updatedAt: now
    };

    if (existing.length > 0) {
      await db.update(seriesSeasons).set(metadataUpdate).where(eq(seriesSeasons.id, existing[0].id));
    } else {
      await db.insert(seriesSeasons).values({
        seriesId,
        seasonNumber: season.seasonNumber,
        ...metadataUpdate,
        createdAt: now
      });
    }
  }
};
```

**`upsertSeriesImages()` and `upsertAlternateTitles()`** - Same pattern (check exists, update or insert).

---

#### [MODIFY] [sonarrController.js](file:///home/coder/project/autoanime/backend/src/controllers/sonarrController.js)

Update `syncSeasons()` and `syncEpisodes()` to use progressive upsert:

**`syncEpisodes()` - Progressive update (preserve auto-download fields):**
```javascript
const syncEpisodes = async (seriesId, sonarrSeriesId, now) => {
  const episodes = await sonarrService.getEpisodesBySeries(sonarrSeriesId);
  if (!episodes || episodes.length === 0) return 0;

  const seasons = await db.select().from(seriesSeasons).where(eq(seriesSeasons.seriesId, seriesId));
  const seasonIdMap = Object.fromEntries(seasons.map(s => [s.seasonNumber, s.id]));

  for (const episode of episodes) {
    const existing = await db.select().from(seriesEpisodes).where(
      eq(seriesEpisodes.sonarrEpisodeId, episode.id)
    );

    // Metadata only - preserve isAutoDownloadEnabled, autoDownloadStatus, downloadedAt
    const metadataUpdate = {
      title: episode.title,
      overview: episode.overview,
      airDate: parseTimestamp(episode.airDateUtc),
      hasFile: episode.hasFile || false,
      monitored: episode.monitored,
      updatedAt: now
    };

    if (existing.length > 0) {
      await db.update(seriesEpisodes).set(metadataUpdate).where(eq(seriesEpisodes.id, existing[0].id));
    } else {
      await db.insert(seriesEpisodes).values({
        seriesId,
        seasonId: seasonIdMap[episode.seasonNumber] || null,
        sonarrEpisodeId: episode.id,
        episodeNumber: episode.episodeNumber,
        seasonNumber: episode.seasonNumber,
        ...metadataUpdate,
        createdAt: now
      });
    }
  }

  return episodes.length;
};
```

> [!IMPORTANT]
> **Fields to preserve (never overwrite):**
> - `isAutoDownloadEnabled`
> - `autoDownloadStatus`
> - `downloadedAt`

---

## Summary of Changes

| Function | Location | Change |
|----------|----------|--------|
| `syncSeriesImages` | app.js | → `upsertSeriesImages` (no delete) |
| `syncAlternateTitles` | app.js | → `upsertAlternateTitles` (no delete) |
| `syncSeasons` | app.js, controller | → `upsertSeasons` (no delete) |
| `syncEpisodes` | controller | → Progressive upsert (preserve auto-download fields) |

---

## Verification Plan

1. Start servers, trigger initial sync, verify episodes exist with default auto-download status
2. Toggle auto-download on some episodes
3. Trigger `/api/sonarr/sync` again
4. Verify: episodes still exist, auto-download settings preserved
5. Restart servers
6. Verify: all data intact
