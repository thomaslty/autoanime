const AutoDownloadStatus = {
  DISABLED: 0,
  PENDING: 1,
  DOWNLOADING: 2,
  DOWNLOADED: 3,
  FAILED: 4,
  SKIPPED: 5,

  getLabel: (status) => {
    switch (status) {
      case AutoDownloadStatus.DISABLED: return 'Disabled';
      case AutoDownloadStatus.PENDING: return 'Pending';
      case AutoDownloadStatus.DOWNLOADING: return 'Downloading';
      case AutoDownloadStatus.DOWNLOADED: return 'Downloaded';
      case AutoDownloadStatus.FAILED: return 'Failed';
      case AutoDownloadStatus.SKIPPED: return 'Skipped';
      default: return 'Unknown';
    }
  }
};

module.exports = AutoDownloadStatus;
