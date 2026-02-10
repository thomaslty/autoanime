const {
  convertCustomRegexToStandard,
  validateCustomRegex,
  extractEpisodeNumber,
  calculateActualEpisode,
  calculateEffectiveEpisode,
} = require('../../src/utils/regexHelper');

describe('regexHelper', () => {
  describe('validateCustomRegex', () => {
    it('should reject empty or null patterns', () => {
      expect(validateCustomRegex(null)).toBe(false);
      expect(validateCustomRegex('')).toBe(false);
      expect(validateCustomRegex(undefined)).toBe(false);
    });

    it('should reject patterns without :ep: placeholder', () => {
      expect(validateCustomRegex(':*:[Some Anime]:*:')).toBe(false);
      expect(validateCustomRegex('[Some Anime][1080p]')).toBe(false);
    });

    it('should accept valid patterns with :ep:', () => {
      expect(validateCustomRegex(':*:[Some Anime][:ep:]:*:')).toBe(true);
      expect(validateCustomRegex('[Some Anime][:ep:][1080p]')).toBe(true);
      expect(validateCustomRegex(':ep:')).toBe(true);
    });
  });

  describe('convertCustomRegexToStandard', () => {
    it('should convert :*: to .*', () => {
      const regex = convertCustomRegexToStandard(':*:[Anime][:ep:]:*:', 1);
      expect(regex.source).toContain('.*');
    });

    it('should convert :ep: to specific episode number', () => {
      const regex = convertCustomRegexToStandard(':*:[Anime][:ep:]:*:', 31);
      expect(regex.source).toContain('0*31');
      expect(regex.test('[Anime][31][1080p]')).toBe(true);
      expect(regex.test('[Anime][031][1080p]')).toBe(true);
      expect(regex.test('[Anime][32][1080p]')).toBe(false);
    });

    it('should convert :ep: to \\d+ when episode number is null', () => {
      const regex = convertCustomRegexToStandard(':*:[Anime][:ep:]:*:', null);
      expect(regex.source).toContain('\\d+');
      expect(regex.test('[Anime][31][1080p]')).toBe(true);
      expect(regex.test('[Anime][32][1080p]')).toBe(true);
      expect(regex.test('[Anime][1][1080p]')).toBe(true);
    });

    it('should escape special regex characters', () => {
      const regex = convertCustomRegexToStandard('[Anime (Test)][:ep:][1080p]', 5);
      expect(regex.test('[Anime (Test)][5][1080p]')).toBe(true);
      expect(regex.test('[Anime (Test)][05][1080p]')).toBe(true);
      expect(regex.test('XAnime (Test)X5X1080pX')).toBe(false);
    });

    it('should handle Chinese/Japanese brackets', () => {
      const regex = convertCustomRegexToStandard(':*:[葬送的芙莉蓮 / Sousou no Frieren][:ep:]:*:', 31);
      expect(regex.test('【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][31][1080p][繁日雙語][招募翻譯]')).toBe(true);
      expect(regex.test('【abc】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][31][1080p]')).toBe(true);
      expect(regex.test('【abc】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][32][1080p]')).toBe(false);
    });

    it('should be case-insensitive', () => {
      const regex = convertCustomRegexToStandard('[anime][:ep:]', 5);
      expect(regex.test('[ANIME][5]')).toBe(true);
      expect(regex.test('[Anime][5]')).toBe(true);
      expect(regex.test('[anime][5]')).toBe(true);
    });

    it('should handle patterns with forward slashes', () => {
      const regex = convertCustomRegexToStandard('[葬送的芙莉蓮 / Sousou no Frieren][:ep:]', 1);
      expect(regex.test('[葬送的芙莉蓮 / Sousou no Frieren][1]')).toBe(true);
      expect(regex.test('[葬送的芙莉蓮 / Sousou no Frieren][01]')).toBe(true);
    });
  });

  describe('extractEpisodeNumber', () => {
    it('should extract episode from [13] format', () => {
      expect(extractEpisodeNumber('[Some Anime][13][1080p]')).toBe(13);
      expect(extractEpisodeNumber('[13]')).toBe(13);
    });

    it('should extract episode from 【13】 format (Chinese brackets)', () => {
      expect(extractEpisodeNumber('【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮][13][1080p]')).toBe(13);
    });

    it('should extract episode from E13 format', () => {
      expect(extractEpisodeNumber('Some Anime E13 1080p')).toBe(13);
      expect(extractEpisodeNumber('Some Anime e13 1080p')).toBe(13);
    });

    it('should extract episode from Episode 13 format', () => {
      expect(extractEpisodeNumber('Some Anime Episode 13')).toBe(13);
      expect(extractEpisodeNumber('Some Anime episode 13')).toBe(13);
    });

    it('should extract episode from - 13 [ format', () => {
      expect(extractEpisodeNumber('Some Anime - 13 [1080p]')).toBe(13);
    });

    it('should handle padded episode numbers', () => {
      expect(extractEpisodeNumber('[Some Anime][01][1080p]')).toBe(1);
      expect(extractEpisodeNumber('[Some Anime][001][1080p]')).toBe(1);
    });

    it('should prefer bracketed format over other formats', () => {
      expect(extractEpisodeNumber('[Some Anime][13][1080p] E14')).toBe(13);
    });

    it('should return null for invalid titles', () => {
      expect(extractEpisodeNumber(null)).toBe(null);
      expect(extractEpisodeNumber('')).toBe(null);
      expect(extractEpisodeNumber('No episode number here')).toBe(null);
    });

    it('should handle large episode numbers', () => {
      expect(extractEpisodeNumber('[Some Anime][123][1080p]')).toBe(123);
      expect(extractEpisodeNumber('[Some Anime][999][1080p]')).toBe(999);
    });

    it('should reject unrealistic episode numbers', () => {
      expect(extractEpisodeNumber('[Some Anime][1234][1080p]')).toBe(null);
      expect(extractEpisodeNumber('[Some Anime][0][1080p]')).toBe(null);
    });
  });

  describe('calculateActualEpisode', () => {
    it('should subtract offset from RSS episode number', () => {
      expect(calculateActualEpisode(18, 13)).toBe(5);
      expect(calculateActualEpisode(31, 12)).toBe(19);
      expect(calculateActualEpisode(1, 0)).toBe(1);
    });

    it('should return same number when offset is null or 0', () => {
      expect(calculateActualEpisode(18, null)).toBe(18);
      expect(calculateActualEpisode(18, 0)).toBe(18);
      expect(calculateActualEpisode(18, undefined)).toBe(18);
    });

    it('should handle negative results', () => {
      expect(calculateActualEpisode(5, 10)).toBe(-5);
    });
  });

  describe('calculateEffectiveEpisode', () => {
    it('should add offset to Sonarr episode number', () => {
      expect(calculateEffectiveEpisode(5, 13)).toBe(18);
      expect(calculateEffectiveEpisode(19, 12)).toBe(31);
      expect(calculateEffectiveEpisode(1, 0)).toBe(1);
    });

    it('should return same number when offset is null or 0', () => {
      expect(calculateEffectiveEpisode(5, null)).toBe(5);
      expect(calculateEffectiveEpisode(5, 0)).toBe(5);
      expect(calculateEffectiveEpisode(5, undefined)).toBe(5);
    });
  });

  describe('Integration: Full workflow', () => {
    it('should correctly match RSS item to Sonarr episode with offset', () => {
      // Scenario: Sonarr has episode 5, RSS config has offset 13
      const sonarrEpisode = 5;
      const offset = 13;
      const rssTitle = '【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮][18][1080p][繁日雙語]';
      const customRegex = ':*:[葬送的芙莉蓮][:ep:]:*:';

      // Step 1: Calculate effective episode (what to look for in RSS)
      const effectiveEpisode = calculateEffectiveEpisode(sonarrEpisode, offset);
      expect(effectiveEpisode).toBe(18);

      // Step 2: Convert custom regex with effective episode
      const regex = convertCustomRegexToStandard(customRegex, effectiveEpisode);

      // Step 3: Test if RSS title matches
      expect(regex.test(rssTitle)).toBe(true);
    });

    it('should correctly extract episode from RSS and calculate actual episode', () => {
      // Scenario: RSS has episode 18, offset is 13
      const rssTitle = '【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮][18][1080p][繁日雙語]';
      const offset = 13;

      // Step 1: Extract episode from RSS
      const rssEpisode = extractEpisodeNumber(rssTitle);
      expect(rssEpisode).toBe(18);

      // Step 2: Calculate actual episode
      const actualEpisode = calculateActualEpisode(rssEpisode, offset);
      expect(actualEpisode).toBe(5);
    });

    it('should work without offset', () => {
      const sonarrEpisode = 5;
      const offset = null;
      const rssTitle = '[Some Anime][5][1080p]';
      const customRegex = '[Some Anime][:ep:][1080p]';

      const effectiveEpisode = calculateEffectiveEpisode(sonarrEpisode, offset);
      expect(effectiveEpisode).toBe(5);

      const regex = convertCustomRegexToStandard(customRegex, effectiveEpisode);
      expect(regex.test(rssTitle)).toBe(true);
    });
  });
});
