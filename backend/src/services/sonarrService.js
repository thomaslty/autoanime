const configService = require('./configService');
const { db } = require('../db/db');
const { series, seriesSeasons, seriesEpisodes, downloadStatus, downloads } = require('../db/schema');
const { eq, and, ne, inArray } = require('drizzle-orm');

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
 * Clean up incomplete downloads for an episode when auto-download is disabled.
 * Only removes downloads that are NOT completed (DOWNLOADING status).
 * @param {number} episodeId - The episode ID
 */
const cleanupIncompleteDownloads = async (episodeId) => {
  const statusIds = await getDownloadStatusIds();
  const now = new Date();

  // Find downloads for this episode that are NOT completed
  const incompleteDownloads = await db.select()
    .from(downloads)
    .where(and(
      eq(downloads.seriesEpisodeId, episodeId),
      eq(downloads.downloadStatusId, statusIds['DOWNLOADING'])
    ));

  if (incompleteDownloads.length > 0) {
    // Delete the incomplete download records
    await db.delete(downloads).where(and(
      eq(downloads.seriesEpisodeId, episodeId),
      eq(downloads.downloadStatusId, statusIds['DOWNLOADING'])
    ));

    // Reset the episode download status (but keep the RSS match)
    await db.update(seriesEpisodes)
      .set({
        downloadStatusId: null,
        downloadedAt: null,
        updatedAt: now
      })
      .where(eq(seriesEpisodes.id, episodeId));
  }
};

const getSonarrConfig = async () => {
  const config = await configService.getConfig();
  return config.sonarr;
};

