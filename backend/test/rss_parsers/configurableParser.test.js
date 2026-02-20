const { ConfigurableParser } = require('../../src/rss_parsers/configurableParser');

// ── Standard RSS 2.0 XML (DMHY-like) ──────────────────────────────────
const rssXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
<channel>
<title>Test Feed</title>
<item>
<title><![CDATA[Episode 01 - Test Show]]></title>
<link>http://example.com/ep01</link>
<pubDate>Mon, 10 Feb 2026 12:00:00 +0800</pubDate>
<description><![CDATA[First episode description]]></description>
<enclosure url="magnet:?xt=urn:btih:ABC123" length="1" type="application/x-bittorrent" />
<author><![CDATA[testauthor]]></author>
<guid isPermaLink="true">http://example.com/ep01</guid>
<category><![CDATA[Anime]]></category>
</item>
<item>
<title><![CDATA[Episode 02 - Test Show]]></title>
<link>http://example.com/ep02</link>
<pubDate>Mon, 17 Feb 2026 12:00:00 +0800</pubDate>
<description><![CDATA[Second episode description]]></description>
<enclosure url="magnet:?xt=urn:btih:DEF456" length="1" type="application/x-bittorrent" />
<author><![CDATA[testauthor]]></author>
<guid isPermaLink="true">http://example.com/ep02</guid>
<category><![CDATA[Anime]]></category>
</item>
</channel>
</rss>`;

// ── Atom-style feed ────────────────────────────────────────────────────
const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>Atom Feed</title>
<entry>
<title>Atom Entry 1</title>
<link href="http://example.com/atom1" />
<summary>Summary 1</summary>
<author><name>AtomAuthor</name></author>
<id>tag:example.com,2026:atom1</id>
</entry>
</feed>`;

// ── Single item (not array) ────────────────────────────────────────────
const singleItemXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
<channel>
<item>
<title>Only Episode</title>
<link>http://example.com/only</link>
</item>
</channel>
</rss>`;

// ── Empty channel ──────────────────────────────────────────────────────
const emptyChannelXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
<channel>
<title>Empty Feed</title>
</channel>
</rss>`;

