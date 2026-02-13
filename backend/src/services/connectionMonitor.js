const { testConnection } = require('../db/db');
const sonarrService = require('./sonarrService');
const qbittorrentService = require('./qbittorrentService');
const { getIO } = require('../socket');
const { logger } = require('../utils/logger');

const CACHE_TTL_MS = 30000; // 30 seconds

// Cached connection states (full status objects)
const cache = {
  database: { connected: false, lastChecked: null },
  qbittorrent: { connected: false, lastChecked: null, message: '', version: null },
  sonarr: { connected: false, lastChecked: null, message: '', version: null },
};

// Previous states for transition logging + broadcast
const previousState = {
  database: null,
  qbittorrent: null,
  sonarr: null,
};

const isCacheValid = (serviceName) => {
  const entry = cache[serviceName];
  if (!entry.lastChecked) return false;
  return (Date.now() - entry.lastChecked.getTime()) < CACHE_TTL_MS;
};

const logTransition = (serviceName, wasConnected, isConnected) => {
  if (wasConnected === null) {
    if (!isConnected) {
      logger.warn({ service: serviceName }, `${serviceName} is not available`);
    }
  } else if (wasConnected && !isConnected) {
    logger.warn({ service: serviceName }, `${serviceName} connection lost`);
  } else if (!wasConnected && isConnected) {
    logger.info({ service: serviceName }, `${serviceName} reconnected`);
  }
};

/**
 * Broadcast current service status to all connected socket.io clients.
 */
const broadcastStatus = () => {
  const io = getIO();
  if (!io) return;
  io.emit('services:status', getStatus());
};

const updateCache = (serviceName, statusData) => {
  const prev = previousState[serviceName];
  const connected = statusData.connected;
  logTransition(serviceName, prev, connected);

  // Broadcast on state change
  if (prev !== null && prev !== connected) {
    // Defer broadcast to after cache is updated
    process.nextTick(broadcastStatus);
  }

  previousState[serviceName] = connected;
  cache[serviceName] = { ...statusData, lastChecked: new Date() };
  return connected;
};

const checkDatabase = async () => {
  if (isCacheValid('database')) return cache.database.connected;
  const connected = await testConnection();
  return updateCache('database', { connected });
};

const checkQbittorrent = async () => {
  if (isCacheValid('qbittorrent')) return cache.qbittorrent.connected;
  const status = await qbittorrentService.getConnectionStatus();
  return updateCache('qbittorrent', {
    connected: status.connected,
    message: status.message,
    version: status.version || null,
  });
};

const checkSonarr = async () => {
  if (isCacheValid('sonarr')) return cache.sonarr.connected;
  const status = await sonarrService.getStatus();
  return updateCache('sonarr', {
    connected: status.connected,
    message: status.message,
    version: status.version || null,
  });
};

/**
 * Check if a service is available (cached with 30s TTL).
 * @param {'database'|'qbittorrent'|'sonarr'} serviceName
 * @returns {Promise<boolean>}
 */
const isAvailable = async (serviceName) => {
  switch (serviceName) {
    case 'database': return checkDatabase();
    case 'qbittorrent': return checkQbittorrent();
    case 'sonarr': return checkSonarr();
    default:
      logger.warn({ service: serviceName }, 'Unknown service name in connection monitor');
      return false;
  }
};

/**
 * Check multiple services. Returns true only if ALL are available.
 * @param {string[]} serviceNames
 * @returns {Promise<{ allAvailable: boolean, unavailable: string[] }>}
 */
const checkServices = async (serviceNames) => {
  const unavailable = [];
  for (const name of serviceNames) {
    const available = await isAvailable(name);
    if (!available) unavailable.push(name);
  }
  return { allAvailable: unavailable.length === 0, unavailable };
};

/**
 * Check all services (forces fresh checks, ignoring cache).
 * Used by the health-check scheduler to periodically update state.
 */
const checkAll = async () => {
  // Invalidate all caches so checks are fresh
  for (const key of Object.keys(cache)) {
    cache[key].lastChecked = null;
  }
  await checkDatabase();
  await checkQbittorrent();
  await checkSonarr();
  return getStatus();
};

/**
 * Get the current cached status for all services (no re-check).
 * Shape matches the /health endpoint for frontend compatibility.
 */
const getStatus = () => ({
  database: cache.database.connected ? 'connected' : 'disconnected',
  sonarr: {
    connected: cache.sonarr.connected,
    message: cache.sonarr.message || '',
    version: cache.sonarr.version || null,
  },
  qbittorrent: {
    connected: cache.qbittorrent.connected,
    message: cache.qbittorrent.message || '',
    version: cache.qbittorrent.version || null,
  },
});

/**
 * Invalidate cache for a service, forcing a fresh check on next call.
 * @param {string} serviceName
 */
const invalidate = (serviceName) => {
  if (cache[serviceName]) {
    cache[serviceName].lastChecked = null;
  }
};

module.exports = { isAvailable, checkServices, checkAll, getStatus, invalidate };
