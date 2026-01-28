const rssService = require('../services/rssService');

// Get all RSS feeds
const getAllFeeds = async (req, res) => {
  try {
    const feeds = await rssService.getAllFeeds();
    res.json(feeds);
  } catch (error) {
    console.error('Error fetching feeds:', error);
    res.status(500).json({ error: 'Failed to fetch feeds' });
  }
};

// Get feed by ID
const getFeedById = async (req, res) => {
  try {
    const feed = await rssService.getFeedById(req.params.id);
    if (!feed) {
      return res.status(404).json({ error: 'Feed not found' });
    }
    res.json(feed);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
};

// Create new RSS feed
const createFeed = async (req, res) => {
  try {
    const feed = await rssService.createFeed(req.body);
    res.status(201).json(feed);
  } catch (error) {
    console.error('Error creating feed:', error);
    res.status(500).json({ error: 'Failed to create feed' });
  }
};

// Update RSS feed
const updateFeed = async (req, res) => {
  try {
    const feed = await rssService.updateFeed(req.params.id, req.body);
    if (!feed) {
      return res.status(404).json({ error: 'Feed not found' });
    }
    res.json(feed);
  } catch (error) {
    console.error('Error updating feed:', error);
    res.status(500).json({ error: 'Failed to update feed' });
  }
};

// Delete RSS feed
const deleteFeed = async (req, res) => {
  try {
    const result = await rssService.deleteFeed(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Feed not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting feed:', error);
    res.status(500).json({ error: 'Failed to delete feed' });
  }
};

// Refresh/parse RSS feed
const refreshFeed = async (req, res) => {
  try {
    const result = await rssService.refreshFeed(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Feed not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error refreshing feed:', error);
    res.status(500).json({ error: 'Failed to refresh feed' });
  }
};

module.exports = {
  getAllFeeds,
  getFeedById,
  createFeed,
  updateFeed,
  deleteFeed,
  refreshFeed
};
