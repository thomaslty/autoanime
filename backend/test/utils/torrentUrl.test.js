const { isMagnetLink, getInfoHash, getInfoHashFromUrl } = require('../../src/utils/magnetHelper');

describe('isMagnetLink', () => {
  test('returns true for magnet URIs', () => {
    expect(isMagnetLink('magnet:?xt=urn:btih:ABC123')).toBe(true);
    expect(isMagnetLink('magnet:?xt=urn:btih:abc123&dn=test')).toBe(true);
  });

  test('returns true for magnet with leading whitespace', () => {
    expect(isMagnetLink('  magnet:?xt=urn:btih:ABC123')).toBe(true);
  });

  test('returns false for http URLs', () => {
    expect(isMagnetLink('https://example.com/file.torrent')).toBe(false);
    expect(isMagnetLink('http://example.com/file.torrent')).toBe(false);
  });

  test('returns false for null/undefined/empty', () => {
    expect(isMagnetLink(null)).toBe(false);
    expect(isMagnetLink(undefined)).toBe(false);
    expect(isMagnetLink('')).toBe(false);
  });

  test('returns false for non-string types', () => {
    expect(isMagnetLink(42)).toBe(false);
    expect(isMagnetLink({})).toBe(false);
  });
});

describe('getInfoHashFromUrl', () => {
  test('returns hash for magnet link (delegates to getInfoHash)', async () => {
    const magnet = 'magnet:?xt=urn:btih:4a14efcf7e9e7c84e33c1e87257b2f594ebc5dd3&dn=test';
    const expected = getInfoHash(magnet);
    const result = await getInfoHashFromUrl(magnet);
    expect(result).toBe(expected);
    expect(result).toBe('4a14efcf7e9e7c84e33c1e87257b2f594ebc5dd3');
  });

  test('returns hash for base32 magnet link', async () => {
    const magnet = 'magnet:?xt=urn:btih:JUK57T36TXYRDIZZYDFS4N3MKEQWL3R3&dn=test';
    const expected = getInfoHash(magnet);
    const result = await getInfoHashFromUrl(magnet);
    expect(result).toBe(expected);
    expect(result).toHaveLength(40);
  });

  test('returns null for null/undefined/empty', async () => {
    expect(await getInfoHashFromUrl(null)).toBeNull();
    expect(await getInfoHashFromUrl(undefined)).toBeNull();
    expect(await getInfoHashFromUrl('')).toBeNull();
  });

  test('returns null for non-string types', async () => {
    expect(await getInfoHashFromUrl(42)).toBeNull();
  });
});
