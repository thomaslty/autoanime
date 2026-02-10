/**
 * Converts custom RSS regex syntax to standard JavaScript regex
 * Custom syntax:
 *   :*: -> any character (wildcard)
 *   :ep: -> episode number placeholder
 *
 * @param {string} customRegex - The custom regex pattern
 * @param {number|null} episodeNumber - Optional episode number to match against :ep:
 * @returns {RegExp|null} - Standard RegExp object or null if invalid
 */
const convertCustomRegexToStandard = (customRegex, episodeNumber = null) => {
  if (!customRegex) return null;

  try {
    let pattern = customRegex;

    // First, temporarily replace our custom placeholders with unique markers
    const epMarker = '\u0001EP\u0001';
    const wildcardMarker = '\u0002WILD\u0002';

    pattern = pattern.replace(/:ep:/g, epMarker);
    pattern = pattern.replace(/:?\*:/g, wildcardMarker);

    // Escape all special regex characters
    pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Now replace our markers back with the actual regex patterns
    pattern = pattern.replace(new RegExp(wildcardMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '.*');

    // Replace :ep: with episode number pattern
    if (episodeNumber !== null) {
      // When matching a specific episode, replace with the episode number
      // Support both padded (01, 02) and unpadded (1, 2) formats
      const epPattern = `(?:0*${episodeNumber})`;
      pattern = pattern.replace(new RegExp(epMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), epPattern);
    } else {
      // When not matching a specific episode (e.g., for preview), match any number
      pattern = pattern.replace(new RegExp(epMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '\\d+');
    }

    // Create and return the regex pattern (case-insensitive)
    return new RegExp(pattern, 'i');
  } catch (error) {
    console.error('Error converting custom regex:', error);
    return null;
  }
};

/**
 * Validates custom regex syntax
 * @param {string} customRegex - The custom regex pattern to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateCustomRegex = (customRegex) => {
  if (!customRegex) return false;

  // :ep: is MANDATORY - it's used to match episode numbers
  if (!customRegex.includes(':ep:')) {
    return false;
  }

  try {
    // Try to convert it - if it succeeds, it's valid
    const testPattern = convertCustomRegexToStandard(customRegex, 1);
    return testPattern !== null;
  } catch {
    return false;
  }
};

/**
 * Extracts episode number from RSS item title
 * Common patterns: E13, Episode 13, [13], - 13, etc.
 * @param {string} title - The RSS item title
 * @returns {number|null} - The extracted episode number or null if not found
 */
const extractEpisodeNumber = (title) => {
  if (!title) return null;

  // Try common patterns in order of specificity
  const patterns = [
    /\[(\d+)\]/,                           // [13]
    /【(\d+)】/,                            // 【13】 (Chinese brackets)
    /E(\d+)/i,                             // E13 or e13
    /Episode\s+(\d+)/i,                     // Episode 13
    /-\s*(\d+)\s*\[/,                      // - 13 [
    /\b(\d+)\s*(?:th|st|nd|rd)?\s*(?:episode|ep)?\b/i,  // 13th episode
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      const episodeNum = parseInt(match[1], 10);
      // Sanity check: episode numbers should be reasonable (1-999)
      if (episodeNum >= 1 && episodeNum < 1000) {
        return episodeNum;
      }
    }
  }
  return null;
};

/**
 * Calculates the actual episode number by applying offset
 * When offset = 13 and RSS has episode 18, actual episode = 18 - 13 = 5
 * @param {number} rssEpisodeNumber - Episode number from RSS feed
 * @param {number|null} offset - Offset to subtract
 * @returns {number} - The actual episode number
 */
const calculateActualEpisode = (rssEpisodeNumber, offset) => {
  if (!offset) return rssEpisodeNumber;
  return rssEpisodeNumber - offset;
};

/**
 * Calculates the effective episode number for matching
 * When looking for Sonarr episode 5 with offset 13, we look for RSS episode 18 (5 + 13)
 * @param {number} sonarrEpisodeNumber - Episode number from Sonarr
 * @param {number|null} offset - Offset to add
 * @returns {number} - The effective episode number to search for in RSS
 */
const calculateEffectiveEpisode = (sonarrEpisodeNumber, offset) => {
  if (!offset) return sonarrEpisodeNumber;
  return sonarrEpisodeNumber + offset;
};

module.exports = {
  convertCustomRegexToStandard,
  validateCustomRegex,
  extractEpisodeNumber,
  calculateActualEpisode,
  calculateEffectiveEpisode,
};
