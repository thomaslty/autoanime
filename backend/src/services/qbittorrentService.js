const configService = require('./configService');
const { db } = require('../db/db');
const { downloads, seriesEpisodes, downloadStatus } = require('../db/schema');
const { eq, inArray } = require('drizzle-orm');
const { logger } = require('../utils/logger');

let cookie = null;
let currentConfig = null;

const getQbitConfig = async () => {
  const config = await configService.getConfig();
  return config.qbittorrent;
};

const getApiBase = (url) => `${url}/api/v2`;

const getHeaders = (url) => ({
  'Content-Type': 'application/x-www-form-urlencoded',
  'Cookie': cookie || '',
  'Referer': url
});

const login = async () => {
  try {
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(config.username)}&password=${encodeURIComponent(config.password)}`
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      cookie = setCookie.split(';')[0];
    }

    currentConfig = { ...config };

    return { success: true, message: 'Logged in successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const ensureLogin = async () => {
  const config = await getQbitConfig();

  const configChanged = currentConfig &&
    (currentConfig.url !== config.url ||
      currentConfig.username !== config.username ||
      currentConfig.password !== config.password);

  if (!cookie || configChanged) {
    cookie = null;
    const result = await login();
    if (!result.success) {
      throw new Error(result.message);
    }
  }
};

const getConnectionStatus = async () => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/app/version`, {
      headers: getHeaders(config.url)
    });

    if (!response.ok) {
      return {
        connected: false,
        message: `API error: ${response.status}`,
        url: config.url
      };
    }

    const version = await response.text();

    // Validate that response looks like a qBittorrent version, not HTML
    if (version.includes('<!DOCTYPE') || version.includes('<html') || version.length > 100) {
      return {
        connected: false,
        message: 'Invalid response - received HTML instead of version. Check qBittorrent URL configuration.',
        url: config.url
      };
    }

    return {
      connected: true,
      message: 'Connected to qBittorrent',
      url: config.url,
      version: version
    };
  } catch (error) {
    const config = await getQbitConfig();
    return {
      connected: false,
      message: `Connection failed: ${error.message}`,
      url: config.url
    };
  }
};

const addMagnet = async (magnet, category = 'autoanime') => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const formData = new URLSearchParams();
    formData.append('urls', magnet);
    formData.append('category', category);

    const response = await fetch(`${apiBase}/torrents/add`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: formData
    });

    if (response.status === 200 || response.status === 415) {
      return { success: true, message: 'Torrent added successfully' };
    }

    throw new Error(`Failed to add torrent: ${response.status}`);
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getTorrents = async () => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/info`, {
      headers: getHeaders(config.url)
    });

    if (!response.ok) {
      throw new Error(`Failed to get torrents: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching torrents:', error);
    return [];
  }
};

const getTorrentByHash = async (hash) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/info?hashes=${hash}`, {
      headers: getHeaders(config.url)
    });

    if (!response.ok) {
      throw new Error(`Failed to get torrent: ${response.status}`);
    }

    const torrents = await response.json();
    return torrents.length > 0 ? torrents[0] : null;
  } catch (error) {
    console.error('Error fetching torrent:', error);
    return null;
  }
};

const pauseTorrent = async (hash) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/pause`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hashes=${hash}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const resumeTorrent = async (hash) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/resume`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hashes=${hash}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const deleteTorrent = async (hash, deleteFiles = false) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/delete`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hashes=${hash}&deleteFiles=${deleteFiles}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getCategories = async () => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/categories`, {
      headers: getHeaders(config.url)
    });

    if (!response.ok) {
      throw new Error(`Failed to get categories: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const createCategory = async (name, savePath) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/addCategory`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `category=${encodeURIComponent(name)}&savePath=${encodeURIComponent(savePath)}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const setTorrentLocation = async (hash, location) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/setLocation`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hashes=${hash}&location=${encodeURIComponent(location)}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const renameFile = async (hash, filePath, newName) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/renameFile`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hash=${hash}&oldPath=${encodeURIComponent(filePath)}&newPath=${encodeURIComponent(newName)}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Map qBittorrent torrent states to our internal status
 * @param {string} state - qBittorrent torrent state
 * @returns {string} - Internal status: PENDING, DOWNLOADING, DOWNLOADED, FAILED
 */
