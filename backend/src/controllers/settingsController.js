const configService = require('../services/configService');

const getSettings = async (req, res) => {
  try {
    const settings = await configService.getAllSettings();
    const config = await configService.getConfig();
    
    res.json({
      success: true,
      settings,
      config: {
        sonarr: {
          url: config.sonarr.url,
          apiKey: configService.maskValue(config.sonarr.apiKey)
        },
        qbittorrent: {
          url: config.qbittorrent.url,
          username: config.qbittorrent.username,
          password: configService.maskValue(config.qbittorrent.password)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateSonarr = async (req, res) => {
  try {
    const { url, apiKey } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }
    
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid URL format' });
    }
    
    const urlResult = await configService.setSetting('sonarr_url', url, false);
    if (!urlResult.success) {
      return res.status(500).json({ success: false, error: urlResult.error });
    }
    
    if (apiKey) {
      const keyResult = await configService.setSetting('sonarr_api_key', apiKey, true);
      if (!keyResult.success) {
        return res.status(500).json({ success: false, error: keyResult.error });
      }
    }
    
    res.json({ success: true, message: 'Sonarr configuration saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateQbittorrent = async (req, res) => {
  try {
    const { url, username, password } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid URL format' });
    }

    const urlResult = await configService.setSetting('qbittorrent_url', url, false);
    if (!urlResult.success) {
      return res.status(500).json({ success: false, error: urlResult.error });
    }

    if (username) {
      const userResult = await configService.setSetting('qbittorrent_username', username, false);
      if (!userResult.success) {
        return res.status(500).json({ success: false, error: userResult.error });
      }
    }

    if (password) {
      const passResult = await configService.setSetting('qbittorrent_password', password, true);
      if (!passResult.success) {
        return res.status(500).json({ success: false, error: passResult.error });
      }
    }

    res.json({ success: true, message: 'qBittorrent configuration saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const testSonarr = async (req, res) => {
  try {
    const { url, apiKey } = req.body;
    
    if (!url || !apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL and API key are required' 
      });
    }
    
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid URL format',
        connected: false 
      });
    }
    
    const response = await fetch(`${url}/api/v3/system/status`, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return res.json({
        success: false,
        connected: false,
        error: `Sonarr API error: ${response.status}`,
        url
      });
    }
    
    const data = await response.json();
    
    res.json({
      success: true,
      connected: true,
      message: 'Connected to Sonarr',
      url,
      version: data.version
    });
  } catch (error) {
    res.json({
      success: false,
      connected: false,
      error: `Connection failed: ${error.message}`
    });
  }
};

const testQbittorrent = async (req, res) => {
  try {
    const { url, username, password } = req.body;
    
    if (!url || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL, username, and password are required' 
      });
    }
    
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid URL format',
        connected: false 
      });
    }
    
    const loginResponse = await fetch(`${url}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });
    
    if (!loginResponse.ok) {
      return res.json({
        success: false,
        connected: false,
        error: `Login failed: ${loginResponse.status}`,
        url
      });
    }
    
    const setCookie = loginResponse.headers.get('set-cookie');
    const cookie = setCookie ? setCookie.split(';')[0] : '';
    
    const versionResponse = await fetch(`${url}/api/v2/app/version`, {
      headers: { 'Cookie': cookie }
    });
    
    if (!versionResponse.ok) {
      return res.json({
        success: false,
        connected: false,
        error: `API error: ${versionResponse.status}`,
        url
      });
    }
    
    const version = await versionResponse.text();
    
    // Validate that response looks like a qBittorrent version, not HTML
    if (version.includes('<!DOCTYPE') || version.includes('<html') || version.length > 100) {
      return res.json({
        success: false,
        connected: false,
        error: 'Invalid response from qBittorrent API - received HTML instead of version',
        url
      });
    }
    
    res.json({
      success: true,
      connected: true,
      message: 'Connected to qBittorrent',
      url,
      version
    });
  } catch (error) {
    res.json({
      success: false,
      connected: false,
      error: `Connection failed: ${error.message}`
    });
  }
};

module.exports = {
  getSettings,
  updateSonarr,
  updateQbittorrent,
  testSonarr,
  testQbittorrent
};