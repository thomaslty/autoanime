const fetch = require('node-fetch');
const { db } = require('../db/db');
const { rssSources, rssFeedItems } = require('../db/schema');
const { eq, sql } = require('drizzle-orm');

const parseRSS = (xml) => {
  const items = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i);
    const guidMatch = itemXml.match(/<guid[^>]*>(.*?)<\/guid>|<guid[^>]*>(.*?)<\/guid>/i);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);

    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || 'Untitled') : 'Untitled';
    const link = linkMatch ? linkMatch[1] : '';
    const guid = guidMatch ? (guidMatch[1] || guidMatch[2] || link) : link;
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();

    if (link) {
      items.push({ title, link, guid, pubDate });
    }
  }

  return items;
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
    return { success: true, items: parseRSS(xml) };
  } catch (error) {
    return { success: false, error: error.message, items: [] };
  }
};

const saveFeedItems = async (sourceId, items) => {
  const newItems = [];
  const now = new Date();

  for (const item of items) {
    const existing = await db.select()
      .from(rssFeedItems)
      .where(eq(rssFeedItems.link, item.link))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(rssFeedItems).values({
        rssSourceId: sourceId,
        title: item.title,
        link: item.link,
        guid: item.guid,
        pubDate: item.pubDate,
        isProcessed: false,
        createdAt: now
      });
      newItems.push(item);
    }
  }

  return newItems;
};

const fetchAndProcessSource = async (sourceId) => {
  const source = await db.select().from(rssSources).where(eq(rssSources.id, sourceId)).limit(1);

  if (source.length === 0) {
    return { success: false, message: 'Source not found' };
  }

  if (!source[0].isEnabled) {
    return { success: false, message: 'Source is disabled' };
  }

  const result = await fetchFeed(source[0].url);

  if (!result.success) {
    return { success: false, message: result.error };
  }

  const newItems = await saveFeedItems(sourceId, result.items);

  await db.update(rssSources)
    .set({ lastFetchedAt: new Date(), updatedAt: new Date() })
    .where(eq(rssSources.id, sourceId));

  return {
    success: true,
    message: `Found ${result.items.length} items, ${newItems.length} new`,
    newItems: newItems.length
  };
};

const fetchAllSources = async () => {
  const sources = await db.select().from(rssSources).where(eq(rssSources.isEnabled, true));
  const results = [];

  for (const source of sources) {
    const result = await fetchAndProcessSource(source.id);
    results.push({ sourceId: source.id, sourceName: source.name, ...result });
  }

  return results;
};

const getUnprocessedItems = async (limit = 50) => {
  return await db.select()
    .from(rssFeedItems)
    .where(eq(rssFeedItems.isProcessed, false))
    .orderBy(rssFeedItems.pubDate)
    .limit(limit);
};

const markAsProcessed = async (ids) => {
  if (!ids || ids.length === 0) return;

  await db.update(rssFeedItems)
    .set({ isProcessed: true, downloadedAt: new Date() })
    .where(sql`${rssFeedItems.id} IN (${ids.join(',')})`);
};

const getSources = async () => {
  return await db.select().from(rssSources).orderBy(rssSources.name);
};

const getSourceById = async (id) => {
  const result = await db.select().from(rssSources).where(eq(rssSources.id, id)).limit(1);
  return result[0] || null;
};

const createSource = async (data) => {
  const now = new Date();
  const result = await db.insert(rssSources).values({
    name: data.name,
    url: data.url,
    isEnabled: data.isEnabled !== false,
    createdAt: now,
    updatedAt: now
  }).returning();
  return result[0];
};

const updateSource = async (id, data) => {
  const now = new Date();
  const updateData = { updatedAt: now };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.url !== undefined) updateData.url = data.url;
  if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;

  const result = await db.update(rssSources)
    .set(updateData)
    .where(eq(rssSources.id, id))
    .returning();
  return result[0];
};

const deleteSource = async (id) => {
  await db.delete(rssFeedItems).where(eq(rssFeedItems.rssSourceId, id));
  await db.delete(rssSources).where(eq(rssSources.id, id));
  return { success: true };
};

const toggleSource = async (id) => {
  const source = await getSourceById(id);
  if (!source) return null;

  return await updateSource(id, { isEnabled: !source.isEnabled });
};

module.exports = {
  fetchFeed,
  parseRSS,
  saveFeedItems,
  fetchAndProcessSource,
  fetchAllSources,
  getUnprocessedItems,
  markAsProcessed,
  getSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
  toggleSource
};
