const { db } = require('../db/db');
const { rssConfig, rss, rssItem, series, seriesSeasons, seriesEpisodes } = require('../db/schema');
const { eq, and, asc } = require('drizzle-orm');

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
    offset: data.offset !== undefined ? data.offset : null,
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
  if (data.offset !== undefined) updateData.offset = data.offset;
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

const getSeriesRssPreview = async (seriesId) => {
  // Get series info with its RSS config
  const seriesData = await db.select({
    id: series.id,
    title: series.title,
    rssConfigId: series.rssConfigId,
  })
    .from(series)
    .where(eq(series.id, seriesId))
    .limit(1);

  if (!seriesData[0]) {
    return { success: false, message: 'Series not found' };
  }

  // Get all episodes for the series
  const episodes = await db.select({
    id: seriesEpisodes.id,
    seasonNumber: seriesEpisodes.seasonNumber,
    episodeNumber: seriesEpisodes.episodeNumber,
    title: seriesEpisodes.title,
  })
    .from(seriesEpisodes)
    .where(eq(seriesEpisodes.seriesId, seriesId))
    .orderBy(asc(seriesEpisodes.seasonNumber), asc(seriesEpisodes.episodeNumber));

  // Get season-level RSS configs
  const seasonConfigs = await db.select({
    seasonNumber: seriesSeasons.seasonNumber,
    configId: seriesSeasons.rssConfigId,
    regex: rssConfig.regex,
    offset: rssConfig.offset,
    rssSourceId: rssConfig.rssSourceId,
  })
    .from(seriesSeasons)
    .leftJoin(rssConfig, eq(seriesSeasons.rssConfigId, rssConfig.id))
    .where(eq(seriesSeasons.seriesId, seriesId));

  // Get series-level RSS config if exists
  let seriesConfig = null;
  if (seriesData[0].rssConfigId) {
    const configData = await db.select({
      id: rssConfig.id,
      regex: rssConfig.regex,
      offset: rssConfig.offset,
      rssSourceId: rssConfig.rssSourceId,
    })
      .from(rssConfig)
      .where(eq(rssConfig.id, seriesData[0].rssConfigId))
      .limit(1);
    seriesConfig = configData[0] || null;
  }

  // Get all RSS items from the relevant RSS sources
  const rssSourceIds = new Set();
  if (seriesConfig?.rssSourceId) rssSourceIds.add(seriesConfig.rssSourceId);
  seasonConfigs.forEach(sc => { if (sc.rssSourceId) rssSourceIds.add(sc.rssSourceId); });

  let allRssItems = [];
  if (rssSourceIds.size > 0) {
    allRssItems = await db.select({
      id: rssItem.id,
      title: rssItem.title,
      link: rssItem.link,
      rssId: rssItem.rssId,
    })
      .from(rssItem)
      .where(and(...Array.from(rssSourceIds).map(id => eq(rssItem.rssId, id))));
  }

  // Match episodes to RSS items
  const previewData = episodes.map(episode => {
    // Determine which config to use (season-level overrides series-level)
    const seasonConfig = seasonConfigs.find(sc => sc.seasonNumber === episode.seasonNumber);
    const config = seasonConfig?.configId ? seasonConfig : seriesConfig;

    if (!config || !config.regex) {
      return {
        episodeId: episode.id,
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title,
        rssItemId: null,
        rssItemTitle: null,
        rssItemLink: null,
      };
    }

    let pattern;
    try {
      pattern = new RegExp(config.regex, 'i');
    } catch {
      return {
        episodeId: episode.id,
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title,
        rssItemId: null,
        rssItemTitle: 'Invalid regex pattern',
        rssItemLink: null,
      };
    }

    // Calculate effective episode number with offset
    const effectiveEpisodeNumber = config.offset ? episode.episodeNumber + config.offset : episode.episodeNumber;

    // Find matching RSS items
    const matchingItems = allRssItems.filter(item => {
      if (!item.title) return false;

      // Check if regex matches
      if (!pattern.test(item.title)) return false;

      // Extract episode number from title and check if it matches
      // Common patterns: E13, Episode 13, - 13, etc.
      const episodePatterns = [
        new RegExp(`E0?${effectiveEpisodeNumber}\\b`, 'i'),
        new RegExp(`Episode\\s+0?${effectiveEpisodeNumber}\\b`, 'i'),
        new RegExp(`\\b0?${effectiveEpisodeNumber}\\b`, 'i'),
      ];

      return episodePatterns.some(ep => ep.test(item.title));
    });

    // Use the first match (most recent based on RSS item order)
    const matchedItem = matchingItems[0];

    return {
      episodeId: episode.id,
      seasonNumber: episode.seasonNumber,
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.title,
      rssItemId: matchedItem?.id || null,
      rssItemTitle: matchedItem?.title || null,
      rssItemLink: matchedItem?.link || null,
    };
  });

  return { success: true, data: previewData };
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
  getSeriesRssPreview,
};
