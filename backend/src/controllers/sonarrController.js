const sonarrService = require('../services/sonarrService');
const { db } = require('../db/db');
const { series, seriesImages, seriesAlternateTitles, seriesSeasons, seriesEpisodes } = require('../db/schema');
const { eq, and } = require('drizzle-orm');
const AutoDownloadStatus = require('../enums/autoDownloadStatus');

const extractImageUrl = (images, coverType) => {
  const image = images?.find(img => img.coverType === coverType);
  return image?.remoteUrl || null;
};

const parseTimestamp = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const syncSeriesImages = async (seriesId, images, now) => {
  if (!images || images.length === 0) return;
  
  await db.delete(seriesImages).where(eq(seriesImages.seriesId, seriesId));
  
  const imageRecords = images.map(img => ({
    seriesId: seriesId,
    coverType: img.coverType,
    url: img.url,
    remoteUrl: img.remoteUrl,
    createdAt: now,
    updatedAt: now
  }));
  
  if (imageRecords.length > 0) {
    await db.insert(seriesImages).values(imageRecords);
  }
};

const syncAlternateTitles = async (seriesId, alternateTitles, now) => {
  if (!alternateTitles || alternateTitles.length === 0) return;
  
  await db.delete(seriesAlternateTitles).where(eq(seriesAlternateTitles.seriesId, seriesId));
  
  const titleRecords = alternateTitles.map(alt => ({
    seriesId: seriesId,
    title: alt.title,
    sceneSeasonNumber: alt.sceneSeasonNumber,
    createdAt: now,
    updatedAt: now
  }));
  
  if (titleRecords.length > 0) {
    await db.insert(seriesAlternateTitles).values(titleRecords);
  }
};

const syncSeasons = async (seriesId, seasons, now) => {
  if (!seasons || seasons.length === 0) return;
  
  await db.delete(seriesSeasons).where(eq(seriesSeasons.seriesId, seriesId));
  
  const seasonRecords = seasons.map(season => ({
    seriesId: seriesId,
    seasonNumber: season.seasonNumber,
    monitored: season.monitored,
    episodeCount: season.statistics?.episodeCount,
    episodeFileCount: season.statistics?.episodeFileCount,
    totalEpisodeCount: season.statistics?.totalEpisodeCount,
    sizeOnDisk: season.statistics?.sizeOnDisk,
    percentOfEpisodes: season.statistics?.percentOfEpisodes,
    nextAiring: parseTimestamp(season.statistics?.nextAiring),
    previousAiring: parseTimestamp(season.statistics?.previousAiring),
    createdAt: now,
    updatedAt: now
  }));
  
  if (seasonRecords.length > 0) {
    await db.insert(seriesSeasons).values(seasonRecords);
  }
};

const syncEpisodes = async (seriesId, sonarrSeriesId, now) => {
  try {
    // Get episodes from Sonarr API
    const episodes = await sonarrService.getEpisodesBySeries(sonarrSeriesId);
    if (!episodes || episodes.length === 0) return;
    
    // Get season mappings for this series
    const seasons = await db.select().from(seriesSeasons).where(eq(seriesSeasons.seriesId, seriesId));
    const seasonIdMap = {};
    for (const season of seasons) {
      seasonIdMap[season.seasonNumber] = season.id;
    }
    
    // Delete existing episodes for this series
    await db.delete(seriesEpisodes).where(eq(seriesEpisodes.seriesId, seriesId));
    
    // Insert new episode records
    const episodeRecords = episodes.map(episode => ({
      seriesId: seriesId,
      seasonId: seasonIdMap[episode.seasonNumber] || null,
      sonarrEpisodeId: episode.id,
      title: episode.title,
      episodeNumber: episode.episodeNumber,
      seasonNumber: episode.seasonNumber,
      overview: episode.overview,
      airDate: parseTimestamp(episode.airDateUtc),
      hasFile: episode.hasFile || false,
      monitored: episode.monitored || true,
      createdAt: now,
      updatedAt: now
    }));
    
    if (episodeRecords.length > 0) {
      await db.insert(seriesEpisodes).values(episodeRecords);
    }
    
    return episodeRecords.length;
  } catch (error) {
    console.error('Error syncing episodes:', error);
    throw error;
  }
};

const getSeriesData = (item, now) => {
  const stats = item.statistics || {};
  const ratings = item.ratings || {};
  
  return {
    sonarrId: item.id,
    title: item.title,
    titleSlug: item.titleSlug,
    overview: item.overview,
    posterPath: extractImageUrl(item.images, 'poster'),
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
    status: item.status,
    profileId: item.profileId,
    languageProfileId: item.languageProfileId,
    seasonCount: stats.seasonCount,
    episodeCount: stats.episodeCount,
    totalEpisodeCount: stats.totalEpisodeCount,
    episodeFileCount: stats.episodeFileCount,
    sizeOnDisk: stats.sizeOnDisk,
    percentOfEpisodes: stats.percentOfEpisodes,
    ratingValue: ratings.value,
    ratingVotes: ratings.votes,
    monitored: item.monitored,
    lastSyncedAt: now,
    rawData: item,
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
    
    const [images, alternateTitles, seasons, episodes] = await Promise.all([
      db.select().from(seriesImages).where(eq(seriesImages.seriesId, parseInt(id))),
      db.select().from(seriesAlternateTitles).where(eq(seriesAlternateTitles.seriesId, parseInt(id))),
      db.select().from(seriesSeasons).where(eq(seriesSeasons.seriesId, parseInt(id))),
      db.select().from(seriesEpisodes).where(eq(seriesEpisodes.seriesId, parseInt(id)))
    ]);
    
    res.json({
      ...seriesResult[0],
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
      const seriesData = getSeriesData(item, now);

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
        syncSeriesImages(seriesId, item.images, now),
        syncAlternateTitles(seriesId, item.alternateTitles, now),
        syncSeasons(seriesId, item.seasons, now)
      ]);
      
      // Sync episodes after seasons are synced (episodes reference seasons)
      await syncEpisodes(seriesId, item.id, now);
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
    const episodeCount = await syncEpisodes(seriesResult[0].id, seriesResult[0].sonarrId, now);

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
  getSeriesAutoDownloadStatus
};
