const { db } = require('../db/db');
const { rssConfig, rss, rssItem, series, seriesSeasons, seriesEpisodes, downloads, downloadStatus } = require('../db/schema');
const { eq, and, asc, gt } = require('drizzle-orm');
const { convertCustomRegexToStandard, calculateEffectiveEpisode, extractEpisodeNumber, calculateActualEpisode } = require('../utils/regexHelper');
const { logger } = require('../utils/logger');
const { getInfoHash } = require('../utils/magnetHelper');

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

const getAllConfigs = async () => {
  return await db.select().from(rssConfig).orderBy(rssConfig.name);
};

const getConfigById = async (id) => {
  const result = await db.select().from(rssConfig).where(eq(rssConfig.id, id)).limit(1);
  return result[0] || null;
};

const createConfig = async (data) => {
  const now = new Date();
  const result = await db.insert(rssConfig).values({
    name: data.name,
    description: data.description || null,
    regex: data.regex,
    rssSourceId: data.rssSourceId || null,
    offset: data.offset !== undefined ? data.offset : null,
    isEnabled: data.isEnabled !== false,
    createdAt: now,
    updatedAt: now,
  }).returning();
  return result[0];
};

const updateConfig = async (id, data) => {
  const now = new Date();
  const updateData = { updatedAt: now };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.regex !== undefined) updateData.regex = data.regex;
  if (data.rssSourceId !== undefined) updateData.rssSourceId = data.rssSourceId;
  if (data.offset !== undefined) updateData.offset = data.offset;
  if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;

  const result = await db.update(rssConfig)
    .set(updateData)
    .where(eq(rssConfig.id, id))
    .returning();
  return result[0];
};

const deleteConfig = async (id) => {
  await db.delete(rssConfig).where(eq(rssConfig.id, id));
  return { success: true };
};

const previewConfig = async (rssSourceId, regex, offset = null) => {
  // Convert custom regex syntax to standard regex
  const pattern = convertCustomRegexToStandard(regex);
  if (!pattern) {
    return { success: false, message: 'Invalid regex pattern' };
  }

  const items = await db.select()
    .from(rssItem)
    .where(eq(rssItem.rssId, rssSourceId))
    .orderBy(rssItem.publishedDate)
    .limit(200);

  // Filter and enhance matched items with episode information
  const matched = items
    .filter(item => item.title && pattern.test(item.title))
    .map(item => {
      // Extract episode number from RSS title
      const rssEpisode = extractEpisodeNumber(item.title);

      let matchedEpisode = null;
      if (rssEpisode !== null) {
        // Calculate actual episode using offset
        const actualEpisode = calculateActualEpisode(rssEpisode, offset);
        // Skip off-season episodes (negative or zero)
        if (actualEpisode >= 1) {
          matchedEpisode = `E${String(actualEpisode).padStart(2, '0')}`;
        }
      }

      return {
        ...item,
        rssEpisode,
        matchedEpisode,
      };
    });

  return { success: true, matched, total: items.length };
};

/**
 * Process historical RSS items for a specific series/season configuration.
 * This ONLY matches RSS items to episodes (sets rssItemId). It never triggers downloads.
 * The download scheduler is the single owner of download triggering, which eliminates
 * race conditions between this function and the scheduler competing to insert download records.
 * @param {Object} config - RSS config object with regex, offset, rssSourceId
 * @param {number} seriesId - Series ID
 * @param {number|null} seasonNumber - Season number (null for series-level)
 */