// ── Nested attributes ──────────────────────────────────────────────────
const nestedAttrXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
<channel>
<item>
<title>Nested Test</title>
<link>http://example.com/nested</link>
<enclosure url="magnet:?xt=urn:btih:NESTED123" length="500" type="application/x-bittorrent" />
<source url="http://example.com/source">Source Name</source>
</item>
</channel>
</rss>`;

// ── Deeply nested ──────────────────────────────────────────────────────
const deeplyNestedXml = `<?xml version="1.0" encoding="utf-8"?>
<root>
<data>
<feed>
<entries>
<entry>
<info><name>Deep Title</name></info>
<urls><download>magnet:?xt=urn:btih:DEEP789</download><page>http://example.com/deep</page></urls>
<meta><published>2026-02-15</published></meta>
</entry>
</entries>
</feed>
</data>
</root>`;

describe('ConfigurableParser', () => {
  // ── Constructor ────────────────────────────────────────────────────
  describe('constructor', () => {
    it('sets parser name with config name', () => {
      const parser = new ConfigurableParser({
        name: 'TestParser',
        itemPath: 'rss.channel.item',
        fieldMappings: {}
      });
      expect(parser.name).toBe('ConfigurableParser(TestParser)');
    });

    it('falls back to "custom" when name is not provided', () => {
      const parser = new ConfigurableParser({
        itemPath: 'rss.channel.item',
        fieldMappings: {}
      });
      expect(parser.name).toBe('ConfigurableParser(custom)');
    });
  });

  // ── getByPath ──────────────────────────────────────────────────────
  describe('getByPath', () => {
    const parser = new ConfigurableParser({
      itemPath: 'rss.channel.item',
      fieldMappings: {}
    });

    it('navigates to simple nested path', () => {
      const obj = { a: { b: { c: 'value' } } };
      expect(parser.getByPath(obj, 'a.b.c')).toBe('value');
    });

    it('returns undefined for missing path', () => {
      const obj = { a: { b: 'hello' } };
      expect(parser.getByPath(obj, 'a.x.y')).toBeUndefined();
    });

    it('returns undefined for null/undefined path', () => {
      expect(parser.getByPath({ a: 1 }, null)).toBeUndefined();
      expect(parser.getByPath({ a: 1 }, undefined)).toBeUndefined();
    });

    it('returns undefined when obj is null', () => {
      expect(parser.getByPath(null, 'a.b')).toBeUndefined();
    });

    it('handles @_ attribute prefix paths', () => {
      const obj = { enclosure: { '@_url': 'magnet:?xt=test' } };
      expect(parser.getByPath(obj, 'enclosure.@_url')).toBe('magnet:?xt=test');
    });

    it('returns top-level key', () => {
      const obj = { title: 'Hello' };
      expect(parser.getByPath(obj, 'title')).toBe('Hello');
    });
  });

  // ── Standard RSS parsing ───────────────────────────────────────────
  describe('parse – standard RSS 2.0', () => {
    const parser = new ConfigurableParser({
      name: 'RssTest',
      itemPath: 'rss.channel.item',
      fieldMappings: {
        title: 'title',
        link: 'link',
        publishedDate: 'pubDate',
        description: 'description',
        magnetLink: 'enclosure.@_url',
        author: 'author',
        guid: 'guid',
        category: 'category'
      }
    });

    it('parses two items', () => {
      const items = parser.parse(rssXml);
      expect(items).toHaveLength(2);
    });

    it('extracts CDATA title text', () => {
      const items = parser.parse(rssXml);
      expect(items[0].title).toBe('Episode 01 - Test Show');
      expect(items[1].title).toBe('Episode 02 - Test Show');
    });

    it('extracts link', () => {
      const items = parser.parse(rssXml);
      expect(items[0].link).toBe('http://example.com/ep01');
    });

    it('extracts magnet link from enclosure @_url', () => {
      const items = parser.parse(rssXml);
      expect(items[0].magnetLink).toBe('magnet:?xt=urn:btih:ABC123');
      expect(items[1].magnetLink).toBe('magnet:?xt=urn:btih:DEF456');
    });

    it('extracts author', () => {
      const items = parser.parse(rssXml);
      expect(items[0].author).toBe('testauthor');
    });

    it('extracts category', () => {
      const items = parser.parse(rssXml);
      expect(items[0].category).toBe('Anime');
    });

    it('extracts description', () => {
      const items = parser.parse(rssXml);
      expect(items[0].description).toBe('First episode description');
    });

    it('parses published date', () => {
      const items = parser.parse(rssXml);
      expect(items[0].publishedDate).toBeInstanceOf(Date);
      expect(items[0].publishedDate.getFullYear()).toBe(2026);
    });

    it('generates hashed guid', () => {
      const items = parser.parse(rssXml);
      expect(items[0].guid).toBeTruthy();
      expect(typeof items[0].guid).toBe('string');
      expect(items[0].guid).toHaveLength(32); // MD5 hex
    });
  });

  // ── Atom feed ──────────────────────────────────────────────────────
  describe('parse – Atom feed', () => {
    const parser = new ConfigurableParser({
      name: 'AtomTest',
      itemPath: 'feed.entry',
      fieldMappings: {
        title: 'title',
        link: 'link.@_href',
        description: 'summary',
        guid: 'id',
        author: 'author.name'
      }
    });

    it('parses atom entry', () => {
      const items = parser.parse(atomXml);
      expect(items).toHaveLength(1);
    });

    it('extracts title', () => {
      const items = parser.parse(atomXml);
      expect(items[0].title).toBe('Atom Entry 1');
    });

    it('extracts link from @_href attribute', () => {
      const items = parser.parse(atomXml);
      expect(items[0].link).toBe('http://example.com/atom1');
    });

    it('extracts nested author.name', () => {
      const items = parser.parse(atomXml);
      expect(items[0].author).toBe('AtomAuthor');
    });

    it('has empty magnetLink when not mapped', () => {
      const items = parser.parse(atomXml);
      expect(items[0].magnetLink).toBe('');
    });
  });

  // ── Single item (not wrapped in array) ─────────────────────────────
  describe('parse – single item (not array)', () => {
    const parser = new ConfigurableParser({
      name: 'SingleItem',
      itemPath: 'rss.channel.item',
      fieldMappings: {
        title: 'title',
        link: 'link'
      }
    });

    it('normalizes single item to array', () => {
      const items = parser.parse(singleItemXml);
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Only Episode');
      expect(items[0].link).toBe('http://example.com/only');
    });
  });

  // ── Empty channel (no items) ───────────────────────────────────────
  describe('parse – empty channel', () => {
    const parser = new ConfigurableParser({
      name: 'Empty',
      itemPath: 'rss.channel.item',
      fieldMappings: { title: 'title', link: 'link' }
    });

    it('returns empty array when itemPath not found', () => {
      const items = parser.parse(emptyChannelXml);
      expect(items).toEqual([]);
    });
  });

  // ── Nested attribute extraction ────────────────────────────────────
  describe('parse – nested attributes', () => {
    const parser = new ConfigurableParser({
      name: 'AttrTest',
      itemPath: 'rss.channel.item',
      fieldMappings: {
        title: 'title',
        link: 'link',
        magnetLink: 'enclosure.@_url'
      }
    });

    it('extracts enclosure @_url', () => {
      const items = parser.parse(nestedAttrXml);
      expect(items).toHaveLength(1);
      expect(items[0].magnetLink).toBe('magnet:?xt=urn:btih:NESTED123');
    });
  });

  // ── Deeply nested item path ────────────────────────────────────────
  describe('parse – deeply nested item path', () => {
    const parser = new ConfigurableParser({
      name: 'DeepTest',
      itemPath: 'root.data.feed.entries.entry',
      fieldMappings: {
        title: 'info.name',
        link: 'urls.page',
        magnetLink: 'urls.download',
        publishedDate: 'meta.published'
      }
    });

    it('navigates deep itemPath', () => {
      const items = parser.parse(deeplyNestedXml);
      expect(items).toHaveLength(1);
    });

    it('extracts deeply nested fields', () => {
      const items = parser.parse(deeplyNestedXml);
      expect(items[0].title).toBe('Deep Title');
      expect(items[0].magnetLink).toBe('magnet:?xt=urn:btih:DEEP789');
    });
  });

  // ── Missing field mappings ─────────────────────────────────────────
  describe('parse – missing field mappings', () => {
    const parser = new ConfigurableParser({
      name: 'MinimalMappings',
      itemPath: 'rss.channel.item',
      fieldMappings: {
        title: 'title',
        link: 'link'
        // No magnetLink, description, author, category, guid, publishedDate
      }
    });

    it('provides defaults for unmapped fields', () => {
      const items = parser.parse(rssXml);
      expect(items).toHaveLength(2);
      expect(items[0].magnetLink).toBe('');
      expect(items[0].author).toBe('');
      expect(items[0].category).toBe('');
      expect(items[0].description).toBe('');
    });

    it('falls back guid to link when guid not mapped', () => {
      const items = parser.parse(rssXml);
      // When guid is not mapped, guidRaw is '', so guid falls back to link
      expect(items[0].guid).toBeTruthy();
      expect(items[0].guid).toHaveLength(32);
    });
  });

  // ── Item with no link and no guid → skipped ────────────────────────
  describe('parse – item skipping', () => {
    const noLinkXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
<channel>
<item>
<title>No Link No Guid</title>
<description>Some description</description>
</item>
</channel>
</rss>`;

    const parser = new ConfigurableParser({
      name: 'SkipTest',
      itemPath: 'rss.channel.item',
      fieldMappings: {
        title: 'title',
        description: 'description'
        // No link, no guid mapping
      }
    });

    it('skips items that have neither link nor guid', () => {
      const items = parser.parse(noLinkXml);
      // link = '', guidRaw = '', guidValue = '' || '' = '', hashGuid('') = null
      // if (link || guid) → if ('' || null) → false → item skipped
      expect(items).toHaveLength(0);
    });
  });

  // ── DMHY-format RSS (real-world) ───────────────────────────────────
  describe('parse – DMHY-format RSS', () => {
    const dmhyConfig = new ConfigurableParser({
      name: 'DMHY-like',
      itemPath: 'rss.channel.item',
      fieldMappings: {
        title: 'title',
        link: 'link',
        publishedDate: 'pubDate',
        description: 'description',
        magnetLink: 'enclosure.@_url',
        author: 'author',
        guid: 'guid',
        category: 'category'
      }
    });

    // Use the real DMHY XML from the dmhyParser test
    const dmhyXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
<channel>
<title><![CDATA[動漫花園資源網]]></title>
<item>
<title><![CDATA[【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][31][1080p][繁日雙語]]]></title>
<link>http://share.dmhy.org/topics/view/712650.html</link>
<pubDate>Thu, 05 Feb 2026 01:15:07 +0800</pubDate>
<description><![CDATA[Some HTML description here]]></description>
<enclosure url="magnet:?xt=urn:btih:JUK57T36TXYRDIZZYDFS4N3MKEQWL3R3&amp;dn=" length="1" type="application/x-bittorrent" />
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true">http://share.dmhy.org/topics/view/712650.html</guid>
<category><![CDATA[動畫]]></category>
</item>
</channel>
</rss>`;

    it('parses DMHY-format correctly', () => {
      const items = dmhyConfig.parse(dmhyXml);
      expect(items).toHaveLength(1);
      expect(items[0].title).toContain('葬送的芙莉蓮');
      expect(items[0].magnetLink).toContain('magnet:?xt=urn:btih:');
      expect(items[0].author).toBe('nekomoekissaten');
      expect(items[0].category).toBe('動畫');
    });
  });
});
