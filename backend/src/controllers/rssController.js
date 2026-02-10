const rssService = require('../services/rssService');
const { getAvailableTemplates, getTemplateName } = require('../rss_parsers');
const { db } = require('../db/db');
const { rssTemplate } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { CronExpressionParser } = require('cron-parser');
const { logger } = require('../utils/logger');

const validateInterval = (type, interval) => {
  if (type === 'cron') {
    try {
      const parsed = CronExpressionParser.parseExpression(interval);
      // Enforce minimum 15-minute interval
      const next1 = parsed.next().toDate().getTime();
      const next2 = CronExpressionParser.parseExpression(interval).next().next().toDate().getTime();
      if (next2 - next1 < 15 * 60 * 1000) {
        return 'Cron interval must be at least 15 minutes';
      }
      return null;
    } catch {
      return 'Invalid cron expression';
    }
  }
  if (!rssService.ALLOWED_HUMAN_INTERVALS.includes(interval)) {
    return `Invalid interval. Allowed: ${rssService.ALLOWED_HUMAN_INTERVALS.join(', ')}`;
  }
  return null;
};

const getRss = async (req, res) => {
  try {
    const feeds = await rssService.getAllRss();
    res.json(feeds);
  } catch (error) {
    logger.error({ error }, 'Error fetching RSS feeds');
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
};

const getRssById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(404).json({ error: 'RSS feed not found' });
    }
    const feed = await rssService.getRssById(id);
    if (!feed) {
      return res.status(404).json({ error: 'RSS feed not found' });
    }
    res.json(feed);
  } catch (error) {
    logger.error({ error }, 'Error fetching RSS feed');
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
};

const createRss = async (req, res) => {
  try {
    const { name, description, url, templateId, isEnabled, refreshInterval, refreshIntervalType } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }
    const intervalType = refreshIntervalType || 'human';
    const interval = refreshInterval || '1h';
    const intervalError = validateInterval(intervalType, interval);
    if (intervalError) return res.status(400).json({ error: intervalError });

    const feed = await rssService.createRss({ name, description, url, templateId, isEnabled, refreshInterval: interval, refreshIntervalType: intervalType });
    res.status(201).json(feed);
  } catch (error) {
    logger.error({ error }, 'Error creating RSS feed');
    res.status(500).json({ error: 'Failed to create RSS feed' });
  }
};

const updateRss = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS feed not found' });
    const { name, description, url, templateId, isEnabled, refreshInterval, refreshIntervalType } = req.body;

    if (refreshInterval !== undefined || refreshIntervalType !== undefined) {
      const existing = await rssService.getRssById(id);
      const intervalType = refreshIntervalType ?? existing?.refreshIntervalType ?? 'human';
      const interval = refreshInterval ?? existing?.refreshInterval ?? '1h';
      const intervalError = validateInterval(intervalType, interval);
      if (intervalError) return res.status(400).json({ error: intervalError });
    }

    const feed = await rssService.updateRss(id, { name, description, url, templateId, isEnabled, refreshInterval, refreshIntervalType });
    if (!feed) {
      return res.status(404).json({ error: 'RSS feed not found' });
    }
    res.json(feed);
  } catch (error) {
    logger.error({ error }, 'Error updating RSS feed');
    res.status(500).json({ error: 'Failed to update RSS feed' });
  }
};

const deleteRss = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS feed not found' });
    await rssService.deleteRss(id);
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Error deleting RSS feed');
    res.status(500).json({ error: 'Failed to delete RSS feed' });
  }
};

const toggleRss = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS feed not found' });
    const feed = await rssService.toggleRss(id);
    if (!feed) {
      return res.status(404).json({ error: 'RSS feed not found' });
    }
    res.json(feed);
  } catch (error) {
    logger.error({ error }, 'Error toggling RSS feed');
    res.status(500).json({ error: 'Failed to toggle RSS feed' });
  }
};

const fetchRss = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS feed not found' });
    const result = await rssService.fetchAndParseRss(id);
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error fetching RSS feed');
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
};

const fetchAllRss = async (req, res) => {
  try {
    const results = await rssService.fetchAllRss();
    res.json(results);
  } catch (error) {
    logger.error({ error }, 'Error fetching all RSS feeds');
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
};

const getRssItems = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS feed not found' });
    const limit = parseInt(req.query.limit) || 100;
    const items = await rssService.getRssItems(id, limit);
    res.json(items);
  } catch (error) {
    logger.error({ error }, 'Error fetching RSS items');
    res.status(500).json({ error: 'Failed to fetch RSS items' });
  }
};

const clearRssItems = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS feed not found' });
    await rssService.clearRssItems(id);
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Error clearing RSS items');
    res.status(500).json({ error: 'Failed to clear RSS items' });
  }
};

const updateRssItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const itemId = parseInt(req.params.itemId, 10);
    if (isNaN(id) || isNaN(itemId)) return res.status(404).json({ error: 'RSS item not found' });
    const { title, description, link, magnetLink } = req.body;
    const item = await rssService.updateRssItem(id, itemId, { title, description, link, magnetLink });
    if (!item) {
      return res.status(404).json({ error: 'RSS item not found' });
    }
    res.json(item);
  } catch (error) {
    logger.error({ error }, 'Error updating RSS item');
    res.status(500).json({ error: 'Failed to update RSS item' });
  }
};

const downloadRssItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const itemId = parseInt(req.params.itemId, 10);
    if (isNaN(id) || isNaN(itemId)) return res.status(404).json({ error: 'RSS item not found' });
    const result = await rssService.downloadRssItem(id, itemId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error downloading RSS item');
    res.status(500).json({ error: 'Failed to download RSS item' });
  }
};

const getTemplates = async (req, res) => {
  try {
    // Fetch templates from database
    const templates = await db.select()
      .from(rssTemplate)
      .where(eq(rssTemplate.isActive, true))
      .orderBy(rssTemplate.name);
    
    // Map to format expected by frontend
    const mappedTemplates = templates.map(t => ({
      id: t.id,
      name: t.name,
      label: t.label,
      description: t.description,
      parser: t.parser
    }));
    
    res.json(mappedTemplates);
  } catch (error) {
    logger.error({ error }, 'Error fetching templates');
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

module.exports = {
  getRss,
  getRssById,
  createRss,
  updateRss,
  deleteRss,
  toggleRss,
  fetchRss,
  fetchAllRss,
  getRssItems,
  clearRssItems,
  updateRssItem,
  downloadRssItem,
  getTemplates
};