const processHistoricalRssItems = async (config, seriesId, seasonNumber) => {
  if (!config || !config.regex || !config.rssSourceId) {
    logger.info({ seriesId, seasonNumber }, 'Skipping historical RSS processing - no valid config');
    return { matched: 0 };
  }

  try {
    // Get RSS items from the configured source
    const rssItems = await db.select()
      .from(rssItem)
      .where(eq(rssItem.rssId, config.rssSourceId));

    if (rssItems.length === 0) {
      logger.info({ seriesId, rssSourceId: config.rssSourceId }, 'No RSS items found for source');
      return { matched: 0 };
    }

    // Get episodes for this series/season
    // IMPORTANT: Must use and() to combine conditions. Chaining .where() in Drizzle
    // replaces the previous clause instead of ANDing, which would drop the seriesId filter.
    const episodeConditions = [eq(seriesEpisodes.seriesId, seriesId)];
    if (seasonNumber !== null) {
      episodeConditions.push(eq(seriesEpisodes.seasonNumber, seasonNumber));
    }

    const episodes = await db.select({
      id: seriesEpisodes.id,
      episodeNumber: seriesEpisodes.episodeNumber,
      seasonNumber: seriesEpisodes.seasonNumber,
    })
      .from(seriesEpisodes)
      .where(and(...episodeConditions));

    let matchedCount = 0;
    const now = new Date();

    for (const item of rssItems) {
      if (!item.magnetLink || !item.title) continue;

      // Test if this RSS item matches the regex
      const pattern = convertCustomRegexToStandard(config.regex);
      if (!pattern || !pattern.test(item.title)) continue;

      // Extract episode number from RSS title
      const rssEpisodeNumber = extractEpisodeNumber(item.title);
      if (rssEpisodeNumber === null) continue;

      // Calculate actual episode number using offset
      const actualEpisodeNumber = calculateActualEpisode(rssEpisodeNumber, config.offset);

      // Skip off-season episodes (negative or zero)
      if (actualEpisodeNumber < 1) continue;

      // Find matching episode
      const matchingEpisode = episodes.find(ep =>
        ep.episodeNumber === actualEpisodeNumber &&
        (seasonNumber === null || ep.seasonNumber === seasonNumber)
      );

      if (!matchingEpisode) continue;

      // Only set the rssItemId link — downloads are handled by the download scheduler
      await db.update(seriesEpisodes)
        .set({ rssItemId: item.id, updatedAt: now })
        .where(eq(seriesEpisodes.id, matchingEpisode.id));

      matchedCount++;
      logger.info({
        seriesId,
        seasonNumber,
        episodeNumber: actualEpisodeNumber,
        rssItemId: item.id,
        title: item.title
      }, 'Historical RSS item matched to episode');
    }

    logger.info({ seriesId, seasonNumber, matched: matchedCount }, 'Historical RSS processing complete');
    return { matched: matchedCount };
  } catch (error) {
    logger.error({ error: error.message, seriesId, seasonNumber }, 'Error processing historical RSS items');
    return { matched: 0, error: error.message };
  }
};

const assignToSeries = async (seriesId, configId) => {
  const result = await db.update(series)
    .set({ rssConfigId: configId || null, updatedAt: new Date() })
    .where(eq(series.id, seriesId))
    .returning();

  const updatedSeries = result[0];

  // Trigger historical RSS matching if config was assigned
  if (configId && updatedSeries) {
    const config = await getConfigById(configId);
    if (config) {
      // Run in background - don't await. Only matches RSS items to episodes.
      // Downloads are triggered by the download scheduler on its next tick.
      processHistoricalRssItems(config, seriesId, null)
        .catch(err => logger.error({ error: err.message }, 'Background historical RSS processing failed'));
    }
  }

  return updatedSeries;
};

const assignToSeason = async (seriesId, seasonNumber, configId) => {
  const result = await db.update(seriesSeasons)
    .set({ rssConfigId: configId || null, updatedAt: new Date() })
    .where(and(eq(seriesSeasons.seriesId, seriesId), eq(seriesSeasons.seasonNumber, seasonNumber)))
    .returning();

  const updatedSeason = result[0];

  // Trigger historical RSS matching if config was assigned
  if (configId && updatedSeason) {
    const config = await getConfigById(configId);

    if (config) {
      // Only matches RSS items to episodes.
      // Downloads are triggered by the download scheduler on its next tick.
      processHistoricalRssItems(config, seriesId, seasonNumber)
        .catch(err => logger.error({ error: err.message }, 'Background historical RSS processing failed'));
    }
  }

  return updatedSeason;
};

