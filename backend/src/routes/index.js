const express = require('express');
const router = express.Router();

const rssRoutes = require('./rss');
const rssConfigRoutes = require('./rssConfig');
const rssParserRoutes = require('./rssParser');
const sonarrRoutes = require('./sonarr');
const qbittorrentRoutes = require('./qbittorrent');
const settingsRoutes = require('./settings');

router.use('/rss', rssRoutes);
router.use('/rss-config', rssConfigRoutes);
router.use('/rss-parser', rssParserRoutes);
router.use('/sonarr', sonarrRoutes);
router.use('/qbittorrent', qbittorrentRoutes);
router.use('/settings', settingsRoutes);

router.get('/', (req, res) => {
  res.json({
    name: 'AutoAnime API',
    version: '1.0.0',
    endpoints: {
      rss: '/api/rss',
      sonarr: '/api/sonarr',
      qbittorrent: '/api/qbittorrent',
      settings: '/api/settings',
      health: '/health'
    }
  });
});

module.exports = router;
