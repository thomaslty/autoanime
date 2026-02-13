const express = require('express');
const router = express.Router();
const sonarrController = require('../controllers/sonarrController');
const rssConfigController = require('../controllers/rssConfigController');
const { getDownloadStatuses } = require('../controllers/referenceController');

router.get('/status', sonarrController.getStatus);
router.get('/reference/download-statuses', getDownloadStatuses);
router.get('/series', sonarrController.getSeries);
router.get('/series/:id', sonarrController.getSeriesById);
router.get('/series/:id/episodes', sonarrController.getSeriesEpisodes);
router.get('/series/:id/episodes/download-status', sonarrController.getEpisodeDownloadStatuses);
router.get('/series/:id/auto-download-status', sonarrController.getSeriesAutoDownloadStatus);
router.get('/sync/status', sonarrController.getSyncStatus);
router.post('/sync', sonarrController.syncSeries);
router.post('/series/:id/episodes/sync', sonarrController.syncSeriesEpisodes);
router.post('/series/:id/refresh', sonarrController.triggerRefresh);
router.patch('/series/:id/auto-download', sonarrController.toggleSeriesAutoDownload);
router.patch('/series/:seriesId/seasons/:seasonNumber/auto-download', sonarrController.toggleSeasonAutoDownload);
router.patch('/series/:seriesId/episodes/:episodeId/auto-download', sonarrController.toggleEpisodeAutoDownload);
router.post('/series/:id/rss-matches/reset', sonarrController.resetRssMatches);
router.put('/series/:id/rss-config', rssConfigController.assignToSeries);
router.put('/series/:id/seasons/:seasonNumber/rss-config', rssConfigController.assignToSeason);
router.put('/episodes/:episodeId/rss-item', sonarrController.updateEpisodeRssItem);
router.post('/episodes/:episodeId/download', sonarrController.downloadEpisode);
router.delete('/series/:id', sonarrController.deleteSeries);

module.exports = router;
