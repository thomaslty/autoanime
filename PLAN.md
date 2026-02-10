Based on my investigation of the codebase, here is the current status of the qBittorrent integration and auto-download workflow:

1. Is qBittorrent integration finished?
Partially.

Finished: The core logic for matching RSS items to episodes and triggering downloads in qBittorrent is implemented. The qbittorrentService can successfully communicate with the qBittorrent API to add magnets.
Incomplete:
Status Tracking: While you can trigger a download, the system doesn't automatically track its progress. The series_episodes status stays as PENDING and doesn't move to DOWNLOADING or DOWNLOADED automatically.
Status Sync: There is an API endpoint (/api/qbittorrent/sync) to pull current torrent statuses from qBittorrent, but it isn't currently called by any background job.
Post-Processing: There is no logic yet to handle a download completing (e.g., file moving, renaming, or notifying Sonarr).
2. How does the auto download work now?
Scheduler: A background service (rssSchedulerService) runs every 60 seconds.
Fetch: It identifies "overdue" RSS feeds and fetches them.
Match: For each new item, it checks the regex filters you've configured for your series or seasons.
Link & Trigger: If a match is found:
It extracts the episode number and links the RSS item to the episode in the database.
It immediately sends the magnet link to qBittorrent via the qbittorrentService.
3. When is matched rss item get auto linked to episode?
Automated: It happens during the background scheduler run (triggerAutoDownloads) when a new RSS item matches your series/season filter.
Manual: It also happens when you use the "Configure RSS Matches" (Preview) modal in the UI and click "Apply Matches".
4. When is the download job triggered?
It is triggered immediately after the match is found by the scheduler. There is no separate "job queue"; as soon as a link is established, the command is sent to qBittorrent.
5. What happens after finishing a download?
Currently, nothing. The integration currently ends once the magnet is added to qBittorrent.
The system does not yet automatically detect that a download has finished, nor does it perform any "Import" or "Move" actions. This would be the next major phase of development for the qBittorrent integration.
Would you like me to work on implementing the status synchronization or the post-download completion logic?



## todo
1. update scheduler, support historical rss items
   - now it only cares about new rss items (the function explicitly checks for new items now)
2. add a trigger when a rss config for series / season is applied
   - trigger the match linking
   - then trigger the download

3. update the download status while displaying the status in series detail page