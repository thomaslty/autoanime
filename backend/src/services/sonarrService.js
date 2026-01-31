const configService = require('./configService');

const getSonarrConfig = async () => {
  const config = await configService.getConfig();
  return config.sonarr;
};

const getStatus = async () => {
  try {
    const sonarrConfig = await getSonarrConfig();
    const headers = {
      'X-Api-Key': sonarrConfig.apiKey,
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(`${sonarrConfig.url}/api/v3/system/status`, { headers });
    if (!response.ok) {
      return {
        connected: false,
        message: `Sonarr API error: ${response.status}`,
        url: sonarrConfig.url
      };
    }
    const data = await response.json();
    return {
      connected: true,
      message: 'Connected to Sonarr',
      url: sonarrConfig.url,
      version: data.version
    };
  } catch (error) {
    return {
      connected: false,
      message: `Connection failed: ${error.message}`,
      url: (await getSonarrConfig()).url
    };
  }
};

const getAllSeries = async () => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;
  
  const response = await fetch(`${apiBase}/series`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const getSeriesById = async (id) => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;
  
  const response = await fetch(`${apiBase}/series/${id}`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const searchSeries = async (term) => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;
  
  const response = await fetch(`${apiBase}/series/lookup?term=${encodeURIComponent(term)}`, { headers });
  if (!response.ok) {
    throw new Error(`Sonarr API error: ${response.status}`);
  }
  return response.json();
};

const refreshSeries = async (seriesId) => {
  const sonarrConfig = await getSonarrConfig();
  const headers = {
    'X-Api-Key': sonarrConfig.apiKey,
    'Content-Type': 'application/json'
  };
  const apiBase = `${sonarrConfig.url}/api/v3`;
  
  const response = await fetch(`${apiBase}/command`, {
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