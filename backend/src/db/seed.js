const { db } = require('./db');
const { downloadStatus, rssTemplate } = require('./schema');
const { eq } = require('drizzle-orm');
const { logger } = require('../utils/logger');

const seedDownloadStatuses = async () => {
  const statuses = [
    { id: 0, name: 'DISABLED', label: 'Disabled', description: 'Auto-download is disabled', sortOrder: 0 },
    { id: 1, name: 'PENDING', label: 'Pending', description: 'Waiting for download', sortOrder: 1 },
    { id: 2, name: 'DOWNLOADING', label: 'Downloading', description: 'Download in progress', sortOrder: 2 },
    { id: 3, name: 'DOWNLOADED', label: 'Downloaded', description: 'Download completed', sortOrder: 3 },
    { id: 4, name: 'FAILED', label: 'Failed', description: 'Download failed', sortOrder: 4 },
    { id: 5, name: 'SKIPPED', label: 'Skipped', description: 'Download skipped', sortOrder: 5 },
    { id: 6, name: 'PAUSED', label: 'Paused', description: 'Download is paused', sortOrder: 6 },
  ];

  for (const status of statuses) {
    const existing = await db.select().from(downloadStatus).where(eq(downloadStatus.id, status.id));
    if (existing.length === 0) {
      await db.insert(downloadStatus).values(status);
      logger.info({ status: status.name }, 'Created download status');
    }
  }
};

const seedRssTemplates = async () => {
  const templates = [
    { id: 0, name: 'CUSTOM', label: 'Custom', description: 'Custom parser', parser: 'custom' },
    { id: 1, name: 'DMHY', label: 'DMHY', description: 'DMHY (动漫花园) parser', parser: 'dmhy' },
  ];

  for (const template of templates) {
    const existing = await db.select().from(rssTemplate).where(eq(rssTemplate.id, template.id));
    if (existing.length === 0) {
      await db.insert(rssTemplate).values(template);
      logger.info({ template: template.name }, 'Created RSS template');
    }
  }
};

const seedReferenceTables = async () => {
  try {
    logger.info('Seeding reference tables...');
    await seedDownloadStatuses();
    await seedRssTemplates();
    logger.info('Reference tables seeded successfully');
  } catch (error) {
    logger.error({ error: error.message }, 'Error seeding reference tables');
    throw error;
  }
};

module.exports = { seedReferenceTables };
