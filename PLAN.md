I am doing local testing
1. trigger manual download
2. remove the download from download client (the file is not yet finished download)
3. flip auto download status for the episode to false

once I flip the auto download switch to false, add a new logic to check
1. in "download" table, is the file download completed?
1.1 if downloaded, ends here
1.2 if status is downloading, continue
2. update the "series_episode" table
  - set download_status_id to null
  - set download_at to null
  - set is_auto_download_enabled to false (I think this already done)
3. remove the record in "downloads" database


I saw the same logic I described above in qbittorrentService, you can reference there
```
// Delete the download record
        await db.delete(downloads).where(eq(downloads.id, download.id));

        // Reset the episode download status (but keep the RSS match)
        if (download.seriesEpisodeId) {
          await db.update(seriesEpisodes)
            .set({
              downloadStatusId: null,
              downloadedAt: null,
              updatedAt: now
            })
            .where(eq(seriesEpisodes.id, download.seriesEpisodeId));
        }
```