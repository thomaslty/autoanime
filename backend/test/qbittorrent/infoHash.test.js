const { extractHash, getInfoHash } = require('../../src/utils/magnetHelper');

describe('Magnet InfoHash Utilities', () => {
  // Test data
  const hexMagnetLink = "magnet:?xt=urn:btih:62fd1da7c0178c4b3e184fc47d295214ea2425b1&dn=%5BNekomoe%20kissaten%5D%5BSousou%20no%20Frieren%5D%5B29%5D%5B1080p%5D%5BJPTC%5D.mp4&xl=803082269&tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce";
  const hexInfoHash = "62fd1da7c0178c4b3e184fc47d295214ea2425b1";
  
  // Base32 example: MZXW6YTBOI (shortened for testing - this is "fooba" in Base32)
  // Real 32-char Base32 hash that converts to 40-char hex
  const base32MagnetLink = "magnet:?xt=urn:btih:MZXW6YTBOJRGC6ZANFXW4IDPMYXGCZLB&dn=test";
  const base32Hash = "MZXW6YTBOJRGC6ZANFXW4IDPMYXGCZLB";
  
  describe('extractHash', () => {
    test('should extract hash from hex magnet link', () => {
      const result = extractHash(hexMagnetLink);
      expect(result).toBe(hexInfoHash.toUpperCase());
    });

    test('should extract hash from magnet with lowercase xt parameter', () => {
      const magnet = "magnet:?xt=urn:btih:abc123def456&dn=test";
      const result = extractHash(magnet);
      expect(result).toBe("ABC123DEF456");
    });

    test('should extract hash from magnet with uppercase XT parameter', () => {
      const magnet = "magnet:?XT=URN:BTIH:ABC123DEF456&dn=test";
      const result = extractHash(magnet);
      expect(result).toBe("ABC123DEF456");
    });

    test('should extract hash from minimal magnet link', () => {
      const magnet = "magnet:?xt=urn:btih:1234567890abcdef1234567890abcdef12345678";
      const result = extractHash(magnet);
      expect(result).toBe("1234567890ABCDEF1234567890ABCDEF12345678");
    });

    test('should extract base32 hash (32 characters)', () => {
      const result = extractHash(base32MagnetLink);
      expect(result).toBe(base32Hash.toUpperCase());
    });

    test('should return null for invalid magnet link', () => {
      const result = extractHash("not a magnet link");
      expect(result).toBeNull();
    });

    test('should return null for empty string', () => {
      const result = extractHash("");
      expect(result).toBeNull();
    });

    test('should return null for magnet without xt parameter', () => {
      const magnet = "magnet:?dn=test&tr=http://tracker.example.com";
      const result = extractHash(magnet);
      expect(result).toBeNull();
    });
  });

  describe('getInfoHash', () => {
    test('should return lowercase hex hash from hex magnet link', () => {
      const result = getInfoHash(hexMagnetLink);
      expect(result).toBe(hexInfoHash.toLowerCase());
      expect(result).toHaveLength(40);
    });

    test('should handle 40-character hex hash', () => {
      const magnet = "magnet:?xt=urn:btih:ABCDEF1234567890ABCDEF1234567890ABCDEF12";
      const result = getInfoHash(magnet);
      expect(result).toBe("abcdef1234567890abcdef1234567890abcdef12");
      expect(result).toHaveLength(40);
    });

    test('should convert 32-character base32 hash to 40-character hex', () => {
      const result = getInfoHash(base32MagnetLink);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(40);
      // Verify it's valid hex (only contains 0-9, a-f)
      expect(result).toMatch(/^[0-9a-f]{40}$/);
    });

    test('should handle uppercase hex hash', () => {
      const magnet = "magnet:?xt=urn:btih:FEDCBA9876543210FEDCBA9876543210FEDCBA98";
      const result = getInfoHash(magnet);
      expect(result).toBe("fedcba9876543210fedcba9876543210fedcba98");
    });

    test('should handle mixed case hex hash', () => {
      const magnet = "magnet:?xt=urn:btih:AbCdEf1234567890aBcDeF1234567890AbCdEf12";
      const result = getInfoHash(magnet);
      expect(result).toBe("abcdef1234567890abcdef1234567890abcdef12");
    });

    test('should return null for invalid input types', () => {
      expect(getInfoHash(null)).toBeNull();
      expect(getInfoHash(undefined)).toBeNull();
      expect(getInfoHash(123)).toBeNull();
      expect(getInfoHash({})).toBeNull();
      expect(getInfoHash([])).toBeNull();
    });

    test('should return null for empty string', () => {
      const result = getInfoHash("");
      expect(result).toBeNull();
    });

    test('should return null for invalid magnet link', () => {
      const result = getInfoHash("not a magnet link");
      expect(result).toBeNull();
    });

    test('should return null for magnet without xt parameter', () => {
      const magnet = "magnet:?dn=test&tr=http://tracker.example.com";
      const result = getInfoHash(magnet);
      expect(result).toBeNull();
    });

    test('should return null for hash with invalid length', () => {
      // 35 characters - invalid for both hex (needs 40) and base32 (needs 32)
      const magnet = "magnet:?xt=urn:btih:ABCDEF1234567890ABCDEF123456789";
      const result = getInfoHash(magnet);
      expect(result).toBeNull();
    });

    test('should return null for 25-character hash', () => {
      const magnet = "magnet:?xt=urn:btih:ABCDEF1234567890ABCDEF123";
      const result = getInfoHash(magnet);
      expect(result).toBeNull();
    });

    test('should return null for hash with only 20 characters', () => {
      const magnet = "magnet:?xt=urn:btih:12345678901234567890";
      const result = getInfoHash(magnet);
      expect(result).toBeNull();
    });

    test('should handle magnet with multiple parameters', () => {
      const magnet = "magnet:?xt=urn:btih:62fd1da7c0178c4b3e184fc47d295214ea2425b1&dn=filename&tr=tracker1&tr=tracker2&xl=123456";
      const result = getInfoHash(magnet);
      expect(result).toBe(hexInfoHash.toLowerCase());
    });

    test('should handle magnet with xt parameter not in first position', () => {
      const magnet = "magnet:?dn=filename&xt=urn:btih:62fd1da7c0178c4b3e184fc47d295214ea2425b1&tr=tracker";
      const result = getInfoHash(magnet);
      expect(result).toBe(hexInfoHash.toLowerCase());
    });

    test('should return null for base32 hash with invalid characters', () => {
      // Base32 should only contain A-Z and 2-7, this has invalid chars (0, 1, 8, 9)
      const magnet = "magnet:?xt=urn:btih:01189ABCDEFGHIJKLMNOPQRSTUVWXY";
      const result = getInfoHash(magnet);
      // Should return null because it's 32 chars but has invalid base32 characters
      expect(result).toBeNull();
    });

    test('should handle real-world anime torrent magnet', () => {
      const realMagnet = "magnet:?xt=urn:btih:62fd1da7c0178c4b3e184fc47d295214ea2425b1&dn=%5BNekomoe%20kissaten%5D%5BSousou%20no%20Frieren%5D%5B29%5D%5B1080p%5D%5BJPTC%5D.mp4&xl=803082269&tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce";
      const result = getInfoHash(realMagnet);
      expect(result).toBe("62fd1da7c0178c4b3e184fc47d295214ea2425b1");
      expect(result).toHaveLength(40);
    });
  });

  describe('extractHash vs getInfoHash consistency', () => {
    test('both functions should extract the same hash from hex magnet', () => {
      const extracted = extractHash(hexMagnetLink);
      const info = getInfoHash(hexMagnetLink);
      
      expect(extracted).not.toBeNull();
      expect(info).not.toBeNull();
      // extractHash returns uppercase, getInfoHash returns lowercase
      expect(extracted.toLowerCase()).toBe(info);
    });

    test('both functions should handle invalid input consistently', () => {
      const invalidInputs = [
        "",
        "not a magnet",
        "magnet:?dn=test",
        "http://example.com"
      ];

      invalidInputs.forEach(input => {
        expect(extractHash(input)).toBeNull();
        expect(getInfoHash(input)).toBeNull();
      });
    });
  });
});