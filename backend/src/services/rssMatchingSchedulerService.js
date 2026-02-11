const { db } = require('../db/db');
const { series, seriesSeasons, rssConfig, rssItem, seriesEpisodes } = require('../db/schema');
const { eq, and, isNull, isNotNull } = require('drizzle-orm');
const { logger } = require('../utils/logger');
const { convertCustomRegexToStandard, extractEpisodeNumber, calculateActualEpisode } = require('../utils/regexHelper');

let schedulerInterval = null;

/**
 * Scan all series/seasons with rss_config_id, match RSS items to episodes,
 * and update rss_item_id in series_episodes table.
 * Independently callable by other components.
 */
const matchAllRssItems = async () => {
  try {
    // Find all series with an RSS config assigned
    const seriesList = await db.select({
      id: series.id,
      title: series.title,
      rssConfigId: series.rssConfigId,
      configRegex: rssConfig.regex,
      configOffset: rssConfig.offset,
      rssSourceId: rssConfig.rssSourceId,
    })
      .from(series)
      .innerJoin(rssConfig, eq(series.rssConfigId, rssConfig.id))
      .where(eq(rssConfig.isEnabled, true));

    // Find all seasons with a season-level RSS config override
    const seasonsList = await db.select({
      id: seriesSeasons.id,
      seriesId: seriesSeasons.seriesId,
      seasonNumber: seriesSeasons.seasonNumber,
      rssConfigId: seriesSeasons.rssConfigId,
      configRegex: rssConfig.regex,
      configOffset: rssConfig.offset,
      rssSourceId: rssConfig.rssSourceId,
    })
      .from(seriesSeasons)
      .innerJoin(rssConfig, eq(seriesSeasons.rssConfigId, rssConfig.id))
      .where(eq(rssConfig.isEnabled, true));

    // Build a set of series IDs that have season-level overrides (to skip series-level for those seasons)
    const seasonOverrideMap = new Map();
    for (const season of seasonsList) {
      if (!seasonOverrideMap.has(season.seriesId)) {
        seasonOverrideMap.set(season.seriesId, new Set());
      }
      seasonOverrideMap.get(season.seriesId).add(season.seasonNumber);
    }

    let matchedCount = 0;

    // Process series-level configs
    for (const s of seriesList) {
      const pattern = convertCustomRegexToStandard(s.configRegex);
      if (!pattern) continue;

      // Get all RSS items from this config's RSS source
      const items = await db.select()
        .from(rssItem)
        .where(eq(rssItem.rssId, s.rssSourceId));

      // Get unmatched episodes for this series
      const episodes = await db.select({
        id: seriesEpisodes.id,
        episodeNumber: seriesEpisodes.episodeNumber,
        seasonNumber: seriesEpisodes.seasonNumber,
      })
        .from(seriesEpisodes)
        .where(and(
          eq(seriesEpisodes.seriesId, s.id),
          isNull(seriesEpisodes.rssItemId)
        ));

      const overriddenSeasons = seasonOverrideMap.get(s.id) || new Set();

      for (const item of items) {
        if (!item.title || !item.magnetLink) continue;
        if (!pattern.test(item.title)) continue;

        const rssEpisodeNumber = extractEpisodeNumber(item.title);
        if (rssEpisodeNumber === null) continue;

        const actualEpisodeNumber = calculateActualEpisode(rssEpisodeNumber, s.configOffset);

        // Find matching episode (skip seasons that have their own override)
        const matchingEp = episodes.find(ep =>
          ep.episodeNumber === actualEpisodeNumber &&
          !overriddenSeasons.has(ep.seasonNumber)
        );

        if (matchingEp) {
          await db.update(seriesEpisodes)
            .set({ rssItemId: item.id, updatedAt: new Date() })
            .where(eq(seriesEpisodes.id, matchingEp.id));

          // Remove from unmatched list so we don't match it again
          const idx = episodes.indexOf(matchingEp);
          if (idx > -1) episodes.splice(idx, 1);

          matchedCount++;
          logger.debug({ series: s.title, episode: actualEpisodeNumber, rssItem: item.title }, 'RSS item matched to episode');
        }
      }
    }

    // Process season-level configs
    for (const season of seasonsList) {
      const pattern = convertCustomRegexToStandard(season.configRegex);
      if (!pattern) continue;

      const items = await db.select()
        .from(rssItem)
        .where(eq(rssItem.rssId, season.rssSourceId));

      const episodes = await db.select({
        id: seriesEpisodes.id,
        episodeNumber: seriesEpisodes.episodeNumber,
        seasonNumber: seriesEpisodes.seasonNumber,
      })
        .from(seriesEpisodes)
        .where(and(
          eq(seriesEpisodes.seriesId, season.seriesId),
          eq(seriesEpisodes.seasonNumber, season.seasonNumber),
          isNull(seriesEpisodes.rssItemId)
        ));

      for (const item of items) {
        if (!item.title || !item.magnetLink) continue;
        if (!pattern.test(item.title)) continue;

        const rssEpisodeNumber = extractEpisodeNumber(item.title);
        if (rssEpisodeNumber === null) continue;

        const actualEpisodeNumber = calculateActualEpisode(rssEpisodeNumber, season.configOffset);

        const matchingEp = episodes.find(ep => ep.episodeNumber === actualEpisodeNumber);

        if (matchingEp) {
          await db.update(seriesEpisodes)
            .set({ rssItemId: item.id, updatedAt: new Date() })
            .where(eq(seriesEpisodes.id, matchingEp.id));

          const idx = episodes.indexOf(matchingEp);
          if (idx > -1) episodes.splice(idx, 1);

          matchedCount++;
          logger.debug({ seriesId: season.seriesId, season: season.seasonNumber, episode: actualEpisodeNumber, rssItem: item.title }, 'RSS item matched to episode (season-level)');
        }
      }
    }

    if (matchedCount > 0) {
      logger.info({ matchedCount }, 'RSS matching complete');
    }
    return { matched: matchedCount };
  } catch (error) {
    logger.error({ error: error.message }, 'Error during RSS matching');
    return { matched: 0, error: error.message };
  }
};

const runScheduler = async () => {
  try {
    await matchAllRssItems();
  } catch (error) {
    logger.error({ error: error.message }, 'Error during RSS matching scheduler run');
  }
};

const startScheduler = () => {
  if (schedulerInterval) return;
  logger.info('RSS Matching Scheduler starting (checks every 60s)');
  schedulerInterval = setInterval(runScheduler, 60 * 1000);
};

const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.info('RSS Matching Scheduler stopped');
  }
};

module.exports = { startScheduler, stopScheduler, matchAllRssItems };