const getStatus = async () => {
  try {
    const sonarrConfig = await getSonarrConfig();
    const headers = {
      'X-Api-Key': sonarrConfig.apiKey,
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(`${sonarrConfig.url}/api/v3/system/status`, { headers });
    if (!response.ok) {
      return {
        connected: false,
        message: `Sonarr API error: ${response.status}`,
        url: sonarrConfig.url
      };
    }
    const data = await response.json();
    return {
      connected: true,
      message: 'Connected to Sonarr',
      url: sonarrConfig.url,
      version: data.version
    };
  } catch (error) {
    return {
      connected: false,
      message: `Connection failed: ${error.message}`,
      url: (await getSonarrConfig()).url
    };
  }
};

const getAllSeries = async () => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;
  
  const response = await fetch(`${apiBase}/series`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const getSeriesById = async (id) => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;
  
  const response = await fetch(`${apiBase}/series/${id}`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const searchSeries = async (term) => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;
  
  const response = await fetch(`${apiBase}/series/lookup?term=${encodeURIComponent(term)}`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const refreshSeries = async (seriesId) => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;
  
  const response = await fetch(`${apiBase}/command`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'RefreshSeries', seriesId })
  });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

/**
 * Trigger Sonarr to rename all episode files in a series according to the naming format.
 * @param {number} seriesId - The Sonarr series ID
 */
const renameSeries = async (seriesId) => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;

  const response = await fetch(`${apiBase}/command`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'RenameSeries', seriesIds: [seriesId] })
  });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const getEpisodesBySeries = async (seriesId) => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;
  
  const response = await fetch(`${apiBase}/episode?seriesId=${seriesId}`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const getEpisodeById = async (episodeId) => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;

  const response = await fetch(`${apiBase}/episode/${episodeId}`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const toggleSeriesAutoDownload = async (seriesId, enabled) => {
  const now = new Date();
  const statusIds = await getDownloadStatusIds();

  // If disabling auto-download, clean up incomplete downloads for all episodes in this series (excluding season 0)
  if (!enabled) {
    const allEpisodes = await db.select({ id: seriesEpisodes.id })
      .from(seriesEpisodes)
      .where(and(
        eq(seriesEpisodes.seriesId, seriesId),
        ne(seriesEpisodes.seasonNumber, 0)
      ));

    for (const ep of allEpisodes) {
      await cleanupIncompleteDownloads(ep.id);
    }
  }

  await db.update(series)
    .set({
      isAutoDownloadEnabled: enabled,
      downloadStatusId: enabled ? statusIds['PENDING'] : statusIds['DISABLED'],
      updatedAt: now
    })
    .where(eq(series.id, seriesId));

  // Cascade to all seasons (excluding season 0)
  await db.update(seriesSeasons)
    .set({
      isAutoDownloadEnabled: enabled,
      downloadStatusId: enabled ? statusIds['PENDING'] : statusIds['DISABLED'],
      updatedAt: now
    })
    .where(and(
      eq(seriesSeasons.seriesId, seriesId),
      ne(seriesSeasons.seasonNumber, 0)
    ));

  // Cascade to all episodes (excluding season 0)
  await db.update(seriesEpisodes)
    .set({
      isAutoDownloadEnabled: enabled,
      downloadStatusId: enabled ? statusIds['PENDING'] : statusIds['DISABLED'],
      updatedAt: now
    })
    .where(and(
      eq(seriesEpisodes.seriesId, seriesId),
      ne(seriesEpisodes.seasonNumber, 0)
    ));

  const result = await db.select().from(series).where(eq(series.id, seriesId));
  return result[0];
};

const toggleSeasonAutoDownload = async (seriesId, seasonNumber, enabled) => {
  const now = new Date();
  const statusIds = await getDownloadStatusIds();

  const season = await db.select().from(seriesSeasons).where(
    and(
      eq(seriesSeasons.seriesId, seriesId),
      eq(seriesSeasons.seasonNumber, seasonNumber)
    )
  );

  if (season.length === 0) {
    throw new Error('Season not found');
  }

  const seasonId = season[0].id;

  // If disabling auto-download, clean up incomplete downloads for all episodes in this season
  if (!enabled) {
    const seasonEpisodes = await db.select({ id: seriesEpisodes.id })
      .from(seriesEpisodes)
      .where(and(
        eq(seriesEpisodes.seriesId, seriesId),
        eq(seriesEpisodes.seasonNumber, seasonNumber)
      ));

    for (const ep of seasonEpisodes) {
      await cleanupIncompleteDownloads(ep.id);
    }
  }

  await db.update(seriesSeasons)
    .set({
      isAutoDownloadEnabled: enabled,
      downloadStatusId: enabled ? statusIds['PENDING'] : statusIds['DISABLED'],
      updatedAt: now
    })
    .where(eq(seriesSeasons.id, seasonId));

  await db.update(seriesEpisodes)
    .set({
      isAutoDownloadEnabled: enabled,
      downloadStatusId: enabled ? statusIds['PENDING'] : statusIds['DISABLED'],
      updatedAt: now
    })
    .where(
      and(
        eq(seriesEpisodes.seriesId, seriesId),
        eq(seriesEpisodes.seasonNumber, seasonNumber)
      )
    );

  const updatedSeason = await db.select().from(seriesSeasons).where(eq(seriesSeasons.id, seasonId));
  return updatedSeason[0];
};

const toggleEpisodeAutoDownload = async (episodeId, enabled) => {
  const now = new Date();
  const statusIds = await getDownloadStatusIds();

  // If disabling auto-download, clean up incomplete downloads first
  if (!enabled) {
    await cleanupIncompleteDownloads(episodeId);
  }

  await db.update(seriesEpisodes)
    .set({
      isAutoDownloadEnabled: enabled,
      downloadStatusId: enabled ? statusIds['PENDING'] : statusIds['DISABLED'],
      updatedAt: now
    })
    .where(eq(seriesEpisodes.id, episodeId));

  const episode = await db.select().from(seriesEpisodes).where(eq(seriesEpisodes.id, episodeId));
  return episode[0];
};

const getSeriesDownloadStatus = async (seriesId) => {
  const statusIds = await getDownloadStatusIds();
  const episodes = await db.select().from(seriesEpisodes).where(eq(seriesEpisodes.seriesId, seriesId));

  const totalEpisodes = episodes.length;
  const downloadedCount = episodes.filter(e => e.downloadStatusId === statusIds['DOWNLOADED']).length;
  const downloadingCount = episodes.filter(e => e.downloadStatusId === statusIds['DOWNLOADING']).length;
  const pendingCount = episodes.filter(e => e.downloadStatusId === statusIds['PENDING']).length;
  const failedCount = episodes.filter(e => e.downloadStatusId === statusIds['FAILED']).length;
  const enabledCount = episodes.filter(e => e.isAutoDownloadEnabled).length;

  return {
    totalEpisodes,
    downloadedCount,
    downloadingCount,
    pendingCount,
    failedCount,
    enabledCount,
    isEnabled: enabledCount > 0
  };
};

const getSeasonDownloadStatus = async (seriesId, seasonNumber) => {
  const statusIds = await getDownloadStatusIds();
  const episodes = await db.select().from(seriesEpisodes).where(
    and(
      eq(seriesEpisodes.seriesId, seriesId),
      eq(seriesEpisodes.seasonNumber, seasonNumber)
    )
  );

  const totalEpisodes = episodes.length;
  const downloadedCount = episodes.filter(e => e.downloadStatusId === statusIds['DOWNLOADED']).length;
  const downloadingCount = episodes.filter(e => e.downloadStatusId === statusIds['DOWNLOADING']).length;
  const pendingCount = episodes.filter(e => e.downloadStatusId === statusIds['PENDING']).length;
  const failedCount = episodes.filter(e => e.downloadStatusId === statusIds['FAILED']).length;
  const enabledCount = episodes.filter(e => e.isAutoDownloadEnabled).length;

  return {
    totalEpisodes,
    downloadedCount,
    downloadingCount,
    pendingCount,
    failedCount,
    enabledCount,
    isEnabled: enabledCount > 0,
    aggregatedStatus: getAggregatedStatus(episodes, statusIds)
  };
};

const getAggregatedStatus = (episodes, statusIds) => {
  if (episodes.length === 0) return statusIds ? statusIds['DISABLED'] : 0;

  const statusCounts = {};
  episodes.forEach(e => {
    const status = e.downloadStatusId || (statusIds ? statusIds['DISABLED'] : 0);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  if (statusCounts[statusIds['DOWNLOADING']] > 0) {
    return statusIds['DOWNLOADING'];
  } else if (statusCounts[statusIds['PENDING']] > 0) {
    return statusIds['PENDING'];
  } else if (statusCounts[statusIds['FAILED']] > 0) {
    return statusIds['FAILED'];
  } else if (statusCounts[statusIds['DOWNLOADED']] === episodes.length) {
    return statusIds['DOWNLOADED'];
  } else if (statusCounts[statusIds['SKIPPED']] > 0) {
    return statusIds['SKIPPED'];
  }

  return statusIds['DISABLED'];
};

module.exports = {
  getStatus,
  getAllSeries,
  getSeriesById,
  searchSeries,
  refreshSeries,
  renameSeries,
  getEpisodesBySeries,
  getEpisodeById,
  toggleSeriesAutoDownload,
  toggleSeasonAutoDownload,
  toggleEpisodeAutoDownload,
  getSeriesDownloadStatus,
  getSeasonDownloadStatus
};