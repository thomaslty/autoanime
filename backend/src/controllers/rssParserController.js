const rssParserService = require('../services/rssParserService');
const { logger } = require('../utils/logger');

const getParsers = async (req, res) => {
  try {
    const result = await rssParserService.getAllParsers();
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error fetching RSS parsers');
    res.status(500).json({ error: 'Failed to fetch RSS parsers' });
  }
};

const getParserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS parser not found' });
    const parser = await rssParserService.getParserById(id);
    if (!parser) return res.status(404).json({ error: 'RSS parser not found' });
    res.json(parser);
  } catch (error) {
    logger.error({ error }, 'Error fetching RSS parser');
    res.status(500).json({ error: 'Failed to fetch RSS parser' });
  }
};

const createParser = async (req, res) => {
  try {
    const { name, description, itemPath, fieldMappings, sampleUrl } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!itemPath) {
      return res.status(400).json({ error: 'itemPath is required' });
    }
    if (!fieldMappings || typeof fieldMappings !== 'object' || Array.isArray(fieldMappings)) {
      return res.status(400).json({ error: 'fieldMappings is required and must be an object' });
    }

    const result = await rssParserService.createParser({ name: name.trim(), description, itemPath, fieldMappings, sampleUrl });
    res.status(201).json(result);
  } catch (error) {
    logger.error({ error }, 'Error creating RSS parser');
    res.status(500).json({ error: 'Failed to create RSS parser' });
  }
};

const updateParser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS parser not found' });
    const result = await rssParserService.updateParser(id, req.body);
    if (!result) return res.status(404).json({ error: 'RSS parser not found' });
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error updating RSS parser');
    res.status(500).json({ error: 'Failed to update RSS parser' });
  }
};

const deleteParser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(404).json({ error: 'RSS parser not found' });
    await rssParserService.deleteParser(id);
    res.json({ success: true });
  } catch (error) {
    if (error.message && error.message.includes('Cannot delete')) {
      return res.status(409).json({ error: error.message });
    }
    logger.error({ error }, 'Error deleting RSS parser');
    res.status(500).json({ error: 'Failed to delete RSS parser' });
  }
};

const fetchXml = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }
    const result = await rssParserService.fetchAndParseXml(url);
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error fetching XML');
    res.status(500).json({ error: 'Failed to fetch XML' });
  }
};

const previewParser = async (req, res) => {
  try {
    const { url, itemPath, fieldMappings } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }
    if (!itemPath) {
      return res.status(400).json({ error: 'itemPath is required' });
    }
    if (!fieldMappings) {
      return res.status(400).json({ error: 'fieldMappings is required' });
    }
    const result = await rssParserService.previewParser(url, itemPath, fieldMappings);
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error previewing RSS parser');
    res.status(500).json({ error: 'Failed to preview RSS parser' });
  }
};

module.exports = {
  getParsers,
  getParserById,
  createParser,
  updateParser,
  deleteParser,
  fetchXml,
  previewParser,
};
