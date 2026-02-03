require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { testConnection } = require('./db/db');
const sonarrService = require('./services/sonarrService');
const qbittorrentService = require('./services/qbittorrentService');
const { db } = require('./db/db');
const { series, seriesImages, seriesAlternateTitles, seriesSeasons } = require('./db/schema');
const { eq } = require('drizzle-orm');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  const sonarrStatus = await sonarrService.getStatus();
  const qbittorrentStatus = await qbittorrentService.getConnectionStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'autoanime-backend',
    database: dbConnected ? 'connected' : 'disconnected',
    sonarr: sonarrStatus,
    qbittorrent: qbittorrentStatus
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const parseTimestamp = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const extractImageUrl = (images, coverType) => {
  const image = images?.find(img => img.coverType === coverType);
  return image?.remoteUrl || null;
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

const syncOnStartup = async () => {
  try {
    console.log('Syncing series from Sonarr on startup...');
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
    }
    console.log(`Startup sync complete: ${sonarrData.length} series synced`);
  } catch (error) {
    console.error('Startup sync failed:', error.message);
  }
};

const startServer = async () => {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('Database connection failed, starting without DB sync');
  } else {
    await syncOnStartup();
  }

  app.listen(PORT, () => {
    console.log(`AutoAnime backend running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
