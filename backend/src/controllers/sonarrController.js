const sonarrService = require('../services/sonarrService');
const qbittorrentService = require('../services/qbittorrentService');
const { db } = require('../db/db');
const { series, seriesMetadata, seriesImages, seriesAlternateTitles, seriesSeasons, seriesEpisodes, rssItem, downloadStatus, downloads } = require('../db/schema');
const { eq, and, inArray } = require('drizzle-orm');
const { logger } = require('../utils/logger');

// In-memory sync state (survives across requests, lost on server restart)
const syncState = {
  status: 'idle',       // 'idle' | 'syncing' | 'error'
  mode: null,           // 'delta' | 'full'
  progress: { current: 0, total: 0 },
  error: null,
  startedAt: null,
  completedAt: null,
};

const extractImageUrl = (images, coverType) => {
  const image = images?.find(img => img.coverType === coverType);
  return image?.remoteUrl || null;
};

const parseTimestamp = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const upsertSeriesImages = async (seriesId, images, now) => {
  if (!images || images.length === 0) return;

  const existingImages = await db.select().from(seriesImages).where(eq(seriesImages.seriesId, seriesId));
  const existingMap = new Map(existingImages.map(img => [img.coverType, img]));

  for (const img of images) {
    const metadataUpdate = {
      url: img.url,
      remoteUrl: img.remoteUrl,
      updatedAt: now
    };

    if (existingMap.has(img.coverType)) {
      await db.update(seriesImages)
        .set(metadataUpdate)
        .where(eq(seriesImages.id, existingMap.get(img.coverType).id));
    } else {
      await db.insert(seriesImages).values({
        seriesId,
        coverType: img.coverType,
        ...metadataUpdate,
        createdAt: now
      });
    }
  }
};

const upsertAlternateTitles = async (seriesId, alternateTitles, now) => {
  if (!alternateTitles || alternateTitles.length === 0) return;

  const existingTitles = await db.select().from(seriesAlternateTitles).where(eq(seriesAlternateTitles.seriesId, seriesId));
  const existingMap = new Map(existingTitles.map(t => [t.title, t]));

  for (const alt of alternateTitles) {
    const metadataUpdate = {
      sceneSeasonNumber: alt.sceneSeasonNumber,
      updatedAt: now
    };

    if (existingMap.has(alt.title)) {
      await db.update(seriesAlternateTitles)
        .set(metadataUpdate)
        .where(eq(seriesAlternateTitles.id, existingMap.get(alt.title).id));
    } else {
      await db.insert(seriesAlternateTitles).values({
        seriesId,
        title: alt.title,
        ...metadataUpdate,
        createdAt: now
      });
    }
  }
};

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

/**
 * Upsert a single episode record. Detects hasFile transitions (true -> false)
 * and resets auto-download fields so the episode can be re-enabled.
 */
const upsertSingleEpisode = async (episode, seriesId, seasonIdMap, now) => {
  const existing = await db.select().from(seriesEpisodes).where(
    eq(seriesEpisodes.sonarrEpisodeId, episode.id)
  );

  const metadataUpdate = {
    seriesId,
    seasonId: seasonIdMap[episode.seasonNumber] || null,
    title: episode.title,
    episodeNumber: episode.episodeNumber,
    seasonNumber: episode.seasonNumber,
    overview: episode.overview,
    airDate: parseTimestamp(episode.airDateUtc),
    hasFile: episode.hasFile || false,
    monitored: episode.monitored || true,
    updatedAt: now
  };

  if (existing.length > 0) {
    // Detect file removal: hasFile changed from true to false
    const wasFileRemoved = existing[0].hasFile === true && !episode.hasFile;
    if (wasFileRemoved) {
      metadataUpdate.isAutoDownloadEnabled = null;
      metadataUpdate.downloadStatusId = null;
      metadataUpdate.downloadedAt = null;
      metadataUpdate.rssItemId = null;
    }

    await db.update(seriesEpisodes)
      .set(metadataUpdate)
      .where(eq(seriesEpisodes.id, existing[0].id));

    return wasFileRemoved ? existing[0].id : null;
  } else {
    await db.insert(seriesEpisodes).values({
      sonarrEpisodeId: episode.id,
      ...metadataUpdate,
      createdAt: now
    });
    return null;
  }
};

