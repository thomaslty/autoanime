const rssService = require('../services/rssService');
const { db } = require('../db/db');
const { rssAnimeConfigs } = require('../db/schema');
const { eq } = require('drizzle-orm');

const getSources = async (req, res) => {
  try {
    const sources = await rssService.getSources();
    res.json(sources);
  } catch (error) {
    console.error('Error fetching RSS sources:', error);
    res.status(500).json({ error: 'Failed to fetch RSS sources' });
  }
};

const getSourceById = async (req, res) => {
  try {
    const source = await rssService.getSourceById(req.params.id);
    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }
    res.json(source);
  } catch (error) {
    console.error('Error fetching RSS source:', error);
    res.status(500).json({ error: 'Failed to fetch RSS source' });
  }
};

const createSource = async (req, res) => {
  try {
    const { name, url, isEnabled } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }
    const source = await rssService.createSource({ name, url, isEnabled });
    res.status(201).json(source);
  } catch (error) {
    console.error('Error creating RSS source:', error);
    res.status(500).json({ error: 'Failed to create RSS source' });
  }
};

const updateSource = async (req, res) => {
  try {
    const { name, url, isEnabled } = req.body;
    const source = await rssService.updateSource(req.params.id, { name, url, isEnabled });
    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }
    res.json(source);
  } catch (error) {
    console.error('Error updating RSS source:', error);
    res.status(500).json({ error: 'Failed to update RSS source' });
  }
};

const deleteSource = async (req, res) => {
  try {
    await rssService.deleteSource(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting RSS source:', error);
    res.status(500).json({ error: 'Failed to delete RSS source' });
  }
};

const toggleSource = async (req, res) => {
  try {
    const source = await rssService.toggleSource(req.params.id);
    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }
    res.json(source);
  } catch (error) {
    console.error('Error toggling RSS source:', error);
    res.status(500).json({ error: 'Failed to toggle RSS source' });
  }
};

const fetchSource = async (req, res) => {
  try {
    const result = await rssService.fetchAndProcessSource(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching RSS source:', error);
    res.status(500).json({ error: 'Failed to fetch RSS source' });
  }
};

const fetchAllSources = async (req, res) => {
  try {
    const results = await rssService.fetchAllSources();
    res.json(results);
  } catch (error) {
    console.error('Error fetching all RSS sources:', error);
    res.status(500).json({ error: 'Failed to fetch RSS sources' });
  }
};

const getAnimeConfigs = async (req, res) => {
  try {
    const configs = await db.select().from(rssAnimeConfigs).orderBy(rssAnimeConfigs.name);
    res.json(configs);
  } catch (error) {
    console.error('Error fetching RSS anime configs:', error);
    res.status(500).json({ error: 'Failed to fetch RSS anime configs' });
  }
};

const getAnimeConfigById = async (req, res) => {
  try {
    const config = await db.select().from(rssAnimeConfigs).where(eq(rssAnimeConfigs.id, req.params.id)).limit(1);
    if (config.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.json(config[0]);
  } catch (error) {
    console.error('Error fetching RSS anime config:', error);
    res.status(500).json({ error: 'Failed to fetch RSS anime config' });
  }
};

const createAnimeConfig = async (req, res) => {
  try {
    const { name, url, rssSourceId, sonarrSeriesId, isEnabled } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }
    const now = new Date();
    const result = await db.insert(rssAnimeConfigs).values({
      name,
      url,
      rssSourceId: rssSourceId || null,
      sonarrSeriesId: sonarrSeriesId || null,
      isEnabled: isEnabled !== false,
      createdAt: now,
      updatedAt: now
    }).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating RSS anime config:', error);
    res.status(500).json({ error: 'Failed to create RSS anime config' });
  }
};

const updateAnimeConfig = async (req, res) => {
  try {
    const { name, url, rssSourceId, sonarrSeriesId, isEnabled } = req.body;
    const now = new Date();
    const updateData = { updatedAt: now };
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (rssSourceId !== undefined) updateData.rssSourceId = rssSourceId;
    if (sonarrSeriesId !== undefined) updateData.sonarrSeriesId = sonarrSeriesId;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;

    const result = await db.update(rssAnimeConfigs)
      .set(updateData)
      .where(eq(rssAnimeConfigs.id, req.params.id))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating RSS anime config:', error);
    res.status(500).json({ error: 'Failed to update RSS anime config' });
  }
};

const deleteAnimeConfig = async (req, res) => {
  try {
    const result = await db.delete(rssAnimeConfigs).where(eq(rssAnimeConfigs.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting RSS anime config:', error);
    res.status(500).json({ error: 'Failed to delete RSS anime config' });
  }
};

const toggleAnimeConfig = async (req, res) => {
  try {
    const config = await db.select().from(rssAnimeConfigs).where(eq(rssAnimeConfigs.id, req.params.id)).limit(1);
    if (config.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    const now = new Date();
    await db.update(rssAnimeConfigs)
      .set({ isEnabled: !config[0].isEnabled, updatedAt: now })
      .where(eq(rssAnimeConfigs.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error toggling RSS anime config:', error);
    res.status(500).json({ error: 'Failed to toggle RSS anime config' });
  }
};

module.exports = {
  getSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
  toggleSource,
  fetchSource,
  fetchAllSources,
  getAnimeConfigs,
  getAnimeConfigById,
  createAnimeConfig,
  updateAnimeConfig,
  deleteAnimeConfig,
  toggleAnimeConfig
};
