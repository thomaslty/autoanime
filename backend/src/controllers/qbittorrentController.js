const qbittorrentService = require('../services/qbittorrentService');
const { db } = require('../db/db');
const { downloads, downloadStatus } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { logger } = require('../utils/logger');
const { getInfoHash } = require('../utils/magnetHelper');

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

const getStatus = async (req, res) => {
  try {
    const status = await qbittorrentService.getConnectionStatus();
    res.json(status);
  } catch (error) {
    logger.error({ error: error.message }, 'Error checking qBittorrent status');
    res.status(500).json({ error: 'Failed to check qBittorrent status' });
  }
};

const getDownloads = async (req, res) => {
  try {
    const downloads = await db.select().from(downloads).orderBy(downloads.createdAt);
    res.json(downloads);
  } catch (error) {
    logger.error({ error: error.message },'Error fetching downloads:', error);
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
};

const addMagnet = async (req, res) => {
  try {
    const { magnet } = req.body;
    if (!magnet) {
      return res.status(400).json({ error: 'Magnet link is required' });
    }

    // Get download status IDs
    const statusIds = await getDownloadStatusIds();

    const result = await qbittorrentService.addMagnet(magnet);
    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    const torrentHash = getInfoHash(magnet);

    if (torrentHash) {
      const now = new Date();
      await db.insert(downloads).values({
        torrentHash,
        magnetLink: magnet,
        seriesEpisodeId: null,
        rssItemId: null,
        category,
        downloadStatusId: statusIds['DOWNLOADING'],
        createdAt: now,
        updatedAt: now
      });
    }

    res.json({ success: true, message: 'Torrent added', hash: torrentHash });
  } catch (error) {
    logger.error({ error: error.message },'Error adding magnet:', error);
    res.status(500).json({ error: 'Failed to add magnet' });
  }
};

const pauseTorrent = async (req, res) => {
  try {
    const { hash } = req.params;
    const statusIds = await getDownloadStatusIds();
    const result = await qbittorrentService.pauseTorrent(hash);
    if (result.success) {
      await db.update(downloads)
        .set({ downloadStatusId: statusIds['PAUSED'], updatedAt: new Date() })
        .where(eq(downloads.torrentHash, hash));
    }
    res.json(result);
  } catch (error) {
    logger.error({ error: error.message },'Error pausing torrent:', error);
    res.status(500).json({ error: 'Failed to pause torrent' });
  }
};

const resumeTorrent = async (req, res) => {
  try {
    const { hash } = req.params;
    const statusIds = await getDownloadStatusIds();
    const result = await qbittorrentService.resumeTorrent(hash);
    if (result.success) {
      await db.update(downloads)
        .set({ downloadStatusId: statusIds['DOWNLOADING'], updatedAt: new Date() })
        .where(eq(downloads.torrentHash, hash));
    }
    res.json(result);
  } catch (error) {
    logger.error({ error: error.message },'Error resuming torrent:', error);
    res.status(500).json({ error: 'Failed to resume torrent' });
  }
};

const deleteTorrent = async (req, res) => {
  try {
    const { hash } = req.params;
    const { deleteFiles = false } = req.body;
    const result = await qbittorrentService.deleteTorrent(hash, deleteFiles);
    if (result.success) {
      await db.delete(downloads).where(eq(downloads.torrentHash, hash));
    }
    res.json(result);
  } catch (error) {
    logger.error({ error: error.message },'Error deleting torrent:', error);
    res.status(500).json({ error: 'Failed to delete torrent' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await qbittorrentService.getCategories();
    res.json(categories);
  } catch (error) {
    logger.error({ error: error.message },'Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const syncDownloads = async (req, res) => {
  try {
    const torrents = await qbittorrentService.getTorrents();
    const statusIds = await getDownloadStatusIds();
    const now = new Date();

    for (const torrent of torrents) {
      const hash = torrent.hash;
      const existing = await db.select().from(downloads).where(eq(downloads.torrentHash, hash)).limit(1);

      // Map qBittorrent state to download status ID
      let downloadStatusId = statusIds['DOWNLOADING'];
      if (torrent.state === 'pausedUP' || torrent.state === 'pausedDL') {
        downloadStatusId = statusIds['PAUSED'];
      } else if (torrent.state === 'completed' || torrent.state === 'uploading' || torrent.state === 'stalledUP') {
        downloadStatusId = statusIds['DOWNLOADED'];
      } else if (torrent.state === 'error' || torrent.state === 'missingFiles') {
        downloadStatusId = statusIds['FAILED'];
      }

      if (existing.length > 0) {
        await db.update(downloads)
          .set({
            name: torrent.name,
            downloadStatusId,
            size: torrent.size,
            progress: parseFloat((torrent.progress * 100).toFixed(2)),
            contentPath: torrent.content_path,
            savePath: torrent.save_path,
            updatedAt: now
          })
          .where(eq(downloads.id, existing[0].id));
      }
    }

    res.json({ success: true, message: `Synced ${torrents.length} torrents` });
  } catch (error) {
    logger.error({ error: error.message },'Error syncing downloads:', error);
    res.status(500).json({ error: 'Failed to sync downloads' });
  }
};

module.exports = {
  getStatus,
  getDownloads,
  addMagnet,
  pauseTorrent,
  resumeTorrent,
  deleteTorrent,
  getCategories,
  syncDownloads
};
