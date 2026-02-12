const { db } = require('../db/db');
const { seriesEpisodes, rssItem, downloads, downloadStatus } = require('../db/schema');
const { eq, and, isNull, isNotNull, or } = require('drizzle-orm');
const { logger } = require('../utils/logger');
const qbittorrentService = require('./qbittorrentService');
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

/**
 * Trigger download for a single episode.
 * Shared logic used by both the scheduler and manual download.
 * @param {Object} episode - Episode object with id, rssItemId
 * @param {Object} rssItemData - RSS item with magnetLink, title, id
 * @param {Object} statusIds - Download status ID mapping
 * @returns {Object} - { success, torrentHash, message }
 */
const triggerEpisodeDownload = async (episode, rssItemData, statusIds) => {
  logger.info({ episodeId: episode.id, rssItemId: rssItemData.id }, '[triggerEpisodeDownload] START');

  if (!rssItemData.magnetLink) {
    logger.warn({ episodeId: episode.id }, '[triggerEpisodeDownload] No magnet link available');
    return { success: false, message: 'No magnet link available' };
  }

  logger.info({ episodeId: episode.id }, '[triggerEpisodeDownload] Adding magnet to qBittorrent');
  const result = await qbittorrentService.addMagnet(rssItemData.magnetLink);
  logger.info({ episodeId: episode.id, qbitResult: result }, '[triggerEpisodeDownload] qBittorrent addMagnet result');

  if (!result.success) {
    logger.error({ episodeId: episode.id, error: result.message }, '[triggerEpisodeDownload] Failed to add magnet');
    return { success: false, message: result.message || 'Failed to add torrent to qBittorrent' };
  }

  // Extract torrent hash from magnet link (supports both hex and base32 formats)
  const torrentHash = getInfoHash(rssItemData.magnetLink);
  logger.info({ episodeId: episode.id, torrentHash }, '[triggerEpisodeDownload] Extracted torrent hash');

  const now = new Date();

  // Update episode status
  logger.info({ episodeId: episode.id }, '[triggerEpisodeDownload] Updating episode status');
  await db.update(seriesEpisodes)
    .set({
      isAutoDownloadEnabled: true,
      downloadStatusId: statusIds['DOWNLOADING'],
      downloadedAt: now,
      updatedAt: now
    })
    .where(eq(seriesEpisodes.id, episode.id));
  logger.info({ episodeId: episode.id }, '[triggerEpisodeDownload] Episode status updated');

  // Insert download record
  if (torrentHash) {
    logger.info({
      episodeId: episode.id,
      torrentHash,
      rssItemId: rssItemData.id
    }, '[triggerEpisodeDownload] Inserting into downloads table');

    await db.insert(downloads).values({
      torrentHash,
      magnetLink: rssItemData.magnetLink,
      seriesEpisodeId: episode.id,
      rssItemId: rssItemData.id,
      category: 'autoanime',
      downloadStatusId: statusIds['DOWNLOADING'],
      name: rssItemData.title,
      createdAt: now,
      updatedAt: now
    }).onConflictDoNothing();

    logger.info({ episodeId: episode.id, torrentHash }, '[triggerEpisodeDownload] Download record inserted');
  } else {
    logger.warn({ episodeId: episode.id }, '[triggerEpisodeDownload] No torrent hash, skipping downloads table insert');
  }

  logger.info({ episodeId: episode.id, torrentHash }, '[triggerEpisodeDownload] SUCCESS');
  return { success: true, torrentHash };
};

/**
 * Scan series_episodes for episodes ready to download and trigger them.
 * Criteria: isAutoDownloadEnabled=true, hasFile=false, downloadStatusId is null, rssItemId is not null.
 * Independently callable by other components.
 */
const triggerPendingDownloads = async () => {
  try {
    const statusIds = await getDownloadStatusIds();

    // Find episodes that are ready for download
    const pendingEpisodes = await db.select({
      id: seriesEpisodes.id,
      rssItemId: seriesEpisodes.rssItemId,
      episodeNumber: seriesEpisodes.episodeNumber,
      seasonNumber: seriesEpisodes.seasonNumber,
      seriesId: seriesEpisodes.seriesId,
    })
      .from(seriesEpisodes)
      .where(and(
        eq(seriesEpisodes.isAutoDownloadEnabled, true),
        eq(seriesEpisodes.hasFile, false),
        or(isNull(seriesEpisodes.downloadStatusId), eq(seriesEpisodes.downloadStatusId, statusIds['PENDING'])),
        isNotNull(seriesEpisodes.rssItemId)
      ));

    if (pendingEpisodes.length === 0) {
      logger.info('Download Scheduler tick — no pending downloads');
      return { triggered: 0 };
    }

    let triggeredCount = 0;

    for (const episode of pendingEpisodes) {
      // Get the RSS item data
      const rssItemData = await db.select()
        .from(rssItem)
        .where(eq(rssItem.id, episode.rssItemId))
        .limit(1);

      if (!rssItemData[0] || !rssItemData[0].magnetLink) {
        logger.warn({ episodeId: episode.id, rssItemId: episode.rssItemId }, 'RSS item not found or no magnet link');
        continue;
      }

      const result = await triggerEpisodeDownload(episode, rssItemData[0], statusIds);
      if (result.success) {
        triggeredCount++;
        logger.info({
          episodeId: episode.id,
          seriesId: episode.seriesId,
          season: episode.seasonNumber,
          episode: episode.episodeNumber,
          torrentHash: result.torrentHash
        }, 'Auto-download triggered for pending episode');
      } else {
        logger.error({
          episodeId: episode.id,
          error: result.message
        }, 'Failed to trigger auto-download');
      }
    }

    if (triggeredCount > 0) {
      logger.info({ triggeredCount, total: pendingEpisodes.length }, 'Download trigger complete');
    }
    return { triggered: triggeredCount };
  } catch (error) {
    logger.error({ error: error.message }, 'Error during download trigger');
    return { triggered: 0, error: error.message };
  }
};

module.exports = { triggerPendingDownloads, triggerEpisodeDownload, getDownloadStatusIds };
