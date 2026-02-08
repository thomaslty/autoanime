const express = require('express');
const router = express.Router();
const rssController = require('../controllers/rssController');

router.get('/', rssController.getRss);
router.get('/templates', rssController.getTemplates);
router.get('/sources', rssController.getRss);
router.get('/:id', rssController.getRssById);
router.get('/:id/items', rssController.getRssItems);
router.delete('/:id/items', rssController.clearRssItems);
router.put('/:id/items/:itemId', rssController.updateRssItem);
router.post('/:id/items/:itemId/download', rssController.downloadRssItem);
router.post('/', rssController.createRss);
router.put('/:id', rssController.updateRss);
router.delete('/:id', rssController.deleteRss);
router.post('/:id/toggle', rssController.toggleRss);
router.post('/:id/fetch', rssController.fetchRss);
router.post('/fetch-all', rssController.fetchAllRss);

module.exports = router;
