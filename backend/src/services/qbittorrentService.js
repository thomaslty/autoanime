const fetch = require('node-fetch');

const QBIT_URL = process.env.QBITTORRENT_URL || 'http://localhost:8080';
const QBIT_USER = process.env.QBITTORRENT_USERNAME || 'admin';
const QBIT_PASS = process.env.QBITTORRENT_PASSWORD || 'adminadmin';

const API_BASE = `${QBIT_URL}/api/v2`;

let cookie = null;

const getHeaders = () => ({
  'Content-Type': 'application/x-www-form-urlencoded',
  'Cookie': cookie || '',
  'Referer': QBIT_URL
});

const login = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(QBIT_USER)}&password=${encodeURIComponent(QBIT_PASS)}`
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      cookie = setCookie.split(';')[0];
    }

    return { success: true, message: 'Logged in successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const ensureLogin = async () => {
  if (!cookie) {
    const result = await login();
    if (!result.success) {
      throw new Error(result.message);
    }
  }
};

const getConnectionStatus = async () => {
  try {
    await ensureLogin();
    const response = await fetch(`${API_BASE}/app/version`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      return { connected: false, message: `API error: ${response.status}` };
    }

    const version = await response.text();
    return {
      connected: true,
      message: 'Connected to qBittorrent',
      version: version
    };
  } catch (error) {
    return { connected: false, message: `Connection failed: ${error.message}` };
  }
};

const addMagnet = async (magnet, category = 'autoanime') => {
  try {
    await ensureLogin();

    const formData = new URLSearchParams();
    formData.append('urls', magnet);
    formData.append('category', category);

    const response = await fetch(`${API_BASE}/torrents/add`, {
      method: 'POST',
      headers: getHeaders(),
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
    const response = await fetch(`${API_BASE}/torrents/info`, {
      headers: getHeaders()
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
    const response = await fetch(`${API_BASE}/torrents/info?hashes=${hash}`, {
      headers: getHeaders()
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
    const response = await fetch(`${API_BASE}/torrents/pause`, {
      method: 'POST',
      headers: getHeaders(),
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
    const response = await fetch(`${API_BASE}/torrents/resume`, {
      method: 'POST',
      headers: getHeaders(),
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
    const response = await fetch(`${API_BASE}/torrents/delete`, {
      method: 'POST',
      headers: getHeaders(),
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
    const response = await fetch(`${API_BASE}/torrents/categories`, {
      headers: getHeaders()
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
    const response = await fetch(`${API_BASE}/torrents/addCategory`, {
      method: 'POST',
      headers: getHeaders(),
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
    const response = await fetch(`${API_BASE}/torrents/setLocation`, {
      method: 'POST',
      headers: getHeaders(),
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
    const response = await fetch(`${API_BASE}/torrents/renameFile`, {
      method: 'POST',
      headers: getHeaders(),
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
