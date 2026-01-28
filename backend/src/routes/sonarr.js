const express = require('express');
const router = express.Router();
const sonarrController = require('../controllers/sonarrController');

// Sonarr integration routes
router.get('/status', sonarrController.getStatus);
router.get('/series', sonarrController.getSeries);
router.post('/series', sonarrController.addSeries);

module.exports = router;
