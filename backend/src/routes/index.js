const express = require('express');
const router = express.Router();

// Import route modules
const rssRoutes = require('./rss');
const sonarrRoutes = require('./sonarr');

// Mount routes
router.use('/rss', rssRoutes);
router.use('/sonarr', sonarrRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'AutoAnime API',
    version: '1.0.0',
    endpoints: {
      rss: '/api/rss',
      sonarr: '/api/sonarr',
      health: '/health'
    }
  });
});

module.exports = router;
