const { db } = require('../db/db');
const { rss, rssItem, downloadStatus, downloads } = require('../db/schema');
const { eq, sql, lte, and } = require('drizzle-orm');
const { getParser } = require('../rss_parsers');
const { CronExpressionParser } = require('cron-parser');
const { getInfoHash } = require('../utils/magnetHelper');

const ALLOWED_HUMAN_INTERVALS = ['15m', '30m', '1h', '2h', '4h', '8h', '12h', '24h'];

// Cache for download status IDs
let downloadStatusCache = null;

const getDownloadStatusIds = async () => {
  if (downloadStatusCache) return downloadStatusCache;

  const statuses = await db.select().from(downloadStatus).where(eq(downloadStatus.isActive, true));
  downloadStatusCache = {};
  for (const status of statuses) {
    downloadStatusCache[status.name] = status.id;
  }
  return downloadStatusCache;
};

const parseHumanInterval = (interval) => {
  const match = interval.match(/^(\d+)(m|h)$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];
  return unit === 'm' ? value * 60 * 1000 : value * 60 * 60 * 1000;
};

const calculateNextFetchAt = (intervalType, interval) => {
  const now = new Date();
  if (intervalType === 'cron') {
    try {
      const parsed = CronExpressionParser.parseExpression(interval);
      return parsed.next().toDate();
    } catch {
      return null;
    }
  }
  const ms = parseHumanInterval(interval);
  if (!ms) return null;
  return new Date(now.getTime() + ms);
};

const fetchFeed = async (url) => {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AutoAnime RSS Parser/1.0' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const xml = await response.text();
    return { success: true, xml };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const saveRssItems = async (rssId, items) => {
  const newItems = [];
  const now = new Date();

  for (const item of items) {
    const existing = await db.select()
      .from(rssItem)
      .where(and(
        eq(rssItem.guid, item.guid),
        eq(rssItem.rssId, rssId)
      ))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(rssItem).values({
        rssId,
        guid: item.guid,
        title: item.title,
        description: item.description,
        link: item.link,
        publishedDate: item.publishedDate,
        magnetLink: item.magnetLink,
        author: item.author,
        category: item.category,
        createdAt: now
      });
      newItems.push(item);
    }
  }

  return newItems;
};

const fetchAndParseRss = async (rssId) => {
  const feed = await db.select().from(rss).where(eq(rss.id, rssId)).limit(1);

  if (feed.length === 0) {
    return { success: false, message: 'RSS feed not found' };
  }

  if (!feed[0].isEnabled) {
    return { success: false, message: 'RSS feed is disabled' };
  }

  const fetchResult = await fetchFeed(feed[0].url);

  if (!fetchResult.success) {
    return { success: false, message: fetchResult.error };
  }

  const parser = getParser(feed[0].templateId);
  const items = parser.parse(fetchResult.xml);

  const newItems = await saveRssItems(rssId, items);

  const nextFetchAt = calculateNextFetchAt(feed[0].refreshIntervalType, feed[0].refreshInterval);
  await db.update(rss)
    .set({ lastFetchedAt: new Date(), updatedAt: new Date(), nextFetchAt })
    .where(eq(rss.id, rssId));

  return {
    success: true,
    message: `Found ${items.length} items, ${newItems.length} new`,
    newItems: newItems.length,
    newItemsList: newItems
  };
};

const fetchAllRss = async () => {
  const feeds = await db.select().from(rss).where(eq(rss.isEnabled, true));
  const results = [];

  for (const feed of feeds) {
    const result = await fetchAndParseRss(feed.id);
    results.push({ rssId: feed.id, name: feed.name, ...result });
  }

  return results;
};

const getRssItems = async (rssId, limit = 100) => {
  return await db.select()
    .from(rssItem)
    .where(eq(rssItem.rssId, rssId))
    .orderBy(rssItem.publishedDate)
    .limit(limit);
};

const getUnprocessedItems = async (limit = 50) => {
  return await db.select()
    .from(rssItem)
    .orderBy(rssItem.publishedDate)
    .limit(limit);
};

const markAsProcessed = async (ids) => {
  if (!ids || ids.length === 0) return;
  await db.update(rssItem)
    .set({ downloadedAt: new Date() })
    .where(sql`${rssItem.id} IN (${ids.join(',')})`);
};

const getAllRss = async () => {
  return await db.select().from(rss).orderBy(rss.name);
};

