const sonarrService = require('../services/sonarrService');
const { db } = require('../db/db');
const { sonarrSeries } = require('../db/schema');
const { eq, and } = require('drizzle-orm');

const extractImageUrl = (images, coverType) => {
  const image = images?.find(img => img.coverType === coverType);
  return image?.remoteUrl || null;
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
    res.json(series[0]);
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

      if (existing.length > 0) {
        await db.update(sonarrSeries)
          .set({
            title: item.title,
            titleSlug: item.titleSlug,
            overview: item.overview,
            posterPath: extractImageUrl(item.images, 'poster'),
            bannerPath: extractImageUrl(item.images, 'banner'),
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
          posterPath: extractImageUrl(item.images, 'poster'),
          bannerPath: extractImageUrl(item.images, 'banner'),
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
