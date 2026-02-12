const qbittorrentService = require('./qbittorrentService');
const { logger } = require('../utils/logger');

const runDownloadSync = async () => {
  const syncResult = await qbittorrentService.syncDownloadStatuses();
  if (syncResult.synced > 0) {
    logger.info({ synced: syncResult.synced }, 'Download statuses synced from qBittorrent');
  } else {
    logger.info('Download Sync tick — nothing to sync');
  }
};

module.exports = { runDownloadSync };
