const { fetchAndParseRss, getOverdueFeeds } = require('./rssService');
const { db } = require('../db/db');
const { series, seriesSeasons, rssConfig, rssItem } = require('../db/schema');
const { eq, and, isNotNull } = require('drizzle-orm');

let schedulerInterval = null;

const triggerAutoDownloads = async (rssId, newItems) => {
  if (!newItems || newItems.length === 0) return;

  try {
    // Find series with auto-download enabled that use a config linked to this rss source
    const seriesList = await db.select({
      id: series.id,
      title: series.title,
      rssConfigId: series.rssConfigId,
      configRegex: rssConfig.regex,
    })
      .from(series)
      .innerJoin(rssConfig, eq(series.rssConfigId, rssConfig.id))
      .where(and(
        eq(series.isAutoDownloadEnabled, true),
        eq(rssConfig.rssSourceId, rssId),
        eq(rssConfig.isEnabled, true)
      ));

    // Find seasons with auto-download enabled that have a season-specific override config
    const seasonsList = await db.select({
      seriesId: seriesSeasons.seriesId,
      seasonNumber: seriesSeasons.seasonNumber,
      rssConfigId: seriesSeasons.rssConfigId,
      configRegex: rssConfig.regex,
    })
      .from(seriesSeasons)
      .innerJoin(rssConfig, eq(seriesSeasons.rssConfigId, rssConfig.id))
      .where(and(
        eq(seriesSeasons.isAutoDownloadEnabled, true),
        eq(rssConfig.rssSourceId, rssId),
        eq(rssConfig.isEnabled, true)
      ));

    const qbittorrentService = require('./qbittorrentService');

    for (const item of newItems) {
      if (!item.magnetLink || !item.title) continue;

      // Check series-level configs
      for (const s of seriesList) {
        const pattern = new RegExp(s.configRegex, 'i');
        if (pattern.test(item.title)) {
          // Check if this series has a season-level override that would handle this
          const hasSeasonOverride = seasonsList.some(ss => ss.seriesId === s.id);
          if (!hasSeasonOverride) {
            console.log(`[RSS Auto-Download] Match for "${s.title}": ${item.title}`);
            const result = await qbittorrentService.addMagnet(item.magnetLink);
            if (result.success) {
              console.log(`[RSS Auto-Download] Download triggered for: ${item.title}`);
            } else {
              console.error(`[RSS Auto-Download] Failed to download: ${item.title} - ${result.message}`);
            }
          }
        }
      }

      // Check season-level configs
      for (const season of seasonsList) {
        const pattern = new RegExp(season.configRegex, 'i');
        if (pattern.test(item.title)) {
          console.log(`[RSS Auto-Download] Season match for series #${season.seriesId} S${season.seasonNumber}: ${item.title}`);
          const result = await qbittorrentService.addMagnet(item.magnetLink);
          if (result.success) {
            console.log(`[RSS Auto-Download] Download triggered for: ${item.title}`);
          } else {
            console.error(`[RSS Auto-Download] Failed to download: ${item.title} - ${result.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('[RSS Auto-Download] Error processing auto-downloads:', error.message);
  }
};

const runScheduler = async () => {
  try {
    const overdueFeeds = await getOverdueFeeds();
    if (overdueFeeds.length === 0) return;

    console.log(`[RSS Scheduler] Fetching ${overdueFeeds.length} overdue feed(s)...`);
    for (const feed of overdueFeeds) {
      try {
        const result = await fetchAndParseRss(feed.id);
        console.log(`[RSS Scheduler] Feed #${feed.id} "${feed.name}": ${result.message}`);

        if (result.success && result.newItemsList && result.newItemsList.length > 0) {
          await triggerAutoDownloads(feed.id, result.newItemsList);
        }
      } catch (error) {
        console.error(`[RSS Scheduler] Failed to fetch feed #${feed.id} "${feed.name}":`, error.message);
      }
    }
  } catch (error) {
    console.error('[RSS Scheduler] Error during scheduled run:', error.message);
  }
};

const startScheduler = () => {
  if (schedulerInterval) return;
  console.log('[RSS Scheduler] Starting (checks every 60s)');
  schedulerInterval = setInterval(runScheduler, 60 * 1000);
};

const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[RSS Scheduler] Stopped');
  }
};

module.exports = { startScheduler, stopScheduler };
