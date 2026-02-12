const fs = require('fs');
const path = require('path');
const configService = require('./configService');
const sonarrService = require('./sonarrService');
const { db } = require('../db/db');
const { downloads, seriesEpisodes, series, downloadStatus } = require('../db/schema');
const { eq, inArray } = require('drizzle-orm');
const { logger } = require('../utils/logger');
const { getIO } = require('../socket');

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

let categoryEnsured = false;

const CATEGORY_NAME = 'autoanime';

/**
 * Get qBittorrent's default save path via API.
 */
const getDefaultSavePath = async () => {
  await ensureLogin();
  const config = await getQbitConfig();
  const apiBase = getApiBase(config.url);

  const response = await fetch(`${apiBase}/app/defaultSavePath`, {
    headers: getHeaders(config.url)
  });

  if (!response.ok) {
    throw new Error(`Failed to get default save path: ${response.status}`);
  }

  const savePath = await response.text();
  return savePath.trim();
};

/**
 * Ensure the download category exists in qBittorrent with the correct save path.
 * Checks if "autoanime" category exists, creates it if missing, or updates
 * the save path if it doesn't match the expected path (defaultSavePath/autoanime).
 * Called once before the first download.
 */
const ensureCategory = async () => {
  if (categoryEnsured) return;
  try {
    const defaultSavePath = await getDefaultSavePath();
    const expectedPath = path.join(defaultSavePath, CATEGORY_NAME);

    const categories = await getCategories();
    const existing = categories[CATEGORY_NAME];

    if (!existing) {
      await createCategory(CATEGORY_NAME, expectedPath);
      logger.info({ category: CATEGORY_NAME, savePath: expectedPath }, 'Created qBittorrent category');
    } else if (existing.savePath !== expectedPath) {
      await editCategory(CATEGORY_NAME, expectedPath);
      logger.info({ category: CATEGORY_NAME, oldPath: existing.savePath, newPath: expectedPath }, 'Updated qBittorrent category save path');
    }

    categoryEnsured = true;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to ensure qBittorrent category');
  }
};

const addMagnet = async (magnet) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    // Ensure category exists before first download
    await ensureCategory();

    const formData = new URLSearchParams();
    formData.append('urls', magnet);
    formData.append('category', CATEGORY_NAME);
    formData.append('autoTMM', true);

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
    logger.error({ error: error.message }, 'Error fetching torrents');
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
    logger.error({ error: error.message }, 'Error fetching torrent');
    return null;
  }
};

