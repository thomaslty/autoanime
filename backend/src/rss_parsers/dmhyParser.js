const { BaseParser } = require('./baseParser');

class DmhyParser extends BaseParser {
  constructor() {
    super();
    this.name = 'DmhyParser';
  }

  parse(xml) {
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];

      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
      const descriptionMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>(.*?)<\/description>/i);
      const enclosureMatch = itemXml.match(/<enclosure[^>]*url="([^"]*)"[^>]*>/i) || itemXml.match(/<enclosure[^>]*url='([^"]*)'[^>]*>/i);
      const authorMatch = itemXml.match(/<author><!\[CDATA\[([\s\S]*?)\]\]><\/author>|<author>(.*?)<\/author>/i);
      const categoryMatch = itemXml.match(/<category[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|(.*?))<\/category>/i);
      const guidMatch = itemXml.match(/<guid[^>]*>(.*?)<\/guid>/i);

      const title = titleMatch ? this.extractCDATA(titleMatch[1] || titleMatch[2] || '') : '';
      const link = linkMatch ? linkMatch[1] : '';
      const publishedDate = pubDateMatch ? this.parseDate(pubDateMatch[1]) : new Date();
      const description = descriptionMatch ? this.extractCDATA(descriptionMatch[1] || descriptionMatch[2] || '') : '';
      const magnetLink = enclosureMatch ? enclosureMatch[1] : '';
      const author = authorMatch ? this.extractCDATA(authorMatch[1] || authorMatch[2] || '') : '';
      const category = categoryMatch ? this.extractCDATA(categoryMatch[1] || categoryMatch[2] || '') : '';
      const guidValue = guidMatch ? this.extractCDATA(guidMatch[1]) : link;
      const guid = this.hashGuid(guidValue);

      if (link || guid) {
        items.push({
          guid,
          title,
          description,
          link,
          publishedDate,
          magnetLink,
          author,
          category
        });
      }
    }

    return items;
  }
}

module.exports = { DmhyParser };
