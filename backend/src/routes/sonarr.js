const express = require('express');
const router = express.Router();
const sonarrController = require('../controllers/sonarrController');

router.get('/status', sonarrController.getStatus);
router.get('/series', sonarrController.getSeries);
router.get('/series/:id', sonarrController.getSeriesById);
router.get('/series/:id/episodes', sonarrController.getSeriesEpisodes);
router.get('/series/:id/auto-download-status', sonarrController.getSeriesAutoDownloadStatus);
router.post('/sync', sonarrController.syncSeries);
router.post('/series/:id/episodes/sync', sonarrController.syncSeriesEpisodes);
router.post('/series/:id/refresh', sonarrController.triggerRefresh);
router.patch('/series/:id/auto-download', sonarrController.toggleSeriesAutoDownload);
router.patch('/series/:seriesId/seasons/:seasonNumber/auto-download', sonarrController.toggleSeasonAutoDownload);
router.patch('/series/:seriesId/episodes/:episodeId/auto-download', sonarrController.toggleEpisodeAutoDownload);

module.exports = router;
