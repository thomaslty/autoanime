const express = require('express');
const router = express.Router();
const rssController = require('../controllers/rssController');

router.get('/sources', rssController.getSources);
router.get('/sources/:id', rssController.getSourceById);
router.post('/sources', rssController.createSource);
router.put('/sources/:id', rssController.updateSource);
router.delete('/sources/:id', rssController.deleteSource);
router.post('/sources/:id/toggle', rssController.toggleSource);
router.post('/sources/:id/fetch', rssController.fetchSource);
router.post('/sources/fetch-all', rssController.fetchAllSources);

router.get('/anime-configs', rssController.getAnimeConfigs);
router.get('/anime-configs/:id', rssController.getAnimeConfigById);
router.post('/anime-configs', rssController.createAnimeConfig);
router.put('/anime-configs/:id', rssController.updateAnimeConfig);
router.delete('/anime-configs/:id', rssController.deleteAnimeConfig);
router.post('/anime-configs/:id/toggle', rssController.toggleAnimeConfig);

module.exports = router;
