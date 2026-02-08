const crypto = require('crypto');
const { XMLParser } = require('fast-xml-parser');

class BaseParser {
  constructor() {
    this.name = 'BaseParser';
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      cdataPropName: '#cdata',
      trimValues: true
    });
  }

  parse(xml) {
    throw new Error('parse() must be implemented by subclass');
  }

  parseXml(xml) {
    return this.parser.parse(xml);
  }

  extractText(node) {
    if (!node) return '';
    if (typeof node === 'string') return node.trim();
    if (node['#cdata']) return node['#cdata'].trim();
    if (node['#text']) return node['#text'].trim();
    return '';
  }

  extractCDATA(content) {
    if (!content) return '';
    const match = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    return match ? match[1] : content;
  }

  extractAttribute(content, attrName) {
    if (!content) return null;
    const match = content.match(new RegExp(`${attrName}="([^"]*)"`, 'i'));
    return match ? match[1] : null;
  }

  hashGuid(value) {
    if (!value) return null;
    return crypto.createHash('md5').update(value).digest('hex');
  }

  parseDate(dateStr) {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
}

module.exports = { BaseParser };
