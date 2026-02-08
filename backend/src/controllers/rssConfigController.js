const rssConfigService = require('../services/rssConfigService');
const { logger } = require('../utils/logger');

const getConfigs = async (req, res) => {
  try {
    const configs = await rssConfigService.getAllConfigs();
    res.json(configs);
  } catch (error) {
    logger.error({ error }, 'Error fetching RSS configs');
    res.status(500).json({ error: 'Failed to fetch RSS configs' });
  }
};

const getConfigById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS config not found' });
    const config = await rssConfigService.getConfigById(id);
    if (!config) return res.status(404).json({ error: 'RSS config not found' });
    res.json(config);
  } catch (error) {
    logger.error({ error }, 'Error fetching RSS config');
    res.status(500).json({ error: 'Failed to fetch RSS config' });
  }
};

const createConfig = async (req, res) => {
  try {
    const { name, description, regex, rssSourceId, offset, isEnabled } = req.body;
    if (!name || !regex) {
      return res.status(400).json({ error: 'Name and regex are required' });
    }
    try { new RegExp(regex); } catch {
      return res.status(400).json({ error: 'Invalid regex pattern' });
    }
    const config = await rssConfigService.createConfig({ name, description, regex, rssSourceId, offset, isEnabled });
    res.status(201).json(config);
  } catch (error) {
    logger.error({ error }, 'Error creating RSS config');
    res.status(500).json({ error: 'Failed to create RSS config' });
  }
};

const updateConfig = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS config not found' });
    const { name, description, regex, rssSourceId, offset, isEnabled } = req.body;
    if (regex !== undefined) {
      try { new RegExp(regex); } catch {
        return res.status(400).json({ error: 'Invalid regex pattern' });
      }
    }
    const config = await rssConfigService.updateConfig(id, { name, description, regex, rssSourceId, offset, isEnabled });
    if (!config) return res.status(404).json({ error: 'RSS config not found' });
    res.json(config);
  } catch (error) {
    logger.error({ error }, 'Error updating RSS config');
    res.status(500).json({ error: 'Failed to update RSS config' });
  }
};

const deleteConfig = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS config not found' });
    await rssConfigService.deleteConfig(id);
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Error deleting RSS config');
    res.status(500).json({ error: 'Failed to delete RSS config' });
  }
};

const previewConfig = async (req, res) => {
  try {
    const { rssSourceId, regex } = req.body;
    if (!rssSourceId || !regex) {
      return res.status(400).json({ error: 'rssSourceId and regex are required' });
    }
    const result = await rssConfigService.previewConfig(parseInt(rssSourceId, 10), regex);
    if (!result.success) return res.status(400).json({ error: result.message });
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error previewing RSS config');
    res.status(500).json({ error: 'Failed to preview RSS config' });
  }
};

const assignToSeries = async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id, 10);
    if (isNaN(seriesId)) return res.status(404).json({ error: 'Series not found' });
    const { rssConfigId } = req.body;
    const result = await rssConfigService.assignToSeries(seriesId, rssConfigId || null);
    if (!result) return res.status(404).json({ error: 'Series not found' });
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error assigning RSS config to series');
    res.status(500).json({ error: 'Failed to assign RSS config' });
  }
};

const assignToSeason = async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id, 10);
    const seasonNumber = parseInt(req.params.seasonNumber, 10);
    if (isNaN(seriesId) || isNaN(seasonNumber)) return res.status(404).json({ error: 'Season not found' });
    const { rssConfigId } = req.body;
    const result = await rssConfigService.assignToSeason(seriesId, seasonNumber, rssConfigId || null);
    if (!result) return res.status(404).json({ error: 'Season not found' });
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error assigning RSS config to season');
    res.status(500).json({ error: 'Failed to assign RSS config' });
  }
};

const getSeriesRssPreview = async (req, res) => {
  try {
    const seriesId = parseInt(req.params.seriesId, 10);
    if (isNaN(seriesId)) return res.status(404).json({ error: 'Series not found' });
    const result = await rssConfigService.getSeriesRssPreview(seriesId);
    if (!result.success) return res.status(400).json({ error: result.message });
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error getting series RSS preview');
    res.status(500).json({ error: 'Failed to get series RSS preview' });
  }
};

module.exports = {
  getConfigs,
  getConfigById,
  createConfig,
  updateConfig,
  deleteConfig,
  previewConfig,
  assignToSeries,
  assignToSeason,
  getSeriesRssPreview,
};