const upsertEpisodes = async (seriesId, sonarrSeriesId, now) => {
  try {
    // Get episodes from Sonarr API
    const episodes = await sonarrService.getEpisodesBySeries(sonarrSeriesId);
    if (!episodes || episodes.length === 0) return { count: 0, removedFileEpisodeIds: [] };

    // Get season mappings for this series
    const seasons = await db.select().from(seriesSeasons).where(eq(seriesSeasons.seriesId, seriesId));
    const seasonIdMap = {};
    for (const season of seasons) {
      seasonIdMap[season.seasonNumber] = season.id;
    }

    const removedFileEpisodeIds = [];
    for (const episode of episodes) {
      const removedId = await upsertSingleEpisode(episode, seriesId, seasonIdMap, now);
      if (removedId) removedFileEpisodeIds.push(removedId);
    }

    return { count: episodes.length, removedFileEpisodeIds };
  } catch (error) {
    logger.error({ error: error.message }, 'Error syncing episodes');
    throw error;
  }
};

/**
 * Handle stale download records for episodes whose files were removed.
 * - If qBittorrent torrent exists and is 100% complete: re-copy file + refresh/rename Sonarr
 * - If torrent not found or incomplete: delete the download record
 */
const handleRemovedFileDownloads = async (episodeIds, sonarrId) => {
  if (!episodeIds || episodeIds.length === 0) return;

  for (const episodeId of episodeIds) {
    try {
      const downloadRecords = await db.select().from(downloads)
        .where(eq(downloads.seriesEpisodeId, episodeId));

      if (downloadRecords.length === 0) continue;

      const download = downloadRecords[0];
      if (!download.torrentHash) {
        await db.delete(downloads).where(eq(downloads.id, download.id));
        logger.info({ downloadId: download.id, episodeId }, 'Deleted download record with no torrent hash');
        continue;
      }

      const torrent = await qbittorrentService.getTorrentByHash(download.torrentHash);

      if (torrent && torrent.progress === 1) {
        // Torrent exists and is 100% complete — recover by re-copying file
        logger.info({ downloadId: download.id, episodeId, torrentHash: download.torrentHash }, 'Torrent still complete, recovering file');
        const copyResult = await qbittorrentService.copyDownloadedFile(download, torrent.content_path, torrent.root_path);

        if (copyResult.success && sonarrId) {
          await sonarrService.refreshSeries(sonarrId);
          await new Promise(resolve => setTimeout(resolve, 10000));
          await sonarrService.renameSeries(sonarrId);
          logger.info({ sonarrId, episodeId }, 'Triggered Sonarr refresh and rename after file recovery');
        } else if (!copyResult.success) {
          logger.warn({ downloadId: download.id, error: copyResult.message }, 'File recovery copy failed, deleting download record');
          await db.delete(downloads).where(eq(downloads.id, download.id));
        }
      } else {
        // Torrent not found or incomplete — clean up stale download record
        await db.delete(downloads).where(eq(downloads.id, download.id));
        logger.info({ downloadId: download.id, episodeId, torrentHash: download.torrentHash }, 'Deleted stale download record (torrent not found or incomplete)');
      }
    } catch (error) {
      logger.error({ episodeId, error: error.message }, 'Error handling removed file download');
    }
  }
};

