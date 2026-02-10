const { fetchAndParseRss, getOverdueFeeds } = require('./rssService');
const { db } = require('../db/db');
const { series, seriesSeasons, rssConfig, rssItem, seriesEpisodes, downloads, downloadStatus } = require('../db/schema');
const { eq, and, isNotNull, inArray } = require('drizzle-orm');
const { logger } = require('../utils/logger');
const { convertCustomRegexToStandard, extractEpisodeNumber, calculateActualEpisode } = require('../utils/regexHelper');
const qbittorrentService = require('./qbittorrentService');

let schedulerInterval = null;

// Cache for download status IDs
let downloadStatusCache = null;

const getDownloadStatusIds = async () => {
  if (downloadStatusCache) return downloadStatusCache;

  const statuses = await db.select().from(downloadStatus).where(eq(downloadStatus.isActive, true));
  downloadStatusCache = {};
  for (const status of statuses) {
    downloadStatusCache[status.name] = status.id;
  }
  return downloadStatusCache;
};

const triggerAutoDownloads = async (rssId, newItems) => {
  if (!newItems || newItems.length === 0) return;

  try {
    // Get download status IDs
    const statusIds = await getDownloadStatusIds();

    // Find series with auto-download enabled that use a config linked to this rss source
    const seriesList = await db.select({
      id: series.id,
      title: series.title,
      rssConfigId: series.rssConfigId,
      configRegex: rssConfig.regex,
      configOffset: rssConfig.offset,
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
      configOffset: rssConfig.offset,
    })
      .from(seriesSeasons)
      .innerJoin(rssConfig, eq(seriesSeasons.rssConfigId, rssConfig.id))
      .where(and(
        eq(seriesSeasons.isAutoDownloadEnabled, true),
        eq(rssConfig.rssSourceId, rssId),
        eq(rssConfig.isEnabled, true)
      ));

    for (const item of newItems) {
      if (!item.magnetLink || !item.title) continue;

      // Check series-level configs
      for (const s of seriesList) {
        // Convert custom regex to standard regex (without specific episode number for initial matching)
        const pattern = convertCustomRegexToStandard(s.configRegex);
        if (pattern && pattern.test(item.title)) {
          // Check if this series has a season-level override that would handle this
          const hasSeasonOverride = seasonsList.some(ss => ss.seriesId === s.id);
          if (!hasSeasonOverride) {
            // Extract episode number from RSS title and apply offset
            const rssEpisodeNumber = extractEpisodeNumber(item.title);
            if (rssEpisodeNumber !== null) {
              const actualEpisodeNumber = calculateActualEpisode(rssEpisodeNumber, s.configOffset);
              // Find and update the episode
              const episode = await db.select({ id: seriesEpisodes.id })
                .from(seriesEpisodes)
                .where(and(
                  eq(seriesEpisodes.seriesId, s.id),
                  eq(seriesEpisodes.episodeNumber, actualEpisodeNumber)
                ))
                .limit(1);
              if (episode[0]) {
                await db.update(seriesEpisodes)
                  .set({ rssItemId: item.id, updatedAt: new Date() })
                  .where(eq(seriesEpisodes.id, episode[0].id));
              }
            }

            logger.info({ series: s.title, item: item.title }, 'Auto-download match for series');
            const result = await qbittorrentService.addMagnet(item.magnetLink);
            if (result.success) {
              // Extract torrent hash and create download record
              const hashMatch = item.magnetLink.match(/xt=urn:btih:([a-fA-F0-9]+)/);
              const torrentHash = hashMatch ? hashMatch[1].toUpperCase() : null;

              if (torrentHash && episode[0]) {
                const now = new Date();
                await db.insert(downloads).values({
                  torrentHash,
                  magnetLink: item.magnetLink,
                  seriesEpisodeId: episode[0].id,
                  rssItemId: item.id,
                  category: 'autoanime',
                  downloadStatusId: statusIds['DOWNLOADING'],
                  name: item.title,
                  createdAt: now,
                  updatedAt: now
                }).onConflictDoNothing();
              }

              logger.info({ item: item.title }, 'Auto-download triggered');
            } else {
              logger.error({ item: item.title, error: result.message }, 'Auto-download failed');
            }
          }
        }
      }

      // Check season-level configs
      for (const season of seasonsList) {
        // Convert custom regex to standard regex (without specific episode number for initial matching)
        const pattern = convertCustomRegexToStandard(season.configRegex);
        if (pattern && pattern.test(item.title)) {
          // Extract episode number from RSS title and apply offset
          const rssEpisodeNumber = extractEpisodeNumber(item.title);
          if (rssEpisodeNumber !== null) {
            const actualEpisodeNumber = calculateActualEpisode(rssEpisodeNumber, season.configOffset);
            // Find and update the episode
            const episode = await db.select({ id: seriesEpisodes.id })
              .from(seriesEpisodes)
              .where(and(
                eq(seriesEpisodes.seriesId, season.seriesId),
                eq(seriesEpisodes.seasonNumber, season.seasonNumber),
                eq(seriesEpisodes.episodeNumber, actualEpisodeNumber)
              ))
              .limit(1);
            if (episode[0]) {
              await db.update(seriesEpisodes)
                .set({ rssItemId: item.id, updatedAt: new Date() })
                .where(eq(seriesEpisodes.id, episode[0].id));
            }
          }

          logger.info({ seriesId: season.seriesId, season: season.seasonNumber, item: item.title }, 'Auto-download match for season');
          const result = await qbittorrentService.addMagnet(item.magnetLink);
          if (result.success) {
            // Extract torrent hash and create download record
            const hashMatch = item.magnetLink.match(/xt=urn:btih:([a-fA-F0-9]+)/);
            const torrentHash = hashMatch ? hashMatch[1].toUpperCase() : null;

            if (torrentHash && episode[0]) {
              const now = new Date();
              await db.insert(downloads).values({
                torrentHash,
                magnetLink: item.magnetLink,
                seriesEpisodeId: episode[0].id,
                rssItemId: item.id,
                category: 'autoanime',
                downloadStatusId: statusIds['DOWNLOADING'],
                name: item.title,
                createdAt: now,
                updatedAt: now
              }).onConflictDoNothing();
            }

            logger.info({ item: item.title }, 'Auto-download triggered');
          } else {
            logger.error({ item: item.title, error: result.message }, 'Auto-download failed');
          }
        }
      }
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Error processing auto-downloads');
  }
};

const runScheduler = async () => {
  try {
    // Fetch overdue RSS feeds and trigger auto-downloads for new items
    const overdueFeeds = await getOverdueFeeds();
    if (overdueFeeds.length > 0) {
      logger.info({ feedCount: overdueFeeds.length }, 'Fetching overdue feeds');
      for (const feed of overdueFeeds) {
        try {
          const result = await fetchAndParseRss(feed.id);
          logger.info({ feedId: feed.id, feedName: feed.name, message: result.message }, 'Feed fetch result');

          if (result.success && result.newItemsList && result.newItemsList.length > 0) {
            await triggerAutoDownloads(feed.id, result.newItemsList);
          }
        } catch (error) {
          logger.error({ feedId: feed.id, feedName: feed.name, error: error.message }, 'Failed to fetch feed');
        }
      }
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Error during scheduled run');
  }
};

const startScheduler = () => {
  if (schedulerInterval) return;
  logger.info('RSS Scheduler starting (checks every 60s)');
  schedulerInterval = setInterval(runScheduler, 60 * 1000);
};

const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.info('RSS Scheduler stopped');
  }
};

module.exports = { startScheduler, stopScheduler };
