const express = require('express');
const router = express.Router();
const sonarrController = require('../controllers/sonarrController');

router.get('/status', sonarrController.getStatus);
router.get('/series', sonarrController.getSeries);
router.get('/series/:id', sonarrController.getSeriesById);
router.get('/series/:id/episodes', sonarrController.getSeriesEpisodes);
router.post('/sync', sonarrController.syncSeries);
router.post('/series/:id/episodes/sync', sonarrController.syncSeriesEpisodes);
router.post('/series/:id/refresh', sonarrController.triggerRefresh);

module.exports = router;
