const rssService = require('../services/rssService');
const { getAvailableTemplates, getTemplateName } = require('../rss_parsers');

const getRss = async (req, res) => {
  try {
    const feeds = await rssService.getAllRss();
    res.json(feeds);
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
};

const getRssById = async (req, res) => {
  try {
    const feed = await rssService.getRssById(req.params.id);
    if (!feed) {
      return res.status(404).json({ error: 'RSS feed not found' });
    }
    res.json(feed);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
};

const createRss = async (req, res) => {
  try {
    const { name, description, url, templateId, isEnabled } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }
    const feed = await rssService.createRss({ name, description, url, templateId, isEnabled });
    res.status(201).json(feed);
  } catch (error) {
    console.error('Error creating RSS feed:', error);
    res.status(500).json({ error: 'Failed to create RSS feed' });
  }
};

const updateRss = async (req, res) => {
  try {
    const { name, description, url, templateId, isEnabled } = req.body;
    const feed = await rssService.updateRss(req.params.id, { name, description, url, templateId, isEnabled });
    if (!feed) {
      return res.status(404).json({ error: 'RSS feed not found' });
    }
    res.json(feed);
  } catch (error) {
    console.error('Error updating RSS feed:', error);
    res.status(500).json({ error: 'Failed to update RSS feed' });
  }
};

const deleteRss = async (req, res) => {
  try {
    await rssService.deleteRss(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting RSS feed:', error);
    res.status(500).json({ error: 'Failed to delete RSS feed' });
  }
};

const toggleRss = async (req, res) => {
  try {
    const feed = await rssService.toggleRss(req.params.id);
    if (!feed) {
      return res.status(404).json({ error: 'RSS feed not found' });
    }
    res.json(feed);
  } catch (error) {
    console.error('Error toggling RSS feed:', error);
    res.status(500).json({ error: 'Failed to toggle RSS feed' });
  }
};

const fetchRss = async (req, res) => {
  try {
    const result = await rssService.fetchAndParseRss(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
};

const fetchAllRss = async (req, res) => {
  try {
    const results = await rssService.fetchAllRss();
    res.json(results);
  } catch (error) {
    console.error('Error fetching all RSS feeds:', error);
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
};

const getRssItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const items = await rssService.getRssItems(req.params.id, limit);
    res.json(items);
  } catch (error) {
    console.error('Error fetching RSS items:', error);
    res.status(500).json({ error: 'Failed to fetch RSS items' });
  }
};

const clearRssItems = async (req, res) => {
  try {
    await rssService.clearRssItems(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing RSS items:', error);
    res.status(500).json({ error: 'Failed to clear RSS items' });
  }
};

const updateRssItem = async (req, res) => {
  try {
    const { title, description, link, magnetLink } = req.body;
    const item = await rssService.updateRssItem(req.params.id, req.params.itemId, { title, description, link, magnetLink });
    if (!item) {
      return res.status(404).json({ error: 'RSS item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error updating RSS item:', error);
    res.status(500).json({ error: 'Failed to update RSS item' });
  }
};

const downloadRssItem = async (req, res) => {
  try {
    const result = await rssService.downloadRssItem(req.params.id, req.params.itemId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result);
  } catch (error) {
    console.error('Error downloading RSS item:', error);
    res.status(500).json({ error: 'Failed to download RSS item' });
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = getAvailableTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
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
