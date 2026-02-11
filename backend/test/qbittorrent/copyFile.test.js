const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Mock only non-filesystem dependencies
jest.mock('../../src/db/db', () => ({
  db: {
    select: jest.fn(),
  },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../src/services/configService', () => ({
  getConfig: jest.fn().mockResolvedValue({
    qbittorrent: { url: 'http://localhost:8080', username: 'admin', password: 'admin' },
  }),
}));
jest.mock('../../src/socket', () => ({ getIO: jest.fn() }));

const { db } = require('../../src/db/db');
const { copyDownloadedFile } = require('../../src/services/qbittorrentService');

// Test directories under the project
const TEST_DIR = path.join(__dirname, 'test_data');
const QBITTORRENT_PATH = path.join(TEST_DIR, 'downloads');
const MEDIA_PATH = path.join(TEST_DIR, 'media');

// Helper to set up the Drizzle chain mock: db.select().from().where().limit() → resolvedValue
const mockDbChain = (resolvedValue) => {
  const chain = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(resolvedValue),
  };
  db.select.mockReturnValueOnce(chain);
  return chain;
};

describe('copyDownloadedFile', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.MEDIA_PATH = MEDIA_PATH;
    process.env.QBITTORRENT_PATH = QBITTORRENT_PATH;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    // Clean up test data
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  test('should copy single video file with correct S01E01 format', async () => {
    const download = { id: 1, seriesEpisodeId: 100 };
    // Single file: rootPath is empty, contentPath has the file with extension
    const contentPath = '/downloads/autoanime/Episode_01.mp4';
    const rootPath = '';

    // Create source file on disk
    const sourceDir = path.join(QBITTORRENT_PATH, 'autoanime');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'Episode_01.mp4'), 'fake video content');

    mockDbChain([{ episodeNumber: 1, seasonNumber: 1, seriesId: 50 }]);
    mockDbChain([{ path: '/media/Frieren - Beyond Journey\'s End' }]);

    await copyDownloadedFile(download, contentPath, rootPath);

    // Verify the file was actually copied to the correct destination
    const destFile = path.join(MEDIA_PATH, 'Frieren - Beyond Journey\'s End', 'Season 01', 'S01E01.mp4');
    expect(fs.existsSync(destFile)).toBe(true);

    const content = fs.readFileSync(destFile, 'utf-8');
    expect(content).toBe('fake video content');
  });

  test('should copy largest video file from multi-file torrent folder', async () => {
    const download = { id: 2, seriesEpisodeId: 101 };
    // Multi-file: rootPath is populated (folder path), contentPath same as rootPath (no extension)
    const contentPath = '/downloads/incomplete/anime/[UHA-WINGS][Death March][1080p][BIG5]';
    const rootPath = '/downloads/incomplete/anime/[UHA-WINGS][Death March][1080p][BIG5]';

    // Create source folder with multiple files on disk
    const torrentFolder = path.join(QBITTORRENT_PATH, 'autoanime', '[UHA-WINGS][Death March][1080p][BIG5]');
    fs.mkdirSync(torrentFolder, { recursive: true });
    // Small video file
    fs.writeFileSync(path.join(torrentFolder, '[UHA-WINGS][Death March][NCOP][1080p][BIG5].mp4'), 'small opening');
    // Large video file — this should be picked
    fs.writeFileSync(path.join(torrentFolder, '[UHA-WINGS][Death March][01][1080p][BIG5].mkv'), 'A'.repeat(500));
    // Non-video files
    fs.writeFileSync(path.join(torrentFolder, 'readme.txt'), 'info');
    fs.writeFileSync(path.join(torrentFolder, 'subtitles.srt'), 'subs');

    mockDbChain([{ episodeNumber: 5, seasonNumber: 1, seriesId: 51 }]);
    mockDbChain([{ path: '/media/Death March kara Hajimaru Isekai Kyousoukyoku' }]);

    await copyDownloadedFile(download, contentPath, rootPath);

    // Verify the largest video file was copied with correct naming and extension
    const destFile = path.join(MEDIA_PATH, 'Death March kara Hajimaru Isekai Kyousoukyoku', 'Season 01', 'S01E05.mkv');
    expect(fs.existsSync(destFile)).toBe(true);

    const content = fs.readFileSync(destFile, 'utf-8');
    expect(content).toBe('A'.repeat(500));
  });
});
