const sonarrService = require('../services/sonarrService');

// Get Sonarr connection status
const getStatus = async (req, res) => {
  try {
    const status = await sonarrService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error checking Sonarr status:', error);
    res.status(500).json({ error: 'Failed to check Sonarr status' });
  }
};

// Get all series from Sonarr
const getSeries = async (req, res) => {
  try {
    const series = await sonarrService.getSeries();
    res.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
};

// Add series to Sonarr
const addSeries = async (req, res) => {
  try {
    const series = await sonarrService.addSeries(req.body);
    res.status(201).json(series);
  } catch (error) {
    console.error('Error adding series:', error);
    res.status(500).json({ error: 'Failed to add series' });
  }
};

module.exports = {
  getStatus,
  getSeries,
  addSeries
};
