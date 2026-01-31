const configService = require('./configService');

let cookie = null;
let currentConfig = null;

const getQbitConfig = async () => {
  const config = await configService.getConfig();
  return config.qbittorrent;
};

const getApiBase = (url) => `${url}/api/v2`;

const getHeaders = (url) => ({
  'Content-Type': 'application/x-www-form-urlencoded',
  'Cookie': cookie || '',
  'Referer': url
});

const login = async () => {
  try {
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(config.username)}&password=${encodeURIComponent(config.password)}`
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      cookie = setCookie.split(';')[0];
    }
    
    currentConfig = { ...config };

    return { success: true, message: 'Logged in successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const ensureLogin = async () => {
  const config = await getQbitConfig();
  
  const configChanged = currentConfig && 
    (currentConfig.url !== config.url || 
     currentConfig.username !== config.username || 
     currentConfig.password !== config.password);
  
  if (!cookie || configChanged) {
    cookie = null;
    const result = await login();
    if (!result.success) {
      throw new Error(result.message);
    }
  }
};

const getConnectionStatus = async () => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/app/version`, {
      headers: getHeaders(config.url)
    });

    if (!response.ok) {
      return { 
        connected: false, 
        message: `API error: ${response.status}`,
        url: config.url
      };
    }

    const version = await response.text();
    
    // Validate that response looks like a qBittorrent version, not HTML
    if (version.includes('<!DOCTYPE') || version.includes('<html') || version.length > 100) {
      return { 
        connected: false, 
        message: 'Invalid response - received HTML instead of version. Check qBittorrent URL configuration.',
        url: config.url
      };
    }
    
    return {
      connected: true,
      message: 'Connected to qBittorrent',
      url: config.url,
      version: version
    };
  } catch (error) {
    const config = await getQbitConfig();
    return { 
      connected: false, 
      message: `Connection failed: ${error.message}`,
      url: config.url
    };
  }
};

const addMagnet = async (magnet, category = 'autoanime') => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);

    const formData = new URLSearchParams();
    formData.append('urls', magnet);
    formData.append('category', category);

    const response = await fetch(`${apiBase}/torrents/add`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: formData
    });

    if (response.status === 200 || response.status === 415) {
      return { success: true, message: 'Torrent added successfully' };
    }

    throw new Error(`Failed to add torrent: ${response.status}`);
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getTorrents = async () => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/torrents/info`, {
      headers: getHeaders(config.url)
    });

    if (!response.ok) {
      throw new Error(`Failed to get torrents: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching torrents:', error);
    return [];
  }
};

const getTorrentByHash = async (hash) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/torrents/info?hashes=${hash}`, {
      headers: getHeaders(config.url)
    });

    if (!response.ok) {
      throw new Error(`Failed to get torrent: ${response.status}`);
    }

    const torrents = await response.json();
    return torrents.length > 0 ? torrents[0] : null;
  } catch (error) {
    console.error('Error fetching torrent:', error);
    return null;
  }
};

const pauseTorrent = async (hash) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/torrents/pause`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hashes=${hash}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const resumeTorrent = async (hash) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/torrents/resume`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hashes=${hash}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const deleteTorrent = async (hash, deleteFiles = false) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/torrents/delete`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hashes=${hash}&deleteFiles=${deleteFiles}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getCategories = async () => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/torrents/categories`, {
      headers: getHeaders(config.url)
    });

    if (!response.ok) {
      throw new Error(`Failed to get categories: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const createCategory = async (name, savePath) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/torrents/addCategory`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `category=${encodeURIComponent(name)}&savePath=${encodeURIComponent(savePath)}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const setTorrentLocation = async (hash, location) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/torrents/setLocation`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hashes=${hash}&location=${encodeURIComponent(location)}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const renameFile = async (hash, filePath, newName) => {
  try {
    await ensureLogin();
    const config = await getQbitConfig();
    const apiBase = getApiBase(config.url);
    
    const response = await fetch(`${apiBase}/torrents/renameFile`, {
      method: 'POST',
      headers: getHeaders(config.url),
      body: `hash=${hash}&oldPath=${encodeURIComponent(filePath)}&newPath=${encodeURIComponent(newName)}`
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  getConnectionStatus,
  addMagnet,
  getTorrents,
  getTorrentByHash,
  pauseTorrent,
  resumeTorrent,
  deleteTorrent,
  getCategories,
  createCategory,
  setTorrentLocation,
  renameFile,
  login
};