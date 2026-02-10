const { db } = require('../db/db');
const { downloadStatus, rssTemplate } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { logger } = require('../utils/logger');

const getDownloadStatuses = async (req, res) => {
  try {
    const statuses = await db.select()
      .from(downloadStatus)
      .where(eq(downloadStatus.isActive, true))
      .orderBy(downloadStatus.sortOrder);
    
    res.json(statuses);
  } catch (error) {
    logger.error({ error }, 'Error fetching download statuses');
    res.status(500).json({ error: 'Failed to fetch download statuses' });
  }
};

const getRssTemplates = async (req, res) => {
  try {
    const templates = await db.select()
      .from(rssTemplate)
      .where(eq(rssTemplate.isActive, true))
      .orderBy(rssTemplate.name);
    
    res.json(templates);
  } catch (error) {
    logger.error({ error }, 'Error fetching RSS templates');
    res.status(500).json({ error: 'Failed to fetch RSS templates' });
  }
};

module.exports = {
  getDownloadStatuses,
  getRssTemplates
};
