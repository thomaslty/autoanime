require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { testConnection } = require('./db/db');
const sonarrService = require('./services/sonarrService');
const qbittorrentService = require('./services/qbittorrentService');
const { db } = require('./db/db');
const { sonarrSeries } = require('./db/schema');
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

const syncOnStartup = async () => {
  try {
    console.log('Syncing series from Sonarr on startup...');
    const sonarrData = await sonarrService.getAllSeries();
    const now = new Date();

    for (const item of sonarrData) {
      const existing = await db.select().from(sonarrSeries).where(eq(sonarrSeries.sonarrId, item.id));

      if (existing.length > 0) {
        await db.update(sonarrSeries)
          .set({
            title: item.title,
            titleSlug: item.titleSlug,
            overview: item.overview,
            posterPath: item.posterPath,
            bannerPath: item.bannerPath,
            network: item.network,
            airDay: item.airDay,
            airTime: item.airTime,
            showType: item.showType,
            status: item.status,
            profileId: item.profileId,
            languageProfileId: item.languageProfileId,
            seasonCount: item.seasonCount,
            totalEpisodeCount: item.totalEpisodeCount,
            episodeFileCount: item.episodeFileCount,
            sizeOnDisk: item.sizeOnDisk,
            monitored: item.monitored,
            lastSyncedAt: now,
            rawData: item,
            updatedAt: now
          })
          .where(eq(sonarrSeries.id, existing[0].id));
      } else {
        await db.insert(sonarrSeries).values({
          sonarrId: item.id,
          title: item.title,
          titleSlug: item.titleSlug,
          overview: item.overview,
          posterPath: item.posterPath,
          bannerPath: item.bannerPath,
          network: item.network,
          airDay: item.airDay,
          airTime: item.airTime,
          showType: item.showType,
          status: item.status,
          profileId: item.profileId,
          languageProfileId: item.languageProfileId,
          seasonCount: item.seasonCount,
          totalEpisodeCount: item.totalEpisodeCount,
          episodeFileCount: item.episodeFileCount,
          sizeOnDisk: item.sizeOnDisk,
          monitored: item.monitored,
          lastSyncedAt: now,
          rawData: item
        });
      }
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