const upsertSeriesMetadata = async (seriesId, item, now) => {
  const stats = item.statistics || {};
  const ratings = item.ratings || {};

  const existing = await db.select().from(seriesMetadata).where(eq(seriesMetadata.seriesId, seriesId));

  const metadataData = {
    seriesId,
    titleSlug: item.titleSlug,
    bannerPath: extractImageUrl(item.images, 'banner'),
    fanartPath: extractImageUrl(item.images, 'fanart'),
    clearlogoPath: extractImageUrl(item.images, 'clearlogo'),
    year: item.year,
    ended: item.ended,
    genres: item.genres ? JSON.stringify(item.genres) : null,
    network: item.network,
    runtime: item.runtime,
    certification: item.certification,
    seriesType: item.seriesType,
    imdbId: item.imdbId,
    tmdbId: item.tmdbId,
    tvdbId: item.tvdbId,
    tvMazeId: item.tvMazeId,
    airDay: item.airDay,
    airTime: item.airTime,
    firstAired: parseTimestamp(item.firstAired),
    lastAired: parseTimestamp(item.lastAired),
    nextAiring: parseTimestamp(item.nextAiring),
    previousAiring: parseTimestamp(item.previousAiring),
    addedAt: parseTimestamp(item.added),
    showType: item.showType,
    profileId: item.profileId,
    languageProfileId: item.languageProfileId,
    episodeCount: stats.episodeCount,
    sizeOnDisk: stats.sizeOnDisk,
    percentOfEpisodes: stats.percentOfEpisodes,
    ratingValue: ratings.value,
    ratingVotes: ratings.votes,
    rawData: item,
    updatedAt: now
  };

  if (existing.length > 0) {
    await db.update(seriesMetadata)
      .set(metadataData)
      .where(eq(seriesMetadata.id, existing[0].id));
  } else {
    await db.insert(seriesMetadata).values({
      ...metadataData,
      createdAt: now
    });
  }
};

const getSeriesCoreData = (item, now) => {
  const stats = item.statistics || {};

  return {
    sonarrId: item.id,
    title: item.title,
    overview: item.overview,
    posterPath: extractImageUrl(item.images, 'poster'),
    status: item.status,
    seasonCount: stats.seasonCount,
    totalEpisodeCount: stats.totalEpisodeCount,
    episodeFileCount: stats.episodeFileCount,
    monitored: item.monitored,
    path: item.path,
    lastSyncedAt: now,
    updatedAt: now
  };
};

const getSeriesData = (item, now) => {
  const stats = item.statistics || {};
  const ratings = item.ratings || {};

  return {
    sonarrId: item.id,
    title: item.title,
    overview: item.overview,
    posterPath: extractImageUrl(item.images, 'poster'),
    status: item.status,
    seasonCount: stats.seasonCount,
    totalEpisodeCount: stats.totalEpisodeCount,
    episodeFileCount: stats.episodeFileCount,
    monitored: item.monitored,
    path: item.path,
    lastSyncedAt: now,
    updatedAt: now
  };
};

const getStatus = async (req, res) => {
  try {
    const status = await sonarrService.getStatus();
    res.json(status);
  } catch (error) {
    logger.error({ error: error.message }, 'Error checking Sonarr status');
    res.status(500).json({ error: 'Failed to check Sonarr status' });
  }
};

const getSeries = async (req, res) => {
  try {
    const allSeries = await db.select().from(series).orderBy(series.title);
    
    // For each series, check if it has at least one episode with auto-download enabled
    const seriesWithFlags = await Promise.all(
      allSeries.map(async (s) => {
        const episodesWithAutoDownload = await db
          .select()
          .from(seriesEpisodes)
          .where(
            and(
              eq(seriesEpisodes.seriesId, s.id),
              eq(seriesEpisodes.isAutoDownloadEnabled, true)
            )
          )
          .limit(1);
        
        return {
          ...s,
          hasAutoDownloadEpisodes: episodesWithAutoDownload.length > 0
        };
      })
    );
    
    res.json(seriesWithFlags);
  } catch (error) {
    logger.error({ error: error.message }, 'Error fetching series');
    res.status(500).json({ error: 'Failed to fetch series' });
  }
};

