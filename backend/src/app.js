require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { testConnection } = require('./db/db');
const sonarrService = require('./services/sonarrService');
const qbittorrentService = require('./services/qbittorrentService');
const { db } = require('./db/db');
const { series, seriesImages, seriesAlternateTitles, seriesSeasons, seriesEpisodes } = require('./db/schema');
const { eq, and } = require('drizzle-orm');

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
        upsertSeriesImages(seriesId, item.images, now),
        upsertAlternateTitles(seriesId, item.alternateTitles, now),
        upsertSeasons(seriesId, item.seasons, now)
      ]);

      // Sync episodes after seasons are synced (episodes reference seasons)
      await upsertEpisodes(seriesId, item.id, now);
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
