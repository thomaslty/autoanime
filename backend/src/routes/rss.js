const express = require('express');
const router = express.Router();
const rssController = require('../controllers/rssController');

// RSS feed routes
router.get('/', rssController.getAllFeeds);
router.get('/:id', rssController.getFeedById);
router.post('/', rssController.createFeed);
router.put('/:id', rssController.updateFeed);
router.delete('/:id', rssController.deleteFeed);

// Parse/refresh feed
router.post('/:id/refresh', rssController.refreshFeed);

module.exports = router;