const getRssById = async (id) => {
  const result = await db.select().from(rss).where(eq(rss.id, id)).limit(1);
  return result[0] || null;
};

const createRss = async (data) => {
  const now = new Date();
  const intervalType = data.refreshIntervalType || 'human';
  const interval = data.refreshInterval || '1h';
  const result = await db.insert(rss).values({
    name: data.name,
    description: data.description || null,
    url: data.url,
    templateId: data.templateId || 0,
    isEnabled: data.isEnabled !== false,
    refreshInterval: interval,
    refreshIntervalType: intervalType,
    nextFetchAt: calculateNextFetchAt(intervalType, interval),
    createdAt: now,
    updatedAt: now
  }).returning();
  return result[0];
};

const updateRss = async (id, data) => {
  const now = new Date();
  const updateData = { updatedAt: now };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.url !== undefined) updateData.url = data.url;
  if (data.templateId !== undefined) updateData.templateId = data.templateId;
  if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
  if (data.refreshInterval !== undefined) updateData.refreshInterval = data.refreshInterval;
  if (data.refreshIntervalType !== undefined) updateData.refreshIntervalType = data.refreshIntervalType;

  if (data.refreshInterval !== undefined || data.refreshIntervalType !== undefined) {
    const feed = await getRssById(id);
    const intervalType = data.refreshIntervalType ?? feed.refreshIntervalType;
    const interval = data.refreshInterval ?? feed.refreshInterval;
    updateData.nextFetchAt = calculateNextFetchAt(intervalType, interval);
  }

  const result = await db.update(rss)
    .set(updateData)
    .where(eq(rss.id, id))
    .returning();
  return result[0];
};

const deleteRss = async (id) => {
  await db.delete(rssItem).where(eq(rssItem.rssId, id));
  await db.delete(rss).where(eq(rss.id, id));
  return { success: true };
};

const toggleRss = async (id) => {
  const feed = await getRssById(id);
  if (!feed) return null;

  return await updateRss(id, { isEnabled: !feed.isEnabled });
};

const clearRssItems = async (id) => {
  await db.delete(rssItem).where(eq(rssItem.rssId, id));
  return { success: true };
};

const updateRssItem = async (feedId, itemId, data) => {
  const now = new Date();
  const updateData = { updatedAt: now };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.link !== undefined) updateData.link = data.link;
  if (data.magnetLink !== undefined) updateData.magnetLink = data.magnetLink;

  const result = await db.update(rssItem)
    .set(updateData)
    .where(eq(rssItem.id, itemId))
    .returning();
  return result[0];
};

const downloadRssItem = async (feedId, itemId) => {
  const items = await db.select().from(rssItem).where(eq(rssItem.id, itemId)).limit(1);
  if (items.length === 0) {
    return { success: false, message: 'RSS item not found' };
  }

  const item = items[0];
  if (!item.magnetLink) {
    return { success: false, message: 'No magnet link available for this item' };
  }

  // Get download status IDs
  const statusIds = await getDownloadStatusIds();

  const qbittorrentService = require('./qbittorrentService');
  const result = await qbittorrentService.addMagnet(item.magnetLink);

  if (result.success) {
    // Extract torrent hash from magnet link
    const torrentHash = getInfoHash(item.magnetLink);

    // Create download record
    if (torrentHash) {
      const now = new Date();
      await db.insert(downloads).values({
        torrentHash,
        magnetLink: item.magnetLink,
        seriesEpisodeId: null, // Manual download from RSS items page - not linked to an episode
        rssItemId: item.id,
        category: 'autoanime',
        downloadStatusId: statusIds['DOWNLOADING'],
        name: item.title,
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing();
    }
  }

  return result;
};

const getOverdueFeeds = async () => {
  const { and } = require('drizzle-orm');
  return await db.select()
    .from(rss)
    .where(and(eq(rss.isEnabled, true), lte(rss.nextFetchAt, new Date())));
};

module.exports = {
  fetchFeed,
  saveRssItems,
  fetchAndParseRss,
  fetchAllRss,
  getRssItems,
  getUnprocessedItems,
  markAsProcessed,
  getAllRss,
  getRssById,
  createRss,
  updateRss,
  deleteRss,
  toggleRss,
  clearRssItems,
  updateRssItem,
  downloadRssItem,
  getOverdueFeeds,
  calculateNextFetchAt,
  ALLOWED_HUMAN_INTERVALS
};
