const fetch = require('node-fetch');

const SONARR_URL = process.env.SONARR_URL || 'http://localhost:8989';
const SONARR_API_KEY = process.env.SONARR_API_KEY || '';
const SONARR_API_BASE = `${SONARR_URL}/api/v4`;

const headers = {
  'X-Api-Key': SONARR_API_KEY,
  'Content-Type': 'application/json'
};

const getStatus = async () => {
  try {
    const response = await fetch(`${SONARR_URL}/api/v3/system/status`, { headers });
    if (!response.ok) {
      return {
        connected: false,
        message: `Sonarr API error: ${response.status}`,
        url: SONARR_URL
      };
    }
    const data = await response.json();
    return {
      connected: true,
      message: 'Connected to Sonarr',
      url: SONARR_URL,
      version: data.version
    };
  } catch (error) {
    return {
      connected: false,
      message: `Connection failed: ${error.message}`,
      url: SONARR_URL
    };
  }
};

const getAllSeries = async () => {
  const response = await fetch(`${SONARR_API_BASE}/series`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const getSeriesById = async (id) => {
  const response = await fetch(`${SONARR_API_BASE}/series/${id}`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const searchSeries = async (term) => {
  const response = await fetch(`${SONARR_API_BASE}/series/lookup?term=${encodeURIComponent(term)}`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const refreshSeries = async (seriesId) => {
  const response = await fetch(`${SONARR_API_BASE}/command`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'RefreshSeries', seriesId })
  });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

module.exports = {
  getStatus,
  getAllSeries,
  getSeriesById,
  searchSeries,
  refreshSeries
};
