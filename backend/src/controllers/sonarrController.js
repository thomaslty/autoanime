const sonarrService = require('../services/sonarrService');
const { db } = require('../db/db');
const { series, seriesMetadata, seriesImages, seriesAlternateTitles, seriesSeasons, seriesEpisodes, rssItem, downloadStatus, downloads } = require('../db/schema');
const { eq, and } = require('drizzle-orm');

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

const upsertEpisodes = async (seriesId, sonarrSeriesId, now) => {
  try {
    // Get episodes from Sonarr API
    const episodes = await sonarrService.getEpisodesBySeries(sonarrSeriesId);
    if (!episodes || episodes.length === 0) return 0;

    // Get season mappings for this series
    const seasons = await db.select().from(seriesSeasons).where(eq(seriesSeasons.seriesId, seriesId));
    const seasonIdMap = {};
    for (const season of seasons) {
      seasonIdMap[season.seasonNumber] = season.id;
    }

    let upsertCount = 0;
    for (const episode of episodes) {
      const existing = await db.select().from(seriesEpisodes).where(
        eq(seriesEpisodes.sonarrEpisodeId, episode.id)
      );

      // Metadata only - preserve isAutoDownloadEnabled, autoDownloadStatus, downloadedAt
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
        await db.update(seriesEpisodes)
          .set(metadataUpdate)
          .where(eq(seriesEpisodes.id, existing[0].id));
      } else {
        await db.insert(seriesEpisodes).values({
          sonarrEpisodeId: episode.id,
          ...metadataUpdate,
          createdAt: now
        });
      }
      upsertCount++;
    }

    return upsertCount;
  } catch (error) {
    console.error('Error syncing episodes:', error);
    throw error;
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
    console.error('Error checking Sonarr status:', error);
    res.status(500).json({ error: 'Failed to check Sonarr status' });
  }
};

const getSeries = async (req, res) => {
  try {
    const allSeries = await db.select().from(series).orderBy(series.title);
    res.json(allSeries);
  } catch (error) {
    console.error('Error fetching series:', error);
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
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
};

const syncSeries = async (req, res) => {
  try {
    const sonarrData = await sonarrService.getAllSeries();
    const now = new Date();

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
      await upsertEpisodes(seriesId, item.id, now);
    }

    res.json({
      success: true,
      message: `Synced ${sonarrData.length} series from Sonarr`,
      syncedAt: now
    });
  } catch (error) {
    console.error('Error syncing series:', error);
    res.status(500).json({ error: `Failed to sync series: ${error.message}` });
  }
};

const triggerRefresh = async (req, res) => {
  try {
    const { id } = req.params;
    const sonarrId = parseInt(id);

    const seriesResult = await db.select().from(series).where(eq(series.id, id));
    if (seriesResult.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const result = await sonarrService.refreshSeries(seriesResult[0].sonarrId);
    res.json({ success: true, message: 'Refresh triggered', command: result });
  } catch (error) {
    console.error('Error triggering refresh:', error);
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
    console.error('Error fetching episodes:', error);
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
    const episodeCount = await upsertEpisodes(seriesResult[0].id, seriesResult[0].sonarrId, now);

    res.json({
      success: true,
      message: `Synced ${episodeCount || 0} episodes for series ${seriesResult[0].title}`,
      seriesId: parseInt(id),
      syncedAt: now
    });
  } catch (error) {
    console.error('Error syncing episodes:', error);
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
    console.error('Error toggling series auto-download:', error);
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
    console.error('Error toggling season auto-download:', error);
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
    console.error('Error toggling episode auto-download:', error);
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
    console.error('Error getting series auto-download status:', error);
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
    console.error('Error resetting RSS matches:', error);
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
    console.error('Error updating episode RSS item:', error);
    res.status(500).json({ error: 'Failed to update episode RSS item' });
  }
};

const downloadEpisode = async (req, res) => {
  try {
    const episodeId = parseInt(req.params.episodeId, 10);

    if (isNaN(episodeId)) {
      return res.status(400).json({ error: 'Invalid episode ID' });
    }

    // Get episode with its RSS item
    const episode = await db.select({
      id: seriesEpisodes.id,
      seriesId: seriesEpisodes.seriesId,
      rssItemId: seriesEpisodes.rssItemId,
      magnetLink: rssItem.magnetLink,
      rssTitle: rssItem.title
    })
      .from(seriesEpisodes)
      .leftJoin(rssItem, eq(seriesEpisodes.rssItemId, rssItem.id))
      .where(eq(seriesEpisodes.id, episodeId))
      .limit(1);

    if (episode.length === 0) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    const ep = episode[0];

    if (!ep.rssItemId || !ep.magnetLink) {
      return res.status(400).json({ error: 'Episode has no RSS item linked or magnet link not available' });
    }

    // Get DOWNLOADING status ID
    const downloadingStatus = await db.select().from(downloadStatus).where(eq(downloadStatus.name, 'DOWNLOADING')).limit(1);
    const downloadingStatusId = downloadingStatus[0]?.id;

    // Trigger download via qBittorrent service
    const qbittorrentService = require('../services/qbittorrentService');
    const result = await qbittorrentService.addMagnet(ep.magnetLink, 'autoanime');

    if (!result.success) {
      return res.status(500).json({ error: result.message || 'Failed to add torrent to qBittorrent' });
    }

    // Extract torrent hash
    const hashMatch = ep.magnetLink.match(/xt=urn:btih:([a-fA-F0-9]+)/);
    const torrentHash = hashMatch ? hashMatch[1].toUpperCase() : null;

    const now = new Date();

    // Update episode status
    await db.update(seriesEpisodes)
      .set({
        downloadedAt: now,
        downloadStatusId: downloadingStatusId,
        updatedAt: now
      })
      .where(eq(seriesEpisodes.id, ep.id));

    // Save download record
    if (torrentHash) {
      await db.insert(downloads).values({
        torrentHash,
        magnetLink: ep.magnetLink,
        seriesEpisodeId: ep.id,
        rssItemId: ep.rssItemId,
        category: 'autoanime',
        downloadStatusId: downloadingStatusId,
        name: ep.rssTitle,
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing();
    }

    res.json({ success: true, message: 'Download started', torrentHash });
  } catch (error) {
    console.error('Error downloading episode:', error);
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

    await db.delete(downloads).where(eq(downloads.seriesEpisodeId, seriesId));

    await db.delete(series).where(eq(series.id, seriesId));

    res.json({ success: true, message: 'Series and all related records deleted successfully' });
  } catch (error) {
    console.error('Error deleting series:', error);
    res.status(500).json({ error: 'Failed to delete series' });
  }
};

module.exports = {
  getStatus,
  getSeries,
  getSeriesById,
  syncSeries,
  triggerRefresh,
  getSeriesEpisodes,
  syncSeriesEpisodes,
  toggleSeriesAutoDownload,
  toggleSeasonAutoDownload,
  toggleEpisodeAutoDownload,
  getSeriesAutoDownloadStatus,
  resetRssMatches,
  updateEpisodeRssItem,
  downloadEpisode,
  deleteSeries
};
