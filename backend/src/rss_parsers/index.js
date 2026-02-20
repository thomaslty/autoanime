const { RssTemplate } = require('../enums/rssTemplate');
const { BaseParser } = require('./baseParser');
const { DmhyParser } = require('./dmhyParser');
const { ConfigurableParser } = require('./configurableParser');
const { db } = require('../db/db');
const { rssParser } = require('../db/schema');
const { eq } = require('drizzle-orm');

const parsers = {
  [RssTemplate.DMHY]: DmhyParser,
};

const parserNames = {
  [RssTemplate.CUSTOM]: 'Custom',
  [RssTemplate.DMHY]: '動漫花園 (DMHY)',
};

// Simple cache: templateId -> { config, cachedAt }
const parserConfigCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

async function getParser(templateId) {
  // Check hardcoded parsers first
  const ParserClass = parsers[templateId];
  if (ParserClass) {
    return new ParserClass();
  }

  // Check cache for user-defined parsers
  const cached = parserConfigCache.get(templateId);
  if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS) {
    return new ConfigurableParser(cached.config);
  }

  // Query DB for user-defined parser
  try {
    const result = await db.select().from(rssParser)
      .where(eq(rssParser.rssTemplateId, templateId))
      .limit(1);

    if (result.length > 0) {
      const config = result[0];
      parserConfigCache.set(templateId, { config, cachedAt: Date.now() });
      return new ConfigurableParser(config);
    }
  } catch (error) {
    // If DB query fails, fall through to BaseParser
  }

  return new BaseParser();
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
  DmhyParser,
  ConfigurableParser
};
