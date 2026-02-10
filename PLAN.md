# Development Plan

## Current Status

### qBittorrent Integration
- **Core download functionality**: Implemented - can add magnets to qBittorrent
- **Status tracking**: Not implemented - no automatic sync of download progress
- **Post-processing**: Not implemented - no file moving/renaming after completion

### RSS & Auto-Download Workflow
- **Scheduler**: Runs every 60 seconds, fetches overdue RSS feeds
- **Matching**: Regex-based matching of RSS items to episodes with offset support
- **Trigger**: Downloads triggered immediately after match during scheduler run

## Completed Items

1. ✅ **Immediate RSS fetch on feed creation** - When a new RSS feed is added, it immediately triggers a fetch in the background (non-blocking)

2. ✅ **Historical RSS item matching** - Added `processHistoricalRssItems()` function that matches existing RSS items when RSS config is assigned to series/season

3. ✅ **Auto-trigger match & download on config assignment** - `assignToSeries()` and `assignToSeason()` now automatically trigger historical RSS matching and downloads in the background

4. ✅ **Download status synchronization** - Added `syncDownloadStatuses()` to qbittorrentService that runs every scheduler cycle (60s) to sync torrent progress from qBittorrent to the database

5. ✅ **Series path column** - Added `path` column to series table to store the series folder path from Sonarr for post-download file operations

## Remaining Work

### 1. Historical RSS Item Matching
**Problem**: Currently `triggerAutoDownloads()` only processes **new** RSS items. When an RSS config is applied to a series/season, existing RSS items that match are never processed.

**Solution**:
- Add a function to match historical RSS items against a series/season config
- This should be called when RSS config is assigned to series/season
- Should respect the same regex patterns and offset logic as new items

**Implementation Points**:
- Extend `rssSchedulerService.js` or create new function in `rssConfigService.js`
- Query existing RSS items from the assigned RSS source
- Match against series/season episodes and link them

### 2. Trigger Match & Download When Config Applied
**Problem**: When assigning RSS config to a series/season via API (`assignToSeries`, `assignToSeason`), nothing happens automatically. Users must wait for the scheduler or manually use Preview/Apply.

**Solution**:
- After `assignToSeries()` / `assignToSeason()` saves the config:
  1. Trigger historical RSS matching for that series/season
  2. For matched items where `isAutoDownloadEnabled=true`, immediately trigger downloads

**Implementation Points**:
- Modify `rssConfigService.js` - `assignToSeries()` and `assignToSeason()`
- Reuse existing matching logic from scheduler
- Call `qbittorrentService.addMagnet()` for matches when auto-download is enabled

### 3. Download Status Synchronization
**Problem**: Once a magnet is added to qBittorrent, the system has no visibility into download progress. Episode statuses remain stale (PENDING/DOWNLOADING).

**Solution**:
- Create a background job to sync qBittorrent torrent statuses
- Map qBittorrent states to internal status values
- Update `downloads` table and episode `autoDownloadStatus`

**Implementation Points**:
- Add to scheduler or create separate sync job
- Use existing `/api/qbittorrent/sync` endpoint logic
- Handle states: downloading, completed, error, etc.
- Update UI to display real-time download progress

### 4. Post-Download Processing (Future)
- after download is completed, update the download status to DOWNLOADED
- then you should copy the file to `path` in series table
   - noted that you should add a new column `path` to series table
   - the data is from the sync sonnarr json response
     ```
     {
      "path": "/media/Frieren - Beyond Journey's End"
     }
     ```
- after copy the file to `path` in series table, rename the file to `SXXEXX`
- trigger sonnarr import (refresh), and trigger sonarr rename function
- [No need to implement] Integration with Sonarr for import
- [No need to implement] Cleanup of completed torrents

## Implementation Priority

### Completed
1. ✅ **High**: Item #2 (Trigger match & download when config applied) - Immediate user value
2. ✅ **High**: Item #1 (Historical RSS matching) - Required for #2 to be useful  
3. ✅ **Medium**: Item #3 (Status sync) - Download statuses now sync every 60s
4. ✅ **Low**: Item #5 (Path column) - Added for future post-processing

### Remaining
4. **Low**: Item #4 (Post-download processing) - Copy/rename files to series path after download completes

## Key Files Modified

- `/backend/src/services/rssConfigService.js` - Added `processHistoricalRssItems()`, updated `assignToSeries()`, `assignToSeason()`, and `applySeriesRssPreview()`
- `/backend/src/services/rssSchedulerService.js` - Added download status sync to scheduler cycle
- `/backend/src/services/qbittorrentService.js` - Added `syncDownloadStatuses()` and `mapQbitStateToStatus()`
- `/backend/src/controllers/sonarrController.js` - Updated `getSeriesData()` to include path from Sonarr
- `/backend/src/db/schema.js` - Added `path` column to series table

## API Endpoints

- `PUT /api/sonarr/series/:id/rss-config` - Now triggers historical RSS matching + downloads in background
- `PUT /api/sonarr/series/:id/seasons/:seasonNumber/rss-config` - Now triggers historical RSS matching + downloads in background
- `POST /api/rss-config/preview/series/:seriesId/apply` - Accepts optional `triggerDownloads: true` body parameter to auto-download matched items
