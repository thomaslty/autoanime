const { fetchAndParseRss, getOverdueFeeds } = require('./rssService');

let schedulerInterval = null;

const runScheduler = async () => {
  try {
    const overdueFeeds = await getOverdueFeeds();
    if (overdueFeeds.length === 0) return;

    console.log(`[RSS Scheduler] Fetching ${overdueFeeds.length} overdue feed(s)...`);
    for (const feed of overdueFeeds) {
      try {
        const result = await fetchAndParseRss(feed.id);
        console.log(`[RSS Scheduler] Feed #${feed.id} "${feed.name}": ${result.message}`);
      } catch (error) {
        console.error(`[RSS Scheduler] Failed to fetch feed #${feed.id} "${feed.name}":`, error.message);
      }
    }
  } catch (error) {
    console.error('[RSS Scheduler] Error during scheduled run:', error.message);
  }
};

const startScheduler = () => {
  if (schedulerInterval) return;
  console.log('[RSS Scheduler] Starting (checks every 60s)');
  schedulerInterval = setInterval(runScheduler, 60 * 1000);
};

const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[RSS Scheduler] Stopped');
  }
};

module.exports = { startScheduler, stopScheduler };
