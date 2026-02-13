const qbittorrentService = require('./qbittorrentService');
const { checkServices } = require('./connectionMonitor');
const { logger } = require('../utils/logger');

const runDownloadSync = async () => {
  const { allAvailable, unavailable } = await checkServices(['database', 'qbittorrent']);
  if (!allAvailable) {
    logger.warn({ unavailable }, 'Skipping download-sync — required services unavailable');
    return;
  }

  const syncResult = await qbittorrentService.syncDownloadStatuses();
  if (syncResult.synced > 0) {
    logger.info({ synced: syncResult.synced }, 'Download statuses synced from qBittorrent');
  } else {
    logger.info('Download Sync tick — nothing to sync');
  }
};

module.exports = { runDownloadSync };
