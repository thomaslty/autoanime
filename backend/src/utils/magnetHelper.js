const { logger } = require('./logger');

/**
 * Extracts and returns the hash from a magnet link.
 * @param {string} magnetLink - The full magnet URI string.
 * @returns {string|null} - The hash in uppercase, or null if invalid.
 */
const extractHash = (magnetLink) => {
  const hashMatch = magnetLink.match(/xt=urn:btih:([a-zA-Z0-9]+)/i);
  return hashMatch ? hashMatch[1].toUpperCase() : null;
};

/**
 * Extracts and returns the 40-character Hex infohash from a magnet link.
 * Handles both Hex and Base32 encoded magnets.
 *
 * @param {string} magnetLink - The full magnet URI string.
 * @returns {string|null} - The infohash in lowercase Hex, or null if invalid.
 */
function getInfoHash(magnetLink) {
    if (!magnetLink || typeof magnetLink !== 'string') return null;

    // 1. Extract the specific 'xt' parameter value using Regex
    // Look for 'xt=urn:btih:' followed by the hash characters
    const match = magnetLink.match(/xt=urn:btih:([a-zA-Z0-9]+)/i);
    
    if (!match || match.length < 2) return null;

    const rawHash = match[1];

    // 2. Scenario A: Hash is already Hex (40 characters)
    if (rawHash.length === 40) {
        return rawHash.toLowerCase();
    }

    // 3. Scenario B: Hash is Base32 (32 characters) -> Convert to Hex
    if (rawHash.length === 32) {
        return base32ToHex(rawHash);
    }

    // Invalid length for v1 hash
    return null;
}

/**
 * Helper: Converts a Base32 string to a Hex string.
 * Assumes standard RFC 4648 Base32 alphabet (A-Z, 2-7).
 */
function base32ToHex(base32Str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let hex = '';

    for (let i = 0; i < base32Str.length; i++) {
        const char = base32Str[i].toUpperCase();
        const idx = alphabet.indexOf(char);

        if (idx === -1) {
            console.error(`Invalid Base32 character found: ${char}`);
            return null;
        }

        // Base32 characters represent 5 bits each
        value = (value << 5) | idx;
        bits += 5;

        // Extract complete bytes (8 bits) as they become available
        while (bits >= 8) {
            bits -= 8;
            const byte = (value >>> bits) & 0xFF;
            // Convert byte to hex and pad with zero if needed (e.g., 'A' -> '0A')
            hex += byte.toString(16).padStart(2, '0');
        }
    }
    return hex;
}

module.exports = { extractHash, getInfoHash };