const pauseTorrent = async (hash) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/stop`, {
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

    const response = await fetch(`${apiBase}/torrents/start`, {
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
    logger.error({ error: error.message }, 'Error fetching categories');
    return [];
  }
};

const createCategory = async (name, savePath) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/createCategory`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `category=${encodeURIComponent(name)}&savePath=${encodeURIComponent(savePath)}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const editCategory = async (name, savePath) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const response = await fetch(`${apiBase}/torrents/editCategory`, {
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
/**
 * Copy downloaded file from qBittorrent download path to the anime media folder
 * and rename to S0XE0X format.
 */
const copyDownloadedFile = async (download, contentPath, rootPath) => {
  try {
    if (!download.seriesEpisodeId || !contentPath) return { success: false, message: 'No series episode ID or content path' };

    const mediaPath = process.env.MEDIA_PATH || '/media';
    const qbittorrentPath = process.env.QBITTORRENT_PATH || '/downloads';

    // Get episode and series info
    const episodeData = await db.select({
      episodeNumber: seriesEpisodes.episodeNumber,
      seasonNumber: seriesEpisodes.seasonNumber,
      seriesId: seriesEpisodes.seriesId,
    })
      .from(seriesEpisodes)
      .where(eq(seriesEpisodes.id, download.seriesEpisodeId))
      .limit(1);

    if (!episodeData[0]) return { success: false, message: 'No episode data' };

    const ep = episodeData[0];

    const seriesData = await db.select({ path: series.path })
      .from(series)
      .where(eq(series.id, ep.seriesId))
      .limit(1);

    if (!seriesData[0] || !seriesData[0].path) {
      logger.warn({ seriesId: ep.seriesId }, 'Series has no path, skipping file copy');
      return { success: false, message: 'Series has no path' };
    }

    // Construct the actual source path on our filesystem
    // contentPath/rootPath are from qBit's container — not the real disk location
    // We use QBITTORRENT_PATH + "autoanime" + basename to get the real location
    // rootPath non-empty = multi-file torrent (folder), empty = single file
    const basename = rootPath ? path.basename(rootPath) : path.basename(contentPath);
    const sourcePath = path.join(qbittorrentPath, 'autoanime', basename);

    // Resolve destination path
    const sonarrPath = seriesData[0].path;
    const seriesFolder = path.basename(sonarrPath);
    const seasonFolder = `Season ${String(ep.seasonNumber).padStart(2, '0')}`;
    const destDir = path.join(mediaPath, seriesFolder, seasonFolder);

    // Build the episode filename: S01E05.ext
    const sourceExt = path.extname(sourcePath);
    const episodeFilename = `S${String(ep.seasonNumber).padStart(2, '0')}E${String(ep.episodeNumber).padStart(2, '0')}${sourceExt}`;
    const destPath = path.join(destDir, episodeFilename);

    // Ensure destination directory exists
    await fs.promises.mkdir(destDir, { recursive: true });

    let actualSourcePath = sourcePath;

    // If source is a directory (multi-file torrent), find the largest file
    try {
      const stat = await fs.promises.stat(actualSourcePath);
      if (stat.isDirectory()) {
        const files = await fs.promises.readdir(actualSourcePath);
        const videoExts = ['.mkv', '.mp4', '.avi', '.wmv', '.flv', '.webm'];
        let largestFile = null;
        let largestSize = 0;
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (videoExts.includes(ext)) {
            const fileStat = await fs.promises.stat(path.join(actualSourcePath, file));
            if (fileStat.size > largestSize) {
              largestSize = fileStat.size;
              largestFile = file;
            }
          }
        }
        if (largestFile) {
          actualSourcePath = path.join(actualSourcePath, largestFile);
          // Update the extension based on the actual file
          const actualExt = path.extname(largestFile);
          const correctedFilename = `S${String(ep.seasonNumber).padStart(2, '0')}E${String(ep.episodeNumber).padStart(2, '0')}${actualExt}`;
          const correctedDestPath = path.join(destDir, correctedFilename);
          await fs.promises.copyFile(actualSourcePath, correctedDestPath);
          logger.info({ source: actualSourcePath, dest: correctedDestPath }, 'Copied downloaded file to media folder');
          return { success: true, message: 'Copied downloaded file to media folder' };
        }
      }
    } catch (statError) {
      logger.warn({ path: actualSourcePath, error: statError.message }, 'Cannot stat source path, skipping file copy');
      return { success: false, message: 'Cannot stat source path, skipping file copy' };
    }

    // Copy single file
    await fs.promises.copyFile(actualSourcePath, destPath);
    logger.info({ source: actualSourcePath, dest: destPath }, 'Copied downloaded file to media folder');
    return { success: true, message: 'Copied downloaded file to media folder' };
  } catch (error) {
    logger.error({ downloadId: download.id, error: error.message }, 'Error copying downloaded file');
    return { success: false, message: 'Error copying downloaded file' };
  }
};

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
    const torrentMap = new Map();
    if (torrents && torrents.length > 0) {
      for (const t of torrents) {
        torrentMap.set(t.hash.toLowerCase(), t);
      }
    }

    let syncedCount = 0;
    const now = new Date();
    // Collect updates per series for WebSocket emission
    const updatedBySeries = {};

    for (const download of pendingDownloads) {
      const torrent = torrentMap.get(download.torrentHash?.toLowerCase());

      if (!torrent) {
        // Torrent no longer exists in qBittorrent
        // If the download was not yet finished, clean up DB records
        logger.warn({ downloadId: download.id, torrentHash: download.torrentHash }, 'Torrent not found in qBittorrent, cleaning up');

        // Delete the download record
        await db.delete(downloads).where(eq(downloads.id, download.id));

        // Reset the episode download status (but keep the RSS match)
        if (download.seriesEpisodeId) {
          await db.update(seriesEpisodes)
            .set({
              downloadStatusId: null,
              downloadedAt: null,
              updatedAt: now
            })
            .where(eq(seriesEpisodes.id, download.seriesEpisodeId));
        }

        syncedCount++;
        continue;
      }

      const newStatusName = mapQbitStateToStatus(torrent.state);
      const newStatusId = statusIdMap[newStatusName];
      const progress = Math.round((torrent.progress || 0) * 10000) / 10000;
      const contentPath = torrent.content_path;
      const rootPath = torrent.root_path;

      // Only update if something changed
      if (download.downloadStatusId !== newStatusId ||
        download.progress !== progress ||
        download.contentPath !== contentPath) {

        await db.update(downloads)
          .set({
            downloadStatusId: newStatusId,
            progress: progress.toString(),
            contentPath: contentPath,
            rootPath: rootPath,
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

          if (newStatusName === 'DOWNLOADED') {
            episodeUpdates.hasFile = true;
            episodeUpdates.downloadedAt = now;

            // Copy file from qBit download path to media folder
            logger.info({ contentPath, rootPath: torrent.root_path }, 'Download complete, copying to media folder');
            const copyResult = await copyDownloadedFile(download, torrent.content_path, torrent.root_path);
            if (!copyResult.success) {
              logger.error({ downloadId: download.id, error: copyResult.message }, 'Error copying downloaded file');
            }

            // Notify Sonarr to rescan and rename after successful copy
            if (copyResult.success && download.seriesEpisodeId) {
              try {
                // Look up the Sonarr series ID from the episode
                const epRow = await db.select({ seriesId: seriesEpisodes.seriesId })
                  .from(seriesEpisodes)
                  .where(eq(seriesEpisodes.id, download.seriesEpisodeId))
                  .limit(1);

                if (epRow[0]) {
                  const seriesRow = await db.select({ sonarrId: series.sonarrId })
                    .from(series)
                    .where(eq(series.id, epRow[0].seriesId))
                    .limit(1);

                  if (seriesRow[0]) {
                    const sonarrId = seriesRow[0].sonarrId;
                    // 1. Trigger rescan (refresh) so Sonarr detects the new file
                    await sonarrService.refreshSeries(sonarrId);
                    logger.info({ sonarrId }, 'Triggered Sonarr series refresh');

                    // 1.5 wait for 10s before triggering rename
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    
                    // 2. Trigger rename so Sonarr renames episodes to its naming format
                    await sonarrService.renameSeries(sonarrId);
                    logger.info({ sonarrId }, 'Triggered Sonarr series rename');
                  }
                }
              } catch (sonarrError) {
                logger.error({ downloadId: download.id, error: sonarrError.message }, 'Error triggering Sonarr refresh/rename');
              }
            }
          }

          await db.update(seriesEpisodes)
            .set(episodeUpdates)
            .where(eq(seriesEpisodes.id, download.seriesEpisodeId));

          // Look up seriesId for this episode to scope the WebSocket event
          const episodeRow = await db.select({ seriesId: seriesEpisodes.seriesId })
            .from(seriesEpisodes)
            .where(eq(seriesEpisodes.id, download.seriesEpisodeId))
            .limit(1);

          if (episodeRow[0]) {
            const sid = episodeRow[0].seriesId;
            if (!updatedBySeries[sid]) updatedBySeries[sid] = [];
            updatedBySeries[sid].push({
              episodeId: download.seriesEpisodeId,
              downloadStatusId: newStatusId,
              downloadStatusName: newStatusName,
              progress,
              torrentHash: download.torrentHash,
            });
          }
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

    // Emit WebSocket events per affected series
    if (syncedCount > 0) {
      const io = getIO();
      if (io) {
        for (const [seriesId, episodes] of Object.entries(updatedBySeries)) {
          io.to(`series:${seriesId}`).emit('download:status-updated', {
            seriesId: Number(seriesId),
            episodes,
          });
          logger.debug({ seriesId, episodeCount: episodes.length }, 'Emitted download:status-updated');
        }
      }

      logger.info({ syncedCount, total: pendingDownloads.length }, 'Download status sync complete');
    }
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
  editCategory,
  ensureCategory,
  setTorrentLocation,
  renameFile,
  login,
  syncDownloadStatuses,
  mapQbitStateToStatus,
  copyDownloadedFile
};