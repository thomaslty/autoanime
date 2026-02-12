const { describe, test, expect, beforeAll } = require('@jest/globals');

const SONARR_HOST = 'http://localhost:8989';
const SONARR_API_KEY = '0ed1b1a496bf424590beee33d9857ddb';

// Mock configService to provide real Sonarr credentials
jest.mock('../../src/services/configService', () => ({
  getConfig: jest.fn().mockResolvedValue({
    sonarr: { url: SONARR_HOST, apiKey: SONARR_API_KEY },
  }),
}));

jest.mock('../../src/db/db', () => ({
  db: { select: jest.fn() },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/socket', () => ({ getIO: jest.fn() }));

const sonarrService = require('../../src/services/sonarrService');

const headers = {
  'X-Api-Key': SONARR_API_KEY,
  'Content-Type': 'application/json',
};

describe('refreshSeries - Integration Test', () => {
  let testSeriesId;

  beforeAll(async () => {
    // Fetch the first available series from Sonarr to use as test target
    const response = await fetch(`${SONARR_HOST}/api/v3/series`, { headers });
    expect(response.ok).toBe(true);

    const seriesList = await response.json();
    expect(seriesList.length).toBeGreaterThan(0);
    testSeriesId = seriesList[0].id;
  });

  test('should trigger RefreshSeries command and return a queued command', async () => {
    const result = await sonarrService.refreshSeries(testSeriesId);

    // Sonarr returns a command resource with id, name, status
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name', 'RefreshSeries');
    expect(result).toHaveProperty('status');
    expect(['queued', 'started', 'completed']).toContain(result.status);
  }, 30000);

  test('should be able to check command status via GET /command/{id}', async () => {
    // Trigger refresh
    const cmd = await sonarrService.refreshSeries(testSeriesId);

    // Poll the command status
    const statusResponse = await fetch(`${SONARR_HOST}/api/v3/command/${cmd.id}`, { headers });
    expect(statusResponse.ok).toBe(true);

    const statusData = await statusResponse.json();
    expect(statusData).toHaveProperty('id', cmd.id);
    expect(['queued', 'started', 'completed']).toContain(statusData.status);
  }, 30000);
});
