const { BaseParser } = require('./baseParser');

class ConfigurableParser extends BaseParser {
  constructor(config) {
    super();
    this.name = `ConfigurableParser(${config.name || 'custom'})`;
    this.itemPath = config.itemPath;
    this.fieldMappings = config.fieldMappings;
  }

  /**
   * Navigate a parsed XML object using dot-notation path.
   * e.g., getByPath(obj, "rss.channel.item") returns obj.rss.channel.item
   * Handles @_ attribute prefix from fast-xml-parser.
   */
  getByPath(obj, path) {
    if (!path) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current == null) return undefined;
      current = current[part];
    }
    return current;
  }

  parse(xml) {
    const parsed = this.parseXml(xml);
    const items = [];

    const rawItems = this.getByPath(parsed, this.itemPath);
    if (!rawItems) return items;

    const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems].filter(Boolean);

    for (const item of itemArray) {
      const m = this.fieldMappings;

      const title = this.extractText(this.getByPath(item, m.title));
      const link = this.extractText(this.getByPath(item, m.link));
      const publishedDate = this.parseDate(
        this.extractText(this.getByPath(item, m.publishedDate))
      );
      const description = this.extractText(this.getByPath(item, m.description));
      const magnetLink = m.magnetLink
        ? (this.getByPath(item, m.magnetLink) || '')
        : '';
      const author = this.extractText(this.getByPath(item, m.author));
      const category = this.extractText(this.getByPath(item, m.category));

      const guidRaw = m.guid
        ? this.extractText(this.getByPath(item, m.guid))
        : '';
      const guidValue = guidRaw || link;
      const guid = this.hashGuid(guidValue);

      if (link || guid) {
        items.push({
          guid, title, description, link,
          publishedDate, magnetLink, author, category
        });
      }
    }

    return items;
  }
}

module.exports = { ConfigurableParser };
