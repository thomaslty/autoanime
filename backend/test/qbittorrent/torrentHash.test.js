const { describe, test, expect } = require('@jest/globals');

describe('Torrent Hash Extraction from Magnet Links', () => {
  // Helper function to extract hash (same logic as in the codebase)
  const extractHash = (magnetLink) => {
    const hashMatch = magnetLink.match(/xt=urn:btih:([a-zA-Z0-9]+)/i);
    return hashMatch ? hashMatch[1].toUpperCase() : null;
  };

  test('should extract Base32 hash (32 characters)', () => {
    const magnetLink = "magnet:?xt=urn:btih:JUK57T36TXYRDIZZYDFS4N3MKEQWL3R3&dn=&tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce";
    const hash = extractHash(magnetLink);

    expect(hash).toBe('JUK57T36TXYRDIZZYDFS4N3MKEQWL3R3');
    expect(hash.length).toBe(32);
  });

  test('should extract hexadecimal hash (40 characters)', () => {
    const magnetLink = "magnet:?xt=urn:btih:0123456789abcdef0123456789abcdef01234567&dn=test";
    const hash = extractHash(magnetLink);

    expect(hash).toBe('0123456789ABCDEF0123456789ABCDEF01234567');
    expect(hash.length).toBe(40);
  });

  test('should handle lowercase hex hash', () => {
    const magnetLink = "magnet:?xt=urn:btih:abc123def456abc123def456abc123def4567890&dn=test";
    const hash = extractHash(magnetLink);

    expect(hash).toBe('ABC123DEF456ABC123DEF456ABC123DEF4567890');
    expect(hash.length).toBe(40);
  });

  test('should handle uppercase hex hash', () => {
    const magnetLink = "magnet:?xt=urn:btih:ABC123DEF456ABC123DEF456ABC123DEF4567890&dn=test";
    const hash = extractHash(magnetLink);

    expect(hash).toBe('ABC123DEF456ABC123DEF456ABC123DEF4567890');
    expect(hash.length).toBe(40);
  });

  test('should handle mixed case Base32 hash', () => {
    const magnetLink = "magnet:?xt=urn:btih:juk57t36txyrdizzydfs4n3mkeqwl3r3&dn=test";
    const hash = extractHash(magnetLink);

    expect(hash).toBe('JUK57T36TXYRDIZZYDFS4N3MKEQWL3R3');
  });

  test('should return null for invalid magnet link', () => {
    const magnetLink = "not-a-magnet-link";
    const hash = extractHash(magnetLink);

    expect(hash).toBeNull();
  });

  test('should return null for magnet link without btih', () => {
    const magnetLink = "magnet:?dn=test&tr=http://tracker.example.com";
    const hash = extractHash(magnetLink);

    expect(hash).toBeNull();
  });

  test('should handle hash with trackers and other parameters', () => {
    const magnetLink = "magnet:?xt=urn:btih:ABC123DEF456&dn=My%20File&tr=udp://tracker1.com&tr=http://tracker2.com";
    const hash = extractHash(magnetLink);

    expect(hash).toBe('ABC123DEF456');
  });

  test('should extract real-world Base32 hash (type 1)', () => {
    const magnetLink = "magnet:?xt=urn:btih:R5SVJ2MOUR6XSBTD5H75BWTBMAAU7S4X&dn=&tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce";
    const hash = extractHash(magnetLink);

    expect(hash).toBe('R5SVJ2MOUR6XSBTD5H75BWTBMAAU7S4X');
    expect(hash.length).toBe(32);
  });

  test('should extract real-world hex hash (type 2)', () => {
    const magnetLink = "magnet:?xt=urn:btih:8f6554e98ea47d790663e9ffd0da6160014fcb97";
    const hash = extractHash(magnetLink);

    expect(hash).toBe('8F6554E98EA47D790663E9FFD0DA6160014FCB97');
    expect(hash.length).toBe(40);
  });
});
