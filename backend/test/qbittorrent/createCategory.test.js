const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

jest.mock('../../src/db/db', () => ({
  db: { select: jest.fn() },
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
    qbittorrent: { url: 'http://localhost:8080', username: 'admin', password: 'adminadmin' },
  }),
}));

jest.mock('../../src/socket', () => ({ getIO: jest.fn() }));

const qbittorrentService = require('../../src/services/qbittorrentService');

describe('createCategory - Integration Test', () => {
  const categoryName = 'autoanime';
  const basePath = '/downloads';
  const categorySavePath = `${basePath}/autoanime`;

  afterAll(async () => {
    // Clean up the test category
    const response = await fetch('http://localhost:8080/api/v2/torrents/removeCategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `categories=${encodeURIComponent(categoryName)}`,
    });
  });

  test('should create category "autoanime" and verify with correct name and save path', async () => {
    // Step 1: Create the category
    const createResult = await qbittorrentService.createCategory(categoryName, categorySavePath);
    expect(createResult.success).toBe(true);

    // Step 2: Get all categories via getCategories to verify
    const categories = await qbittorrentService.getCategories();

    // Step 3: Verify the category exists with correct name and save path
    expect(categories).toHaveProperty(categoryName);
    expect(categories[categoryName].name).toBe(categoryName);
    expect(categories[categoryName].savePath).toBe(categorySavePath);
  }, 30000);
});
