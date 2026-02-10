const qbittorrentService = require('../services/qbittorrentService');
const { db } = require('../db/db');
const { downloads } = require('../db/schema');
const { eq } = require('drizzle-orm');

const getStatus = async (req, res) => {
  try {
    const status = await qbittorrentService.getConnectionStatus();
    res.json(status);
  } catch (error) {
    console.error('Error checking qBittorrent status:', error);
    res.status(500).json({ error: 'Failed to check qBittorrent status' });
  }
};

const getDownloads = async (req, res) => {
  try {
    const downloads = await db.select().from(downloads).orderBy(downloads.createdAt);
    res.json(downloads);
  } catch (error) {
    console.error('Error fetching downloads:', error);
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
};

const addMagnet = async (req, res) => {
  try {
    const { magnet, category = 'autoanime', seriesId } = req.body;
    if (!magnet) {
      return res.status(400).json({ error: 'Magnet link is required' });
    }

    const result = await qbittorrentService.addMagnet(magnet, category);
    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    const hashMatch = magnet.match(/xt=urn:btih:([a-fA-F0-9]+)/);
    const torrentHash = hashMatch ? hashMatch[1].toUpperCase() : null;

    if (torrentHash) {
      const now = new Date();
      await db.insert(downloads).values({
        torrentHash,
        magnetLink: magnet,
        seriesEpisodeId: null, // Can be set later if linked to an episode
        rssItemId: null, // Can be set later if linked to RSS item
        category,
        status: 'DOWNLOADING',
        createdAt: now,
        updatedAt: now
      });
    }

    res.json({ success: true, message: 'Torrent added', hash: torrentHash });
  } catch (error) {
    console.error('Error adding magnet:', error);
    res.status(500).json({ error: 'Failed to add magnet' });
  }
};

const pauseTorrent = async (req, res) => {
  try {
    const { hash } = req.params;
    const result = await qbittorrentService.pauseTorrent(hash);
    if (result.success) {
      await db.update(downloads)
        .set({ status: 'paused', updatedAt: new Date() })
        .where(eq(downloads.torrentHash, hash));
    }
    res.json(result);
  } catch (error) {
    console.error('Error pausing torrent:', error);
    res.status(500).json({ error: 'Failed to pause torrent' });
  }
};

const resumeTorrent = async (req, res) => {
  try {
    const { hash } = req.params;
    const result = await qbittorrentService.resumeTorrent(hash);
    if (result.success) {
      await db.update(downloads)
        .set({ status: 'downloading', updatedAt: new Date() })
        .where(eq(downloads.torrentHash, hash));
    }
    res.json(result);
  } catch (error) {
    console.error('Error resuming torrent:', error);
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
    console.error('Error deleting torrent:', error);
    res.status(500).json({ error: 'Failed to delete torrent' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await qbittorrentService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const syncDownloads = async (req, res) => {
  try {
    const torrents = await qbittorrentService.getTorrents();
    const now = new Date();

    for (const torrent of torrents) {
      const hash = torrent.hash;
      const existing = await db.select().from(downloads).where(eq(downloads.torrentHash, hash)).limit(1);

      let status = 'downloading';
      if (torrent.state === 'pausedUP' || torrent.state === 'pausedDL') status = 'paused';
      if (torrent.state === 'completed' || torrent.state === 'uploading' || torrent.state === 'stalledUP') status = 'completed';
      if (torrent.state === 'error' || torrent.state === 'missingFiles') status = 'error';

      if (existing.length > 0) {
        await db.update(downloads)
          .set({
            name: torrent.name,
            status,
            size: torrent.size,
            progress: parseFloat((torrent.progress * 100).toFixed(2)),
            savePath: torrent.save_path,
            updatedAt: now
          })
          .where(eq(downloads.id, existing[0].id));
      }
    }

    res.json({ success: true, message: `Synced ${torrents.length} torrents` });
  } catch (error) {
    console.error('Error syncing downloads:', error);
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
