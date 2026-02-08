const { BaseParser } = require('./baseParser');

class DmhyParser extends BaseParser {
  constructor() {
    super();
    this.name = 'DmhyParser';
  }

  parse(xml) {
    const parsed = this.parseXml(xml);
    const items = [];

    const channel = parsed?.rss?.channel;
    if (!channel) return items;

    const rssItems = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);

    for (const item of rssItems) {
      const title = this.extractText(item.title);
      const link = this.extractText(item.link);
      const publishedDate = this.parseDate(this.extractText(item.pubDate));
      const description = this.extractText(item.description);
      const magnetLink = item.enclosure?.['@_url'] || '';
      const author = this.extractText(item.author);
      const category = this.extractText(item.category);
      const guidValue = this.extractText(item.guid) || link;
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

module.exports = { DmhyParser };
