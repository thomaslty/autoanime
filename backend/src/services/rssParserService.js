const { db } = require('../db/db');
const { rssParser, rssTemplate, rss } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { ConfigurableParser } = require('../rss_parsers/configurableParser');
const { logger } = require('../utils/logger');

const getAllParsers = async () => {
  const results = await db
    .select({
      id: rssParser.id,
      name: rssParser.name,
      description: rssParser.description,
      rssTemplateId: rssParser.rssTemplateId,
      itemPath: rssParser.itemPath,
      fieldMappings: rssParser.fieldMappings,
      sampleUrl: rssParser.sampleUrl,
      isActive: rssParser.isActive,
      createdAt: rssParser.createdAt,
      updatedAt: rssParser.updatedAt,
      templateName: rssTemplate.name,
      templateLabel: rssTemplate.label,
      templateIsActive: rssTemplate.isActive,
    })
    .from(rssParser)
    .leftJoin(rssTemplate, eq(rssParser.rssTemplateId, rssTemplate.id))
    .orderBy(rssParser.name);

  return results;
};

const getParserById = async (id) => {
  const results = await db
    .select({
      id: rssParser.id,
      name: rssParser.name,
      description: rssParser.description,
      rssTemplateId: rssParser.rssTemplateId,
      itemPath: rssParser.itemPath,
      fieldMappings: rssParser.fieldMappings,
      sampleUrl: rssParser.sampleUrl,
      isActive: rssParser.isActive,
      createdAt: rssParser.createdAt,
      updatedAt: rssParser.updatedAt,
      templateName: rssTemplate.name,
      templateLabel: rssTemplate.label,
      templateIsActive: rssTemplate.isActive,
    })
    .from(rssParser)
    .leftJoin(rssTemplate, eq(rssParser.rssTemplateId, rssTemplate.id))
    .where(eq(rssParser.id, id))
    .limit(1);

  return results[0] || null;
};

const createParser = async (data) => {
  return await db.transaction(async (tx) => {
    // Generate unique template name: CUSTOM_<UPPERCASE_UNDERSCORED_NAME>
    const generatedName = 'CUSTOM_' + data.name.toUpperCase().replace(/\s+/g, '_');

    const now = new Date();

    // Insert into rssTemplate first
    const templateResult = await tx
      .insert(rssTemplate)
      .values({
        name: generatedName,
        label: data.name,
        description: data.description || null,
        parser: 'configurable',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const template = templateResult[0];

    // Insert into rssParser
    const parserResult = await tx
      .insert(rssParser)
      .values({
        name: data.name,
        description: data.description || null,
        rssTemplateId: template.id,
        itemPath: data.itemPath,
        fieldMappings: data.fieldMappings,
        sampleUrl: data.sampleUrl || null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const parser = parserResult[0];

    logger.info({ parserId: parser.id, templateId: template.id, name: data.name }, 'RSS parser created');

    return { parser, template };
  });
};

const updateParser = async (id, data) => {
  const existing = await getParserById(id);
  if (!existing) return null;

  const now = new Date();
  const updateData = { updatedAt: now };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.itemPath !== undefined) updateData.itemPath = data.itemPath;
  if (data.fieldMappings !== undefined) updateData.fieldMappings = data.fieldMappings;
  if (data.sampleUrl !== undefined) updateData.sampleUrl = data.sampleUrl;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const parserResult = await db
    .update(rssParser)
    .set(updateData)
    .where(eq(rssParser.id, id))
    .returning();

  const updatedParser = parserResult[0];

  // Update rssTemplate label/description if name changed
  if (existing.rssTemplateId && (data.name !== undefined || data.description !== undefined)) {
    const templateUpdate = { updatedAt: now };
    if (data.name !== undefined) templateUpdate.label = data.name;
    if (data.description !== undefined) templateUpdate.description = data.description;

    await db
      .update(rssTemplate)
      .set(templateUpdate)
      .where(eq(rssTemplate.id, existing.rssTemplateId));
  }

  logger.info({ parserId: id }, 'RSS parser updated');

  return updatedParser;
};

const deleteParser = async (id) => {
  return await db.transaction(async (tx) => {
    // Get parser first
    const parserResult = await tx
      .select()
      .from(rssParser)
      .where(eq(rssParser.id, id))
      .limit(1);

    const parser = parserResult[0];
    if (!parser) {
      throw new Error('Parser not found');
    }

    // Check if any rss feeds reference this template
    if (parser.rssTemplateId) {
      const feedsResult = await tx
        .select({ id: rss.id })
        .from(rss)
        .where(eq(rss.templateId, parser.rssTemplateId))
        .limit(1);

      if (feedsResult.length > 0) {
        throw new Error('Cannot delete parser: RSS feeds are using this template');
      }
    }

    // Delete rssParser row
    await tx.delete(rssParser).where(eq(rssParser.id, id));

    // Delete associated rssTemplate row
    if (parser.rssTemplateId) {
      await tx.delete(rssTemplate).where(eq(rssTemplate.id, parser.rssTemplateId));
    }

    logger.info({ parserId: id }, 'RSS parser deleted');

    return { success: true };
  });
};

const fetchAndParseXml = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AutoAnime RSS Parser/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();

  const { XMLParser } = require('fast-xml-parser');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    cdataPropName: '#cdata',
    trimValues: true,
  });

  const tree = parser.parse(xml);

  return { success: true, tree, xml };
};

const previewParser = async (url, itemPath, fieldMappings) => {
  const { xml } = await fetchAndParseXml(url);

  const parser = new ConfigurableParser({ itemPath, fieldMappings, name: 'preview' });
  const parsedItems = parser.parse(xml);

  return { success: true, items: parsedItems, total: parsedItems.length };
};

module.exports = {
  getAllParsers,
  getParserById,
  createParser,
  updateParser,
  deleteParser,
  fetchAndParseXml,
  previewParser,
};
