const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const { logger } = require('../utils/logger');
const { fetchAndParseAllRss } = require('./rssFetchSchedulerService');
const { matchAllRssItems } = require('./rssMatchingSchedulerService');
const { triggerPendingDownloads } = require('./downloadSchedulerService');
const { runDownloadSync } = require('./downloadSyncSchedulerService');
const { checkAll } = require('./connectionMonitor');

const scheduler = new ToadScheduler();

/**
 * Create a scheduled job with overlap prevention and error handling.
 * @param {string} id - Unique job identifier
 * @param {number} seconds - Interval in seconds
 * @param {Function} taskFn - Async function to execute
 * @returns {SimpleIntervalJob}
 */
const createJob = (id, seconds, taskFn) => {
  const task = new AsyncTask(id, taskFn, (err) => {
    logger.error({ job: id, error: err.message }, 'Scheduler job error');
  });
  return new SimpleIntervalJob(
    { seconds, runImmediately: false },
    task,
    { id, preventOverrun: true }
  );
};

const startAll = () => {
  scheduler.addSimpleIntervalJob(createJob('health-check', 30, checkAll));
  scheduler.addSimpleIntervalJob(createJob('rss-fetch', 60, fetchAndParseAllRss));
  scheduler.addSimpleIntervalJob(createJob('rss-matching', 60, matchAllRssItems));
  scheduler.addSimpleIntervalJob(createJob('download-trigger', 60, triggerPendingDownloads));
  scheduler.addSimpleIntervalJob(createJob('download-sync', 10, runDownloadSync));
  logger.info('All schedulers started (toad-scheduler)');
};

const stopAll = () => {
  scheduler.stop();
  logger.info('All schedulers stopped');
};

module.exports = { startAll, stopAll, scheduler };
