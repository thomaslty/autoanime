const { fetchAndParseRss, getOverdueFeeds } = require('./rssService');
const { logger } = require('../utils/logger');

/**
 * Fetch and parse all overdue RSS feeds.
 * Independently callable by other components.
 */
const fetchAndParseAllRss = async () => {
  const overdueFeeds = await getOverdueFeeds();
  if (overdueFeeds.length === 0) {
    logger.info('RSS Fetch Scheduler tick — no overdue feeds');
    return { fetched: 0 };
  }

  logger.info({ feedCount: overdueFeeds.length }, 'Fetching overdue feeds');
  let fetched = 0;

  for (const feed of overdueFeeds) {
    try {
      const result = await fetchAndParseRss(feed.id);
      logger.info({ feedId: feed.id, feedName: feed.name, message: result.message }, 'Feed fetch result');
      if (result.success) fetched++;
    } catch (error) {
      logger.error({ feedId: feed.id, feedName: feed.name, error: error.message }, 'Failed to fetch feed');
    }
  }

  return { fetched };
};

module.exports = { fetchAndParseAllRss };
