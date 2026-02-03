const { db } = require('../db/db');
const { rss, rssItem } = require('../db/schema');
const { eq, sql } = require('drizzle-orm');
const { getParser } = require('../rss_parsers');

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
      .where(eq(rssItem.guid, item.guid))
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

  await db.update(rss)
    .set({ lastFetchedAt: new Date(), updatedAt: new Date() })
    .where(eq(rss.id, rssId));

  return {
    success: true,
    message: `Found ${items.length} items, ${newItems.length} new`,
    newItems: newItems.length
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
  const result = await db.insert(rss).values({
    name: data.name,
    description: data.description || null,
    url: data.url,
    templateId: data.templateId || 0,
    isEnabled: data.isEnabled !== false,
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
  toggleRss
};
