const configService = require('./configService');
const { db } = require('../db/db');
const { series, seriesSeasons, seriesEpisodes } = require('../db/schema');
const { eq, and, inArray } = require('drizzle-orm');
const AutoDownloadStatus = require('../enums/autoDownloadStatus');

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

  await db.update(series)
    .set({
      isAutoDownloadEnabled: enabled,
      downloadStatus: enabled ? AutoDownloadStatus.PENDING : AutoDownloadStatus.DISABLED,
      updatedAt: now
    })
    .where(eq(series.id, seriesId));

  const result = await db.select().from(series).where(eq(series.id, seriesId));
  return result[0];
};

const toggleSeasonAutoDownload = async (seriesId, seasonNumber, enabled) => {
  const now = new Date();

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

  await db.update(seriesSeasons)
    .set({
      isAutoDownloadEnabled: enabled,
      autoDownloadStatus: enabled ? AutoDownloadStatus.PENDING : AutoDownloadStatus.DISABLED,
      updatedAt: now
    })
    .where(eq(seriesSeasons.id, seasonId));

  await db.update(seriesEpisodes)
    .set({
      isAutoDownloadEnabled: enabled,
      autoDownloadStatus: enabled ? AutoDownloadStatus.PENDING : AutoDownloadStatus.DISABLED,
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

  await db.update(seriesEpisodes)
    .set({
      isAutoDownloadEnabled: enabled,
      autoDownloadStatus: enabled ? AutoDownloadStatus.PENDING : AutoDownloadStatus.DISABLED,
      updatedAt: now
    })
    .where(eq(seriesEpisodes.id, episodeId));

  const episode = await db.select().from(seriesEpisodes).where(eq(seriesEpisodes.id, episodeId));
  return episode[0];
};

const getSeriesDownloadStatus = async (seriesId) => {
  const episodes = await db.select().from(seriesEpisodes).where(eq(seriesEpisodes.seriesId, seriesId));

  const totalEpisodes = episodes.length;
  const downloadedCount = episodes.filter(e => e.autoDownloadStatus === AutoDownloadStatus.DOWNLOADED).length;
  const downloadingCount = episodes.filter(e => e.autoDownloadStatus === AutoDownloadStatus.DOWNLOADING).length;
  const pendingCount = episodes.filter(e => e.autoDownloadStatus === AutoDownloadStatus.PENDING).length;
  const failedCount = episodes.filter(e => e.autoDownloadStatus === AutoDownloadStatus.FAILED).length;
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
  const episodes = await db.select().from(seriesEpisodes).where(
    and(
      eq(seriesEpisodes.seriesId, seriesId),
      eq(seriesEpisodes.seasonNumber, seasonNumber)
    )
  );

  const totalEpisodes = episodes.length;
  const downloadedCount = episodes.filter(e => e.autoDownloadStatus === AutoDownloadStatus.DOWNLOADED).length;
  const downloadingCount = episodes.filter(e => e.autoDownloadStatus === AutoDownloadStatus.DOWNLOADING).length;
  const pendingCount = episodes.filter(e => e.autoDownloadStatus === AutoDownloadStatus.PENDING).length;
  const failedCount = episodes.filter(e => e.autoDownloadStatus === AutoDownloadStatus.FAILED).length;
  const enabledCount = episodes.filter(e => e.isAutoDownloadEnabled).length;

  return {
    totalEpisodes,
    downloadedCount,
    downloadingCount,
    pendingCount,
    failedCount,
    enabledCount,
    isEnabled: enabledCount > 0,
    aggregatedStatus: getAggregatedStatus(episodes)
  };
};

const getAggregatedStatus = (episodes) => {
  if (episodes.length === 0) return AutoDownloadStatus.DISABLED;

  const statusCounts = {};
  episodes.forEach(e => {
    const status = e.autoDownloadStatus || AutoDownloadStatus.DISABLED;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  if (statusCounts[AutoDownloadStatus.DOWNLOADING] > 0) {
    return AutoDownloadStatus.DOWNLOADING;
  } else if (statusCounts[AutoDownloadStatus.PENDING] > 0) {
    return AutoDownloadStatus.PENDING;
  } else if (statusCounts[AutoDownloadStatus.FAILED] > 0) {
    return AutoDownloadStatus.FAILED;
  } else if (statusCounts[AutoDownloadStatus.DOWNLOADED] === episodes.length) {
    return AutoDownloadStatus.DOWNLOADED;
  } else if (statusCounts[AutoDownloadStatus.SKIPPED] > 0) {
    return AutoDownloadStatus.SKIPPED;
  }

  return AutoDownloadStatus.DISABLED;
};

module.exports = {
  getStatus,
  getAllSeries,
  getSeriesById,
  searchSeries,
  refreshSeries,
  getEpisodesBySeries,
  getEpisodeById,
  toggleSeriesAutoDownload,
  toggleSeasonAutoDownload,
  toggleEpisodeAutoDownload,
  getSeriesDownloadStatus,
  getSeasonDownloadStatus
};