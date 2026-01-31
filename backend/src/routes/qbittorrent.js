const express = require('express');
const router = express.Router();
const qbittorrentController = require('../controllers/qbittorrentController');

router.get('/status', qbittorrentController.getStatus);
router.get('/downloads', qbittorrentController.getDownloads);
router.post('/add', qbittorrentController.addMagnet);
router.post('/:hash/pause', qbittorrentController.pauseTorrent);
router.post('/:hash/resume', qbittorrentController.resumeTorrent);
router.delete('/:hash', qbittorrentController.deleteTorrent);
router.get('/categories', qbittorrentController.getCategories);
router.post('/sync', qbittorrentController.syncDownloads);

module.exports = router;
