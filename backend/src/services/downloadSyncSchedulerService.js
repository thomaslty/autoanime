const qbittorrentService = require('./qbittorrentService');
const { logger } = require('../utils/logger');

let downloadSyncInterval = null;

const runDownloadSync = async () => {
  try {
    const syncResult = await qbittorrentService.syncDownloadStatuses();
    if (syncResult.synced > 0) {
      logger.info({ synced: syncResult.synced }, 'Download statuses synced from qBittorrent');
    } else {
      logger.info('Download Sync tick — nothing to sync');
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to sync download statuses');
  }
};

const startDownloadSyncScheduler = () => {
  if (downloadSyncInterval) return;
  logger.info('Download Sync Scheduler starting (checks every 10s)');
  downloadSyncInterval = setInterval(runDownloadSync, 10 * 1000);
};

const stopDownloadSyncScheduler = () => {
  if (downloadSyncInterval) {
    clearInterval(downloadSyncInterval);
    downloadSyncInterval = null;
    logger.info('Download Sync Scheduler stopped');
  }
};

module.exports = { startDownloadSyncScheduler, stopDownloadSyncScheduler };
