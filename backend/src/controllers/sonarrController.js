const sonarrService = require('../services/sonarrService');
const { db } = require('../db/db');
const { sonarrSeries, seriesImages, seriesAlternateTitles, seriesSeasons } = require('../db/schema');
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

const syncSeriesImages = async (seriesId, images, now) => {
  if (!images || images.length === 0) return;
  
  await db.delete(seriesImages).where(eq(seriesImages.sonarrSeriesId, seriesId));
  
  const imageRecords = images.map(img => ({
    sonarrSeriesId: seriesId,
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
  
  await db.delete(seriesAlternateTitles).where(eq(seriesAlternateTitles.sonarrSeriesId, seriesId));
  
  const titleRecords = alternateTitles.map(alt => ({
    sonarrSeriesId: seriesId,
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
  
  await db.delete(seriesSeasons).where(eq(seriesSeasons.sonarrSeriesId, seriesId));
  
  const seasonRecords = seasons.map(season => ({
    sonarrSeriesId: seriesId,
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
    const series = await db.select().from(sonarrSeries).orderBy(sonarrSeries.title);
    res.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
};

const getSeriesById = async (req, res) => {
  try {
    const { id } = req.params;
    const series = await db.select().from(sonarrSeries).where(eq(sonarrSeries.id, id));
    if (series.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }
    
    const [images, alternateTitles, seasons] = await Promise.all([
      db.select().from(seriesImages).where(eq(seriesImages.sonarrSeriesId, parseInt(id))),
      db.select().from(seriesAlternateTitles).where(eq(seriesAlternateTitles.sonarrSeriesId, parseInt(id))),
      db.select().from(seriesSeasons).where(eq(seriesSeasons.sonarrSeriesId, parseInt(id)))
    ]);
    
    res.json({
      ...series[0],
      images,
      alternateTitles,
      seasons
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
      const existing = await db.select().from(sonarrSeries).where(eq(sonarrSeries.sonarrId, item.id));
      const seriesData = getSeriesData(item, now);

      let seriesId;
      if (existing.length > 0) {
        seriesId = existing[0].id;
        await db.update(sonarrSeries)
          .set(seriesData)
          .where(eq(sonarrSeries.id, seriesId));
      } else {
        const result = await db.insert(sonarrSeries).values(seriesData).returning({ id: sonarrSeries.id });
        seriesId = result[0].id;
      }

      await Promise.all([
        syncSeriesImages(seriesId, item.images, now),
        syncAlternateTitles(seriesId, item.alternateTitles, now),
        syncSeasons(seriesId, item.seasons, now)
      ]);
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

    const series = await db.select().from(sonarrSeries).where(eq(sonarrSeries.id, id));
    if (series.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const result = await sonarrService.refreshSeries(series[0].sonarrId);
    res.json({ success: true, message: 'Refresh triggered', command: result });
  } catch (error) {
    console.error('Error triggering refresh:', error);
    res.status(500).json({ error: 'Failed to trigger refresh' });
  }
};

module.exports = {
  getStatus,
  getSeries,
  getSeriesById,
  syncSeries,
  triggerRefresh
};
