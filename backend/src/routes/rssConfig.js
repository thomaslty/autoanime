const express = require('express');
const router = express.Router();
const rssConfigController = require('../controllers/rssConfigController');

router.get('/', rssConfigController.getConfigs);
router.post('/preview', rssConfigController.previewConfig);
router.get('/preview/series/:seriesId', rssConfigController.getSeriesRssPreview);
router.post('/preview/series/:seriesId/apply', rssConfigController.applySeriesRssPreview);
router.post('/', rssConfigController.createConfig);
router.get('/:id', rssConfigController.getConfigById);
router.put('/:id', rssConfigController.updateConfig);
router.delete('/:id', rssConfigController.deleteConfig);

module.exports = router;