const mapQbitStateToStatus = (state) => {
  const downloadingStates = ['downloading', 'metaDL', 'forcedDL', 'stalledDL', 'checkingDL', 'checkingResumeData'];
  const completedStates = ['uploading', 'stalledUP', 'forcedUP', 'checkingUP', 'pausedUP'];
  const errorStates = ['error', 'missingFiles', 'unknown'];

  if (downloadingStates.includes(state)) return 'DOWNLOADING';
  if (completedStates.includes(state)) return 'DOWNLOADED';
  if (errorStates.includes(state)) return 'FAILED';
  return 'PENDING';
};

/**
 * Sync download statuses from qBittorrent to our database
 * Updates progress, status, and file paths for active downloads
 */
const syncDownloadStatuses = async () => {
  try {
    // Get status ID mapping from database
    const statusRows = await db.select().from(downloadStatus).where(eq(downloadStatus.isActive, true));
    const statusIdMap = {};
    for (const row of statusRows) {
      statusIdMap[row.name] = row.id;
    }

    // Get all downloads that are not in final states
    const pendingDownloads = await db.select()
      .from(downloads)
      .where(inArray(downloads.downloadStatusId, [statusIdMap['PENDING'], statusIdMap['DOWNLOADING']]));

    if (pendingDownloads.length === 0) {
      return { synced: 0 };
    }

    // Get torrent info from qBittorrent
    const torrents = await getTorrents();
    if (!torrents || torrents.length === 0) {
      logger.info('No torrents found in qBittorrent');
      return { synced: 0 };
    }

    // Create a map of torrent hash to torrent info
    const torrentMap = new Map(torrents.map(t => [t.hash.toLowerCase(), t]));

    let syncedCount = 0;
    const now = new Date();

    for (const download of pendingDownloads) {
      const torrent = torrentMap.get(download.torrentHash?.toLowerCase());

      if (!torrent) {
        // Torrent no longer exists in qBittorrent - might have been deleted
        // Keep status as is, or mark as FAILED if we want to be strict
        logger.warn({ downloadId: download.id, torrentHash: download.torrentHash }, 'Torrent not found in qBittorrent');
        continue;
      }

      const newStatusName = mapQbitStateToStatus(torrent.state);
      const newStatusId = statusIdMap[newStatusName];
      const progress = Math.round((torrent.progress || 0) * 100 * 100) / 100; // Round to 2 decimal places
      const filePath = torrent.content_path || torrent.save_path || null;

      // Only update if something changed
      if (download.downloadStatusId !== newStatusId ||
        download.progress !== progress ||
        download.filePath !== filePath) {

        await db.update(downloads)
          .set({
            downloadStatusId: newStatusId,
            progress: progress.toString(),
            filePath: filePath,
            size: torrent.size || download.size,
            updatedAt: now
          })
          .where(eq(downloads.id, download.id));

        // Update episode status when download state changes
        if (download.seriesEpisodeId && newStatusId) {
          const episodeUpdates = {
            downloadStatusId: newStatusId,
            updatedAt: now
          };

          // Additional fields based on status
          if (newStatusName === 'DOWNLOADED') {
            episodeUpdates.hasFile = true;
            episodeUpdates.downloadedAt = now;
          }

          await db.update(seriesEpisodes)
            .set(episodeUpdates)
            .where(eq(seriesEpisodes.id, download.seriesEpisodeId));
        }

        syncedCount++;
        logger.debug({
          downloadId: download.id,
          oldStatusId: download.downloadStatusId,
          newStatusId,
          progress
        }, 'Download status synced');
      }
    }

    logger.info({ syncedCount, total: pendingDownloads.length }, 'Download status sync complete');
    return { synced: syncedCount };
  } catch (error) {
    logger.error({ error: error.message }, 'Error syncing download statuses');
    return { synced: 0, error: error.message };
  }
};

module.exports = {
  getConnectionStatus,
  addMagnet,
  getTorrents,
  getTorrentByHash,
  pauseTorrent,
  resumeTorrent,
  deleteTorrent,
  getCategories,
  createCategory,
  setTorrentLocation,
  renameFile,
  login,
  syncDownloadStatuses,
  mapQbitStateToStatus
};