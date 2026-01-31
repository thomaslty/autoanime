const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getSettings);
router.put('/sonarr', settingsController.updateSonarr);
router.put('/qbittorrent', settingsController.updateQbittorrent);
router.post('/sonarr/test', settingsController.testSonarr);
router.post('/qbittorrent/test', settingsController.testQbittorrent);

module.exports = router;