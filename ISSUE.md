clean up series table, focus on actual data that is using
- create a new table called series_metadata
- identify all columns that are not used
- move the not in used columns to series_metadata table
- remove the not in used columns from series table
- update sonarr sync to use the new table to save the metadata


Now I have a complete picture. Let me analyze deeply:
ACTUALLY USED IN FRONTEND (SeriesCard.jsx + SeriesDetailPage.jsx):
- id, title, posterPath - Core display
- status, monitored, isAutoDownloadEnabled - Status logic
- rssConfigId - RSS badge
- overview - Description display
- seasons (from episodes query, not series table)
ACTUALLY USED IN BACKEND:
- id, sonarrId - Core IDs
- title - Logging in scheduler
- isAutoDownloadEnabled, rssConfigId - RSS matching logic
- downloadStatusId - Download tracking
- path - Post-processing
- lastSyncedAt - Sync tracking


ONLY KEEP THE ACTIVELY IN USE FIELDS, MOVE OTHERS TO series_metadata table

todo:
1. deeply analysis backend code and frontend code to find the fields ACTUALLY in use
2. do not run db generation and migration, I will run it manually