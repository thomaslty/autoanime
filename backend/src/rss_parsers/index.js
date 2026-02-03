const { RssTemplate } = require('../enums/rssTemplate');
const { BaseParser } = require('./baseParser');
const { DmhyParser } = require('./dmhyParser');

const parsers = {
  [RssTemplate.DMHY]: DmhyParser,
};

const parserNames = {
  [RssTemplate.CUSTOM]: 'Custom',
  [RssTemplate.DMHY]: '動漫花園 (DMHY)',
};

function getParser(templateId) {
  const ParserClass = parsers[templateId];
  if (!ParserClass) {
    return new BaseParser();
  }
  return new ParserClass();
}

function getTemplateName(templateId) {
  return parserNames[templateId] || 'Unknown';
}

function getAvailableTemplates() {
  return Object.entries(parserNames).map(([id, name]) => ({
    id: parseInt(id),
    name
  }));
}

module.exports = {
  getParser,
  getTemplateName,
  getAvailableTemplates,
  BaseParser,
  DmhyParser
};
