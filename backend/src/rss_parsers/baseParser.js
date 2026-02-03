const crypto = require('crypto');

class BaseParser {
  constructor() {
    this.name = 'BaseParser';
  }

  parse(xml) {
    throw new Error('parse() must be implemented by subclass');
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
