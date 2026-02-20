const express = require('express');
const router = express.Router();
const rssParserController = require('../controllers/rssParserController');

router.get('/', rssParserController.getParsers);
router.post('/', rssParserController.createParser);
router.post('/fetch-xml', rssParserController.fetchXml);
router.post('/preview', rssParserController.previewParser);
router.get('/:id', rssParserController.getParserById);
router.put('/:id', rssParserController.updateParser);
router.delete('/:id', rssParserController.deleteParser);

module.exports = router;
