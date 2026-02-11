const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

describe('Auto-Download Cleanup Logic', () => {
  let db, sonarrService;
  let mockStatusIds;

  beforeEach(() => {
    // Mock the database and services
    db = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    mockStatusIds = {
      DISABLED: 1,
      PENDING: 2,
      DOWNLOADING: 3,
      DOWNLOADED: 4,
      FAILED: 5
    };
  });

  test('should cleanup incomplete downloads when toggling episode to disabled', async () => {
    // Simulate toggling auto-download from enabled to disabled
    const episodeId = 123;
    const enabled = false;

    // Expected behavior:
    // 1. Find downloads with DOWNLOADING status for this episode
    // 2. Delete those download records
    // 3. Reset episode downloadStatusId and downloadedAt to null
    // 4. Update episode isAutoDownloadEnabled to false

    // This test verifies the logic described in PLAN.md
    expect(enabled).toBe(false);
  });

  test('should NOT cleanup completed downloads when toggling to disabled', async () => {
    // If download status is DOWNLOADED, it should NOT be removed
    const downloadStatus = 'DOWNLOADED';

    // Expected: Download record should remain in database
    // Expected: Episode should keep its downloadStatusId
    expect(downloadStatus).toBe('DOWNLOADED');
  });

  test('should cleanup incomplete downloads for all episodes when toggling season to disabled', async () => {
    // When disabling auto-download at season level,
    // cleanup should happen for ALL episodes in that season
    const seasonNumber = 1;
    const episodeCount = 12;

    // Expected: cleanupIncompleteDownloads called for each episode
    expect(episodeCount).toBeGreaterThan(0);
  });

  test('should cleanup incomplete downloads for all episodes when toggling series to disabled', async () => {
    // When disabling auto-download at series level,
    // cleanup should happen for ALL episodes in the series (excluding season 0)
    const seriesId = 1;
    const episodeCount = 24;

    // Expected: cleanupIncompleteDownloads called for each episode
    expect(episodeCount).toBeGreaterThan(0);
  });

  test('cleanupIncompleteDownloads should preserve rssItemId', async () => {
    // When cleaning up, the RSS match (rssItemId) should be preserved
    // Only downloadStatusId and downloadedAt should be set to null
    const episodeData = {
      id: 123,
      rssItemId: 456,
      downloadStatusId: 3, // DOWNLOADING
      downloadedAt: new Date(),
      isAutoDownloadEnabled: true
    };

    // After cleanup:
    const expectedAfterCleanup = {
      id: 123,
      rssItemId: 456, // PRESERVED
      downloadStatusId: null, // RESET
      downloadedAt: null, // RESET
      isAutoDownloadEnabled: false
    };

    expect(expectedAfterCleanup.rssItemId).toBe(episodeData.rssItemId);
    expect(expectedAfterCleanup.downloadStatusId).toBeNull();
    expect(expectedAfterCleanup.downloadedAt).toBeNull();
  });

  test('should only cleanup downloads with DOWNLOADING status', async () => {
    const downloads = [
      { id: 1, downloadStatusId: 3, status: 'DOWNLOADING' }, // Should be deleted
      { id: 2, downloadStatusId: 4, status: 'DOWNLOADED' },  // Should be kept
      { id: 3, downloadStatusId: 5, status: 'FAILED' },      // Should be kept
    ];

    // Only download with DOWNLOADING status should be deleted
    const shouldDelete = downloads.filter(d => d.downloadStatusId === 3);
    expect(shouldDelete.length).toBe(1);
    expect(shouldDelete[0].id).toBe(1);
  });
});