const getSeriesRssPreview = async (seriesId) => {
  // Get series info with its RSS config
  const seriesData = await db.select({
    id: series.id,
    title: series.title,
    rssConfigId: series.rssConfigId,
  })
    .from(series)
    .where(eq(series.id, seriesId))
    .limit(1);

  if (!seriesData[0]) {
    return { success: false, message: 'Series not found' };
  }

  // Get all episodes for the series with current RSS link
  const episodes = await db.select({
    id: seriesEpisodes.id,
    seasonNumber: seriesEpisodes.seasonNumber,
    episodeNumber: seriesEpisodes.episodeNumber,
    title: seriesEpisodes.title,
    currentRssItemId: seriesEpisodes.rssItemId,
    currentRssItemTitle: rssItem.title,
  })
    .from(seriesEpisodes)
    .leftJoin(rssItem, eq(seriesEpisodes.rssItemId, rssItem.id))
    .where(and(
      eq(seriesEpisodes.seriesId, seriesId),
      gt(seriesEpisodes.seasonNumber, 0)
    ))
    .orderBy(asc(seriesEpisodes.seasonNumber), asc(seriesEpisodes.episodeNumber));

  // Get season-level RSS configs
  const seasonConfigs = await db.select({
    seasonNumber: seriesSeasons.seasonNumber,
    configId: seriesSeasons.rssConfigId,
    regex: rssConfig.regex,
    offset: rssConfig.offset,
    rssSourceId: rssConfig.rssSourceId,
  })
    .from(seriesSeasons)
    .leftJoin(rssConfig, eq(seriesSeasons.rssConfigId, rssConfig.id))
    .where(eq(seriesSeasons.seriesId, seriesId));

  // Get series-level RSS config if exists
  let seriesConfig = null;
  if (seriesData[0].rssConfigId) {
    const configData = await db.select({
      id: rssConfig.id,
      regex: rssConfig.regex,
      offset: rssConfig.offset,
      rssSourceId: rssConfig.rssSourceId,
    })
      .from(rssConfig)
      .where(eq(rssConfig.id, seriesData[0].rssConfigId))
      .limit(1);
    seriesConfig = configData[0] || null;
  }

  // Get all RSS items from the relevant RSS sources
  const rssSourceIds = new Set();
  if (seriesConfig?.rssSourceId) rssSourceIds.add(seriesConfig.rssSourceId);
  seasonConfigs.forEach(sc => { if (sc.rssSourceId) rssSourceIds.add(sc.rssSourceId); });

  let allRssItems = [];
  if (rssSourceIds.size > 0) {
    allRssItems = await db.select({
      id: rssItem.id,
      title: rssItem.title,
      link: rssItem.link,
      rssId: rssItem.rssId,
    })
      .from(rssItem)
      .where(and(...Array.from(rssSourceIds).map(id => eq(rssItem.rssId, id))));
  }

  // Match episodes to RSS items
  const previewData = episodes.map(episode => {
    // Determine which config to use (season-level overrides series-level)
    const seasonConfig = seasonConfigs.find(sc => sc.seasonNumber === episode.seasonNumber);
    const config = seasonConfig?.configId ? seasonConfig : seriesConfig;

    if (!config || !config.regex) {
      return {
        episodeId: episode.id,
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title,
        rssItemId: null,
        rssItemTitle: null,
        rssItemLink: null,
      };
    }

    // Calculate effective episode number with offset
    // Sonarr episode 5 + offset 13 = RSS episode 18
    const effectiveEpisodeNumber = calculateEffectiveEpisode(episode.episodeNumber, config.offset);

    // Convert custom regex with the effective episode number
    const pattern = convertCustomRegexToStandard(config.regex, effectiveEpisodeNumber);
    if (!pattern) {
      return {
        episodeId: episode.id,
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title,
        rssItemId: null,
        rssItemTitle: 'Invalid regex pattern',
        rssItemLink: null,
      };
    }

    // Find matching RSS items
    const matchingItems = allRssItems.filter(item => {
      if (!item.title) return false;
      // Custom regex already includes episode number matching via :ep: placeholder
      return pattern.test(item.title);
    });

    // Use the first match (most recent based on RSS item order)
    const matchedItem = matchingItems[0];

    return {
      episodeId: episode.id,
      seasonNumber: episode.seasonNumber,
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.title,
      currentRssItemId: episode.currentRssItemId,
      currentRssItemTitle: episode.currentRssItemTitle,
      rssItemId: matchedItem?.id || null,
      rssItemTitle: matchedItem?.title || null,
      rssItemLink: matchedItem?.link || null,
    };
  });

  return { success: true, data: previewData };
};

