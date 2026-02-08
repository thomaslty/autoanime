const { db } = require('../db/db');
const { rssConfig, rss, rssItem, series, seriesSeasons } = require('../db/schema');
const { eq, and } = require('drizzle-orm');

const getAllConfigs = async () => {
  return await db.select().from(rssConfig).orderBy(rssConfig.name);
};

const getConfigById = async (id) => {
  const result = await db.select().from(rssConfig).where(eq(rssConfig.id, id)).limit(1);
  return result[0] || null;
};

const createConfig = async (data) => {
  const now = new Date();
  const result = await db.insert(rssConfig).values({
    name: data.name,
    description: data.description || null,
    regex: data.regex,
    rssSourceId: data.rssSourceId || null,
    isEnabled: data.isEnabled !== false,
    createdAt: now,
    updatedAt: now,
  }).returning();
  return result[0];
};

const updateConfig = async (id, data) => {
  const now = new Date();
  const updateData = { updatedAt: now };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.regex !== undefined) updateData.regex = data.regex;
  if (data.rssSourceId !== undefined) updateData.rssSourceId = data.rssSourceId;
  if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;

  const result = await db.update(rssConfig)
    .set(updateData)
    .where(eq(rssConfig.id, id))
    .returning();
  return result[0];
};

const deleteConfig = async (id) => {
  await db.delete(rssConfig).where(eq(rssConfig.id, id));
  return { success: true };
};

const previewConfig = async (rssSourceId, regex) => {
  let pattern;
  try {
    pattern = new RegExp(regex, 'i');
  } catch {
    return { success: false, message: 'Invalid regex pattern' };
  }

  const items = await db.select()
    .from(rssItem)
    .where(eq(rssItem.rssId, rssSourceId))
    .orderBy(rssItem.publishedDate)
    .limit(200);

  const matched = items.filter(item => item.title && pattern.test(item.title));
  return { success: true, matched, total: items.length };
};

const assignToSeries = async (seriesId, configId) => {
  const result = await db.update(series)
    .set({ rssConfigId: configId || null, updatedAt: new Date() })
    .where(eq(series.id, seriesId))
    .returning();
  return result[0];
};

const assignToSeason = async (seriesId, seasonNumber, configId) => {
  const result = await db.update(seriesSeasons)
    .set({ rssConfigId: configId || null, updatedAt: new Date() })
    .where(and(eq(seriesSeasons.seriesId, seriesId), eq(seriesSeasons.seasonNumber, seasonNumber)))
    .returning();
  return result[0];
};

module.exports = {
  getAllConfigs,
  getConfigById,
  createConfig,
  updateConfig,
  deleteConfig,
  previewConfig,
  assignToSeries,
  assignToSeason,
};
