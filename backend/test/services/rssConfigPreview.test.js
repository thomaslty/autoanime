/**
 * Tests for RSS Config Preview with Matched Episodes
 */

const {
  extractEpisodeNumber,
  calculateActualEpisode,
} = require('../../src/utils/regexHelper');

describe('RSS Config Preview - Matched Episodes', () => {
  describe('Episode matching with offset', () => {
    const offset = 13;

    const testCases = [
      {
        title: '【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮][18][1080p]',
        expectedRssEpisode: 18,
        expectedActualEpisode: 5,
        expectedFormatted: 'S01E05',
      },
      {
        title: '【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮][31][1080p]',
        expectedRssEpisode: 31,
        expectedActualEpisode: 18,
        expectedFormatted: 'S01E18',
      },
      {
        title: '【abc】[Blue Lock][13][1080p]',
        expectedRssEpisode: 13,
        expectedActualEpisode: 0,
        expectedFormatted: 'S01E00',
      },
      {
        title: '【abc】[Blue Lock][14][1080p]',
        expectedRssEpisode: 14,
        expectedActualEpisode: 1,
        expectedFormatted: 'S01E01',
      },
    ];

    testCases.forEach(({ title, expectedRssEpisode, expectedActualEpisode, expectedFormatted }) => {
      it(`should correctly extract and calculate episode for: ${title.substring(0, 40)}...`, () => {
        const rssEpisode = extractEpisodeNumber(title);
        expect(rssEpisode).toBe(expectedRssEpisode);

        const actualEpisode = calculateActualEpisode(rssEpisode, offset);
        expect(actualEpisode).toBe(expectedActualEpisode);

        const formatted = `S01E${String(actualEpisode).padStart(2, '0')}`;
        expect(formatted).toBe(expectedFormatted);
      });
    });
  });

  describe('Episode matching without offset', () => {
    const offset = null;

    const testCases = [
      {
        title: '[Some Anime][01][1080p]',
        expectedRssEpisode: 1,
        expectedActualEpisode: 1,
        expectedFormatted: 'S01E01',
      },
      {
        title: '[Some Anime][13][1080p]',
        expectedRssEpisode: 13,
        expectedActualEpisode: 13,
        expectedFormatted: 'S01E13',
      },
    ];

    testCases.forEach(({ title, expectedRssEpisode, expectedActualEpisode, expectedFormatted }) => {
      it(`should correctly handle episode without offset for: ${title}`, () => {
        const rssEpisode = extractEpisodeNumber(title);
        expect(rssEpisode).toBe(expectedRssEpisode);

        const actualEpisode = calculateActualEpisode(rssEpisode, offset);
        expect(actualEpisode).toBe(expectedActualEpisode);

        const formatted = `S01E${String(actualEpisode).padStart(2, '0')}`;
        expect(formatted).toBe(expectedFormatted);
      });
    });
  });

  describe('Preview display formatting', () => {
    it('should format single-digit episodes with leading zero', () => {
      const episodes = [1, 2, 5, 9];
      episodes.forEach(ep => {
        const formatted = `S01E${String(ep).padStart(2, '0')}`;
        expect(formatted).toMatch(/^S01E0\d$/);
      });
    });

    it('should format double-digit episodes without modification', () => {
      const episodes = [10, 13, 25, 99];
      episodes.forEach(ep => {
        const formatted = `S01E${String(ep).padStart(2, '0')}`;
        expect(formatted).toMatch(/^S01E\d{2}$/);
      });
    });

    it('should handle triple-digit episodes', () => {
      const episodes = [100, 123, 999];
      episodes.forEach(ep => {
        const formatted = `S01E${String(ep).padStart(2, '0')}`;
        expect(formatted).toBe(`S01E${ep}`);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle titles with no extractable episode', () => {
      const title = '[Some Random Title][1080p]';
      const rssEpisode = extractEpisodeNumber(title);
      expect(rssEpisode).toBe(null);
    });

    it('should handle negative episode numbers from offset', () => {
      const rssEpisode = 5;
      const offset = 10;
      const actualEpisode = calculateActualEpisode(rssEpisode, offset);
      expect(actualEpisode).toBe(-5);

      const formatted = `S01E${String(actualEpisode).padStart(2, '0')}`;
      expect(formatted).toBe('S01E-5');
    });

    it('should handle zero as episode number', () => {
      const rssEpisode = 13;
      const offset = 13;
      const actualEpisode = calculateActualEpisode(rssEpisode, offset);
      expect(actualEpisode).toBe(0);

      const formatted = `S01E${String(actualEpisode).padStart(2, '0')}`;
      expect(formatted).toBe('S01E00');
    });
  });

  describe('Preview result structure', () => {
    it('should include all necessary fields for display', () => {
      const mockRssItem = {
        id: 1,
        title: '【喵萌奶茶屋】[葬送的芙莉蓮][18][1080p]',
        link: 'http://example.com',
        publishedDate: new Date(),
      };

      const offset = 13;
      const rssEpisode = extractEpisodeNumber(mockRssItem.title);
      const actualEpisode = calculateActualEpisode(rssEpisode, offset);
      const matchedEpisode = `S01E${String(actualEpisode).padStart(2, '0')}`;

      const enhancedItem = {
        ...mockRssItem,
        rssEpisode,
        matchedEpisode,
      };

      expect(enhancedItem).toHaveProperty('id');
      expect(enhancedItem).toHaveProperty('title');
      expect(enhancedItem).toHaveProperty('rssEpisode');
      expect(enhancedItem).toHaveProperty('matchedEpisode');
      expect(enhancedItem.rssEpisode).toBe(18);
      expect(enhancedItem.matchedEpisode).toBe('S01E05');
    });
  });
});
