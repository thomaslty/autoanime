// Sonarr API integration service
// TODO: Implement actual Sonarr API calls

const SONARR_URL = process.env.SONARR_URL || 'http://localhost:8989';
const SONARR_API_KEY = process.env.SONARR_API_KEY || '';

const getStatus = async () => {
  // TODO: Call Sonarr API /api/v3/system/status
  return {
    connected: false,
    message: 'Sonarr integration not configured',
    url: SONARR_URL
  };
};

const getSeries = async () => {
  // TODO: Call Sonarr API /api/v3/series
  return [];
};

const addSeries = async (seriesData) => {
  // TODO: Call Sonarr API POST /api/v3/series
  return { success: false, message: 'Not implemented' };
};

module.exports = {
  getStatus,
  getSeries,
  addSeries
};