const applySeriesRssPreview = async (seriesId, triggerDownloads = false) => {
  const previewResult = await getSeriesRssPreview(seriesId);
  if (!previewResult.success) {
    return previewResult;
  }

  const updates = [];
  const now = new Date();
  const qbittorrentService = require('./qbittorrentService');
  let downloadCount = 0;

  // Get download status IDs
  const statusIds = await getDownloadStatusIds();
  
  // Get series info to check auto-download status
  const seriesData = await db.select({ isAutoDownloadEnabled: series.isAutoDownloadEnabled })
    .from(series)
    .where(eq(series.id, seriesId))
    .limit(1);
  const shouldTriggerDownloads = triggerDownloads && seriesData[0]?.isAutoDownloadEnabled;

  for (const item of previewResult.data) {
    // Only update if there's a change
    if (item.rssItemId !== item.currentRssItemId) {
      if (item.rssItemId) {
        // Link new match
        updates.push(
          db.update(seriesEpisodes)
            .set({ rssItemId: item.rssItemId, updatedAt: now })
            .where(eq(seriesEpisodes.id, item.episodeId))
        );

        // Trigger download if requested and auto-download is enabled
        if (shouldTriggerDownloads && item.rssItemLink) {
          try {
            // Get the RSS item to get the magnet link
            const rssItemData = await db.select()
              .from(rssItem)
              .where(eq(rssItem.id, item.rssItemId))
              .limit(1);

            if (rssItemData[0]?.magnetLink) {
              const result = await qbittorrentService.addMagnet(rssItemData[0].magnetLink);
              if (result.success) {
                downloadCount++;
                
                // Extract torrent hash and create download record
                const torrentHash = getInfoHash(rssItemData[0].magnetLink);
                
                if (torrentHash) {
                  await db.insert(downloads).values({
                    torrentHash,
                    magnetLink: rssItemData[0].magnetLink,
                    seriesEpisodeId: item.episodeId,
                    rssItemId: item.rssItemId,
                    category: 'autoanime',
                    downloadStatusId: statusIds['DOWNLOADING'],
                    name: item.rssItemTitle,
                    createdAt: now,
                    updatedAt: now
                  }).onConflictDoNothing();
                }
                
                logger.info({
                  seriesId,
                  episodeId: item.episodeId,
                  rssItemId: item.rssItemId,
                  title: item.rssItemTitle
                }, 'Auto-download triggered from preview apply');
              } else {
                logger.error({
                  seriesId,
                  episodeId: item.episodeId,
                  error: result.message
                }, 'Auto-download failed from preview apply');
              }
            }
          } catch (downloadError) {
            logger.error({
              seriesId,
              episodeId: item.episodeId,
              error: downloadError.message
            }, 'Error triggering download from preview apply');
          }
        }
      } else if (item.currentRssItemId) {
        // Unlink if no longer matched but previously was
        updates.push(
          db.update(seriesEpisodes)
            .set({ rssItemId: null, updatedAt: now })
            .where(eq(seriesEpisodes.id, item.episodeId))
        );
      }
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
  }

  return {
    success: true,
    updatedCount: updates.length,
    downloadsTriggered: downloadCount
  };
};

module.exports = {
  getAllConfigs,
  getConfigById,
  createConfig,
  updateConfig,
  deleteConfig,
  previewConfig,
  assignToSeries,
  assignToSeason,
  getSeriesRssPreview,
  applySeriesRssPreview,
  processHistoricalRssItems,
};
