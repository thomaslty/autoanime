/**
 * Integration tests for RSS Config with custom regex
 * These tests verify the complete flow of matching RSS items to episodes
 */

const {
  convertCustomRegexToStandard,
  extractEpisodeNumber,
  calculateActualEpisode,
  calculateEffectiveEpisode,
} = require('../../src/utils/regexHelper');

describe('RSS Config Integration Tests', () => {
  describe('Scenario 1: Anime with offset (continuing episode numbers)', () => {
    // Blue Lock Season 2 starts at episode 13, but Sonarr S02E01 should match RSS E13
    const config = {
      name: 'Blue Lock Season 2',
      regex: ':*:[Blue Lock][:ep:]:*:',
      offset: 12, // RSS episode 13 = Sonarr episode 1
    };

    const rssItems = [
      { title: '【SubsPlease】[Blue Lock][13][1080p].mkv', episode: 13 },
      { title: '【SubsPlease】[Blue Lock][14][1080p].mkv', episode: 14 },
      { title: '【SubsPlease】[Blue Lock][15][1080p].mkv', episode: 15 },
    ];

    it('should match RSS episode 13 to Sonarr S02E01', () => {
      const sonarrEpisode = 1;
      const effectiveEpisode = calculateEffectiveEpisode(sonarrEpisode, config.offset);
      expect(effectiveEpisode).toBe(13);

      const regex = convertCustomRegexToStandard(config.regex, effectiveEpisode);
      expect(regex.test(rssItems[0].title)).toBe(true);
      expect(regex.test(rssItems[1].title)).toBe(false);
      expect(regex.test(rssItems[2].title)).toBe(false);
    });

    it('should match RSS episode 14 to Sonarr S02E02', () => {
      const sonarrEpisode = 2;
      const effectiveEpisode = calculateEffectiveEpisode(sonarrEpisode, config.offset);
      expect(effectiveEpisode).toBe(14);

      const regex = convertCustomRegexToStandard(config.regex, effectiveEpisode);
      expect(regex.test(rssItems[0].title)).toBe(false);
      expect(regex.test(rssItems[1].title)).toBe(true);
      expect(regex.test(rssItems[2].title)).toBe(false);
    });

    it('should extract RSS episode and calculate actual Sonarr episode', () => {
      const rssTitle = rssItems[0].title;
      const rssEpisode = extractEpisodeNumber(rssTitle);
      expect(rssEpisode).toBe(13);

      const actualEpisode = calculateActualEpisode(rssEpisode, config.offset);
      expect(actualEpisode).toBe(1);
    });
  });

  describe('Scenario 2: Anime without offset', () => {
    const config = {
      name: 'Frieren',
      regex: ':*:[Frieren][:ep:]:*:',
      offset: null,
    };

    const rssItems = [
      { title: '【Erai-raws】[Frieren][01][1080p][Multiple Subtitle].mkv' },
      { title: '【Erai-raws】[Frieren][02][1080p][Multiple Subtitle].mkv' },
    ];

    it('should match RSS episode 1 to Sonarr S01E01', () => {
      const sonarrEpisode = 1;
      const effectiveEpisode = calculateEffectiveEpisode(sonarrEpisode, config.offset);
      expect(effectiveEpisode).toBe(1);

      const regex = convertCustomRegexToStandard(config.regex, effectiveEpisode);
      expect(regex.test(rssItems[0].title)).toBe(true);
      expect(regex.test(rssItems[1].title)).toBe(false);
    });
  });

  describe('Scenario 3: Chinese anime with complex title', () => {
    const config = {
      name: 'Frieren Chinese',
      regex: ':*:[葬送的芙莉蓮 / Sousou no Frieren][:ep:]:*:',
      offset: 0,
    };

    const rssItems = [
      { title: '【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][31][1080p][繁日雙語][招募翻譯]' },
      { title: '【abc】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][32][1080p]' },
      { title: '【other】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][33][720p]' },
    ];

    it('should match specific episode numbers correctly', () => {
      const sonarrEpisode31 = 31;
      const regex31 = convertCustomRegexToStandard(config.regex, sonarrEpisode31);
      expect(regex31.test(rssItems[0].title)).toBe(true);
      expect(regex31.test(rssItems[1].title)).toBe(false);
      expect(regex31.test(rssItems[2].title)).toBe(false);

      const sonarrEpisode32 = 32;
      const regex32 = convertCustomRegexToStandard(config.regex, sonarrEpisode32);
      expect(regex32.test(rssItems[0].title)).toBe(false);
      expect(regex32.test(rssItems[1].title)).toBe(true);
      expect(regex32.test(rssItems[2].title)).toBe(false);
    });

    it('should extract episode numbers from Chinese titles', () => {
      expect(extractEpisodeNumber(rssItems[0].title)).toBe(31);
      expect(extractEpisodeNumber(rssItems[1].title)).toBe(32);
      expect(extractEpisodeNumber(rssItems[2].title)).toBe(33);
    });
  });

  describe('Scenario 4: Preview mode (matching all episodes)', () => {
    const config = {
      regex: ':*:[Some Anime][:ep:]:*:',
    };

    const rssItems = [
      { title: '[Some Anime][01][1080p]' },
      { title: '[Some Anime][02][1080p]' },
      { title: '[Some Anime][13][1080p]' },
      { title: '[Other Anime][01][1080p]' },
    ];

    it('should match all episodes of the anime in preview mode', () => {
      // When episode number is null, :ep: becomes \d+ (any number)
      const regex = convertCustomRegexToStandard(config.regex, null);

      expect(regex.test(rssItems[0].title)).toBe(true);
      expect(regex.test(rssItems[1].title)).toBe(true);
      expect(regex.test(rssItems[2].title)).toBe(true);
      expect(regex.test(rssItems[3].title)).toBe(false); // Different anime
    });
  });

  describe('Scenario 5: Auto-download workflow', () => {
    const config = {
      name: 'Auto Download Test',
      regex: ':*:[Test Anime][:ep:]:*:',
      offset: 10,
    };

    const newRssItem = {
      title: '【Fansub】[Test Anime][15][1080p]',
      magnetLink: 'magnet:?xt=...',
    };

    it('should determine which Sonarr episode to link the RSS item to', () => {
      // Step 1: Check if RSS matches the config pattern
      const previewRegex = convertCustomRegexToStandard(config.regex, null);
      expect(previewRegex.test(newRssItem.title)).toBe(true);

      // Step 2: Extract episode number from RSS
      const rssEpisode = extractEpisodeNumber(newRssItem.title);
      expect(rssEpisode).toBe(15);

      // Step 3: Calculate actual Sonarr episode
      const sonarrEpisode = calculateActualEpisode(rssEpisode, config.offset);
      expect(sonarrEpisode).toBe(5);

      // This would then be used to find and update the Sonarr episode 5
    });
  });

  describe('Scenario 6: Edge cases', () => {
    it('should handle zero offset', () => {
      const sonarrEpisode = 5;
      const offset = 0;
      expect(calculateEffectiveEpisode(sonarrEpisode, offset)).toBe(5);
      expect(calculateActualEpisode(10, offset)).toBe(10);
    });

    it('should handle null offset', () => {
      const sonarrEpisode = 5;
      const offset = null;
      expect(calculateEffectiveEpisode(sonarrEpisode, offset)).toBe(5);
      expect(calculateActualEpisode(10, offset)).toBe(10);
    });

    it('should handle padded episode numbers in RSS', () => {
      const title = '[Anime][001][1080p]';
      expect(extractEpisodeNumber(title)).toBe(1);

      const regex = convertCustomRegexToStandard('[Anime][:ep:][1080p]', 1);
      expect(regex.test(title)).toBe(true);
      expect(regex.test('[Anime][01][1080p]')).toBe(true);
      expect(regex.test('[Anime][1][1080p]')).toBe(true);
    });

    it('should not match different anime with similar names', () => {
      const regex = convertCustomRegexToStandard('[Blue Lock][:ep:]', 1);
      expect(regex.test('[Blue Lock][1]')).toBe(true);
      expect(regex.test('[Blue Lock Season 2][1]')).toBe(false);
      expect(regex.test('[Blue][1]')).toBe(false);
    });
  });

  describe('Scenario 7: :ep: placeholder is mandatory', () => {
    it('should reject patterns without :ep:', () => {
      const { validateCustomRegex } = require('../../src/utils/regexHelper');

      expect(validateCustomRegex(':*:[Some Anime]:*:')).toBe(false);
      expect(validateCustomRegex('[Some Anime][1080p]')).toBe(false);
      expect(validateCustomRegex('Some Anime')).toBe(false);

      // Should accept with :ep:
      expect(validateCustomRegex(':*:[Some Anime][:ep:]:*:')).toBe(true);
      expect(validateCustomRegex('[Some Anime][:ep:]')).toBe(true);
    });
  });
});