const getSeriesById = async (req, res) => {
  try {
    const { id } = req.params;
    const seriesResult = await db.select().from(series).where(eq(series.id, id));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const [metadata, images, alternateTitles, seasons, episodes] = await Promise.all([
      db.select().from(seriesMetadata).where(eq(seriesMetadata.seriesId, parseInt(id))),
      db.select().from(seriesImages).where(eq(seriesImages.seriesId, parseInt(id))),
      db.select().from(seriesAlternateTitles).where(eq(seriesAlternateTitles.seriesId, parseInt(id))),
      db.select().from(seriesSeasons).where(eq(seriesSeasons.seriesId, parseInt(id))),
      db.select().from(seriesEpisodes).where(eq(seriesEpisodes.seriesId, parseInt(id)))
    ]);

    res.json({
      ...seriesResult[0],
      metadata: metadata[0] || null,
      images,
      alternateTitles,
      seasons,
      episodes
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error fetching series');
    res.status(500).json({ error: 'Failed to fetch series' });
  }
};

const getSyncStatus = (req, res) => {
  res.json(syncState);
};

const syncSeries = async (req, res) => {
  // Prevent concurrent syncs
  if (syncState.status === 'syncing') {
    return res.status(409).json({ error: 'Sync already in progress' });
  }

  const mode = req.body?.mode || 'new';

  // Set sync state and return immediately
  syncState.status = 'syncing';
  syncState.mode = mode;
  syncState.progress = { current: 0, total: 0 };
  syncState.error = null;
  syncState.startedAt = new Date();
  syncState.completedAt = null;

  res.status(202).json({ message: 'Sync started', mode });

  // Run sync in background (fire-and-forget)
  (async () => {
    try {
      if (mode === 'full') {
        await runFullSync();
      } else {
        await runNewSync();
      }
      syncState.status = 'idle';
      syncState.completedAt = new Date();
    } catch (error) {
      logger.error({ error: error.message }, 'Background sync failed');
      syncState.status = 'error';
      syncState.error = error.message;
      syncState.completedAt = new Date();
    }
  })();
};

/**
 * Full sync: fetches ALL series and ALL episodes from Sonarr.
 */
const runFullSync = async () => {
  const sonarrData = await sonarrService.getAllSeries();
  const now = new Date();
  syncState.progress.total = sonarrData.length;

  for (const item of sonarrData) {
    const existing = await db.select().from(series).where(eq(series.sonarrId, item.id));
    const seriesData = getSeriesCoreData(item, now);

    let seriesId;
    if (existing.length > 0) {
      seriesId = existing[0].id;
      await db.update(series)
        .set(seriesData)
        .where(eq(series.id, seriesId));
    } else {
      const result = await db.insert(series).values(seriesData).returning({ id: series.id });
      seriesId = result[0].id;
    }

    await Promise.all([
      upsertSeriesMetadata(seriesId, item, now),
      upsertSeriesImages(seriesId, item.images, now),
      upsertAlternateTitles(seriesId, item.alternateTitles, now),
      upsertSeasons(seriesId, item.seasons, now)
    ]);

    // Sync episodes after seasons are synced (episodes reference seasons)
    const { removedFileEpisodeIds } = await upsertEpisodes(seriesId, item.id, now);
    await handleRemovedFileDownloads(removedFileEpisodeIds, item.id);

    syncState.progress.current++;
  }

  logger.info({ seriesCount: sonarrData.length }, 'Full sync complete');
};

/**
 * New sync: only syncs series that exist in Sonarr but not yet in AutoAnime.
 */
const runNewSync = async () => {
  const sonarrData = await sonarrService.getAllSeries();

  // Get all sonarr IDs already in our DB
  const existingRows = await db.select({ sonarrId: series.sonarrId }).from(series);
  const existingIds = new Set(existingRows.map(r => r.sonarrId));

  // Filter to only series not yet in DB
  const newSeries = sonarrData.filter(item => !existingIds.has(item.id));

  if (newSeries.length === 0) {
    logger.info('New sync: no new series found');
    return;
  }

  syncState.progress.total = newSeries.length;
  const now = new Date();

  for (const item of newSeries) {
    const seriesData = getSeriesCoreData(item, now);
    const result = await db.insert(series).values(seriesData).returning({ id: series.id });
    const seriesId = result[0].id;

    await Promise.all([
      upsertSeriesMetadata(seriesId, item, now),
      upsertSeriesImages(seriesId, item.images, now),
      upsertAlternateTitles(seriesId, item.alternateTitles, now),
      upsertSeasons(seriesId, item.seasons, now)
    ]);

    const { removedFileEpisodeIds } = await upsertEpisodes(seriesId, item.id, now);
    await handleRemovedFileDownloads(removedFileEpisodeIds, item.id);

    syncState.progress.current++;
  }

  logger.info({ seriesCount: newSeries.length }, 'New sync complete');
};

const triggerRefresh = async (req, res) => {
  try {
    const { id } = req.params;

    const seriesResult = await db.select().from(series).where(eq(series.id, id));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    // Trigger Sonarr to rescan the series
    await sonarrService.refreshSeries(seriesResult[0].sonarrId);

    // Also sync episodes from Sonarr to our DB (applies hasFile reset logic)
    const now = new Date();
    const { count: episodeCount, removedFileEpisodeIds } = await upsertEpisodes(seriesResult[0].id, seriesResult[0].sonarrId, now);

    // Handle stale download records for episodes whose files were removed
    await handleRemovedFileDownloads(removedFileEpisodeIds, seriesResult[0].sonarrId);

    res.json({
      success: true,
      message: `Refresh triggered and synced ${episodeCount || 0} episodes`,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error triggering refresh');
    res.status(500).json({ error: 'Failed to trigger refresh' });
  }
};

const getSeriesEpisodes = async (req, res) => {
  try {
    const { id } = req.params;
    const seriesResult = await db.select().from(series).where(eq(series.id, id));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const [episodes, seasons] = await Promise.all([
      db.select().from(seriesEpisodes).where(eq(seriesEpisodes.seriesId, parseInt(id))),
      db.select().from(seriesSeasons).where(eq(seriesSeasons.seriesId, parseInt(id)))
    ]);

    // Group episodes by season
    const episodesBySeason = {};
    for (const seasonItem of seasons) {
      episodesBySeason[seasonItem.seasonNumber] = {
        season: seasonItem,
        episodes: episodes.filter(e => e.seasonNumber === seasonItem.seasonNumber)
      };
    }

    res.json({
      seriesId: parseInt(id),
      episodes,
      seasons,
      episodesBySeason
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error fetching episodes');
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
};

const syncSeriesEpisodes = async (req, res) => {
  try {
    const { id } = req.params;
    const seriesResult = await db.select().from(series).where(eq(series.id, id));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const now = new Date();
    const { count: episodeCount, removedFileEpisodeIds } = await upsertEpisodes(seriesResult[0].id, seriesResult[0].sonarrId, now);

    // Handle stale download records for episodes whose files were removed
    await handleRemovedFileDownloads(removedFileEpisodeIds, seriesResult[0].sonarrId);

    res.json({
      success: true,
      message: `Synced ${episodeCount || 0} episodes for series ${seriesResult[0].title}`,
      seriesId: parseInt(id),
      syncedAt: now
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error syncing episodes');
    res.status(500).json({ error: `Failed to sync episodes: ${error.message}` });
  }
};

const toggleSeriesAutoDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    const seriesResult = await db.select().from(series).where(eq(series.id, id));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const updatedSeries = await sonarrService.toggleSeriesAutoDownload(parseInt(id), enabled);
    const downloadStatus = await sonarrService.getSeriesDownloadStatus(parseInt(id));

    res.json({
      success: true,
      series: updatedSeries,
      downloadStatus
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error toggling series auto-download');
    res.status(500).json({ error: `Failed to toggle auto-download: ${error.message}` });
  }
};

const toggleSeasonAutoDownload = async (req, res) => {
  try {
    const { seriesId, seasonNumber } = req.params;
    const { enabled } = req.body;

    const seriesResult = await db.select().from(series).where(eq(series.id, seriesId));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const updatedSeason = await sonarrService.toggleSeasonAutoDownload(
      parseInt(seriesId),
      parseInt(seasonNumber),
      enabled
    );
    const downloadStatus = await sonarrService.getSeasonDownloadStatus(
      parseInt(seriesId),
      parseInt(seasonNumber)
    );

    res.json({
      success: true,
      season: updatedSeason,
      downloadStatus
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error toggling season auto-download');
    res.status(500).json({ error: `Failed to toggle auto-download: ${error.message}` });
  }
};

const toggleEpisodeAutoDownload = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { enabled } = req.body;

    const episode = await db.select().from(seriesEpisodes).where(eq(seriesEpisodes.id, episodeId));
    if (episode.length === 0) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    const updatedEpisode = await sonarrService.toggleEpisodeAutoDownload(parseInt(episodeId), enabled);

    res.json({
      success: true,
      episode: updatedEpisode
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error toggling episode auto-download');
    res.status(500).json({ error: `Failed to toggle auto-download: ${error.message}` });
  }
};

const getSeriesAutoDownloadStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const seriesResult = await db.select().from(series).where(eq(series.id, id));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const downloadStatus = await sonarrService.getSeriesDownloadStatus(parseInt(id));

    res.json({
      seriesId: parseInt(id),
      ...downloadStatus
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting series auto-download status');
    res.status(500).json({ error: `Failed to get auto-download status: ${error.message}` });
  }
};

const resetRssMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const seriesId = parseInt(id);

    // Verify series exists
    const seriesResult = await db.select().from(series).where(eq(series.id, seriesId));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    // Reset rss_item_id for all episodes of this series
    await db.update(seriesEpisodes)
      .set({ rssItemId: null })
      .where(eq(seriesEpisodes.seriesId, seriesId));

    res.json({ success: true, message: 'RSS matches reset successfully' });
  } catch (error) {
    logger.error({ error: error.message }, 'Error resetting RSS matches');
    res.status(500).json({ error: 'Failed to reset RSS matches' });
  }
};

const updateEpisodeRssItem = async (req, res) => {
  try {
    const episodeId = parseInt(req.params.episodeId, 10);
    const { rssItemId } = req.body;

    if (isNaN(episodeId)) {
      return res.status(400).json({ error: 'Invalid episode ID' });
    }

    // Update the episode's rssItemId (can be null to unlink)
    const result = await db.update(seriesEpisodes)
      .set({
        rssItemId: rssItemId || null,
        updatedAt: new Date()
      })
      .where(eq(seriesEpisodes.id, episodeId))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    res.json({ success: true, episode: result[0] });
  } catch (error) {
    logger.error({ error: error.message }, 'Error updating episode RSS item');
    res.status(500).json({ error: 'Failed to update episode RSS item' });
  }
};

const downloadEpisode = async (req, res) => {
  try {
    const episodeId = parseInt(req.params.episodeId, 10);
    logger.info({ episodeId }, '[Manual Download] START');

    if (isNaN(episodeId)) {
      logger.warn('[Manual Download] Invalid episode ID');
      return res.status(400).json({ error: 'Invalid episode ID' });
    }

    // Get episode with its RSS item
    const episode = await db.select({
      id: seriesEpisodes.id,
      seriesId: seriesEpisodes.seriesId,
      rssItemId: seriesEpisodes.rssItemId,
      magnetLink: rssItem.magnetLink,
      rssTitle: rssItem.title,
      rssItemDbId: rssItem.id
    })
      .from(seriesEpisodes)
      .leftJoin(rssItem, eq(seriesEpisodes.rssItemId, rssItem.id))
      .where(eq(seriesEpisodes.id, episodeId))
      .limit(1);

    if (episode.length === 0) {
      logger.warn({ episodeId }, '[Manual Download] Episode not found');
      return res.status(404).json({ error: 'Episode not found' });
    }

    const ep = episode[0];
    logger.info({
      episodeId: ep.id,
      seriesId: ep.seriesId,
      rssItemId: ep.rssItemId,
      rssItemDbId: ep.rssItemDbId,
      hasTitle: !!ep.rssTitle,
      hasMagnetLink: !!ep.magnetLink
    }, '[Manual Download] Episode data');

    if (!ep.rssItemId || !ep.magnetLink) {
      logger.warn({ episodeId: ep.id }, '[Manual Download] No RSS item or magnet link');
      return res.status(400).json({ error: 'Episode has no RSS item linked or magnet link not available' });
    }

    // Use shared download logic
    const { triggerEpisodeDownload, getDownloadStatusIds } = require('../services/downloadSchedulerService');
    const statusIds = await getDownloadStatusIds();
    logger.info({ statusIds }, '[Manual Download] Status IDs');

    logger.info({
      episode: { id: ep.id },
      rssItemData: { id: ep.rssItemDbId, title: ep.rssTitle, hasMagnetLink: !!ep.magnetLink }
    }, '[Manual Download] Calling triggerEpisodeDownload');

    const result = await triggerEpisodeDownload(
      { id: ep.id },
      { id: ep.rssItemDbId, magnetLink: ep.magnetLink, title: ep.rssTitle },
      statusIds
    );

    logger.info({ result }, '[Manual Download] triggerEpisodeDownload result');

    if (!result.success) {
      logger.error({ episodeId: ep.id, error: result.message }, '[Manual Download] triggerEpisodeDownload failed');
      return res.status(500).json({ error: result.message });
    }

    logger.info({ episodeId: ep.id, torrentHash: result.torrentHash }, '[Manual Download] SUCCESS');
    res.json({ success: true, message: 'Download started', torrentHash: result.torrentHash });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, '[Manual Download] Exception');
    res.status(500).json({ error: 'Failed to download episode' });
  }
};

const deleteSeries = async (req, res) => {
  try {
    const { id } = req.params;
    const seriesId = parseInt(id);

    const seriesResult = await db.select().from(series).where(eq(series.id, seriesId));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    // Get all episode IDs for this series to clean up downloads
    const episodes = await db.select({ id: seriesEpisodes.id })
      .from(seriesEpisodes)
      .where(eq(seriesEpisodes.seriesId, seriesId));
    const episodeIds = episodes.map(e => e.id);

    // Delete downloads linked to this series' episodes
    if (episodeIds.length > 0) {
      await db.delete(downloads).where(inArray(downloads.seriesEpisodeId, episodeIds));
    }

    // Delete all child tables explicitly
    await db.delete(seriesEpisodes).where(eq(seriesEpisodes.seriesId, seriesId));
    await db.delete(seriesSeasons).where(eq(seriesSeasons.seriesId, seriesId));
    await db.delete(seriesImages).where(eq(seriesImages.seriesId, seriesId));
    await db.delete(seriesAlternateTitles).where(eq(seriesAlternateTitles.seriesId, seriesId));
    await db.delete(seriesMetadata).where(eq(seriesMetadata.seriesId, seriesId));

    // Finally delete the series itself
    await db.delete(series).where(eq(series.id, seriesId));

    logger.info({ seriesId }, 'Series and all related records deleted');
    res.json({ success: true, message: 'Series and all related records deleted successfully' });
  } catch (error) {
    logger.error({ error: error.message }, 'Error deleting series');
    res.status(500).json({ error: 'Failed to delete series' });
  }
};

const getEpisodeDownloadStatuses = async (req, res) => {
  try {
    const { id } = req.params;

    const seriesResult = await db.select().from(series).where(eq(series.id, id));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const result = await sonarrService.getEpisodeDownloadStatuses(parseInt(id));
    res.json(result);
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting episode download statuses');
    res.status(500).json({ error: `Failed to get episode download statuses: ${error.message}` });
  }
};

module.exports = {
  getStatus,
  getSeries,
  getSeriesById,
  getSyncStatus,
  syncSeries,
  triggerRefresh,
  getSeriesEpisodes,
  syncSeriesEpisodes,
  toggleSeriesAutoDownload,
  toggleSeasonAutoDownload,
  toggleEpisodeAutoDownload,
  getSeriesAutoDownloadStatus,
  getEpisodeDownloadStatuses,
  resetRssMatches,
  updateEpisodeRssItem,
  downloadEpisode,
  deleteSeries
};
