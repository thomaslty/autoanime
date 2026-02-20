const crypto = require('crypto');
const { extractInfoHashFromTorrent } = require('../../src/utils/bencodeParser');

describe('extractInfoHashFromTorrent', () => {
  // Helper: build a bencoded dictionary from key-value pairs (pre-encoded values)
  function buildDict(pairs) {
    const parts = [Buffer.from('d')];
    for (const [key, value] of pairs) {
      parts.push(Buffer.from(`${key.length}:${key}`));
      parts.push(Buffer.isBuffer(value) ? value : Buffer.from(value));
    }
    parts.push(Buffer.from('e'));
    return Buffer.concat(parts);
  }

  // Helper: compute expected SHA1 of a buffer
  function sha1(buf) {
    return crypto.createHash('sha1').update(buf).digest('hex');
  }

  test('extracts info hash from minimal torrent', () => {
    // info dict: d4:name4:test12:piece lengthi16384e6:pieces20:XXXXXXXXXXXXXXXXXXXXe
    const infoDict = Buffer.from(
      'd4:name4:test12:piece lengthi16384e6:pieces20:XXXXXXXXXXXXXXXXXXXXe'
    );
    const expectedHash = sha1(infoDict);

    const torrent = buildDict([
      ['announce', 'l14:http://track.re'],
      ['info', infoDict],
    ]);

    expect(extractInfoHashFromTorrent(torrent)).toBe(expectedHash);
  });

  test('extracts info hash when info is not the first key', () => {
    const infoDict = Buffer.from('d4:name8:testfilee');
    const expectedHash = sha1(infoDict);

    const torrent = buildDict([
      ['announce', '3:url'],
      ['comment', '7:testing'],
      ['info', infoDict],
    ]);

    expect(extractInfoHashFromTorrent(torrent)).toBe(expectedHash);
  });

  test('handles nested structures inside info dict', () => {
    // info contains: name, piece length, pieces, files (list of dicts)
    const infoDict = Buffer.from(
      'd5:filesld6:lengthi1000e4:pathl8:file.txteed6:lengthi2000e4:pathl9:other.txteee4:name7:myfiles12:piece lengthi16384e6:pieces20:ABCDEFGHIJKLMNOPQRSTe'
    );
    const expectedHash = sha1(infoDict);

    const torrent = buildDict([
      ['info', infoDict],
    ]);

    expect(extractInfoHashFromTorrent(torrent)).toBe(expectedHash);
  });

  test('handles info dict with integer values', () => {
    const infoDict = Buffer.from('d6:lengthi42e4:name4:teste');
    const expectedHash = sha1(infoDict);

    const torrent = buildDict([
      ['info', infoDict],
    ]);

    expect(extractInfoHashFromTorrent(torrent)).toBe(expectedHash);
  });

  test('returns null for non-dictionary input', () => {
    expect(extractInfoHashFromTorrent(Buffer.from('i42e'))).toBeNull();
    expect(extractInfoHashFromTorrent(Buffer.from('l4:teste'))).toBeNull();
    expect(extractInfoHashFromTorrent(Buffer.from('4:test'))).toBeNull();
  });

  test('returns null for dictionary without info key', () => {
    const torrent = buildDict([
      ['announce', '3:url'],
      ['comment', '4:test'],
    ]);
    expect(extractInfoHashFromTorrent(torrent)).toBeNull();
  });

  test('returns null for empty buffer', () => {
    expect(extractInfoHashFromTorrent(Buffer.alloc(0))).toBeNull();
  });

  test('returns null for null/undefined input', () => {
    expect(extractInfoHashFromTorrent(null)).toBeNull();
    expect(extractInfoHashFromTorrent(undefined)).toBeNull();
  });

  test('returns null for non-buffer input', () => {
    expect(extractInfoHashFromTorrent('not a buffer')).toBeNull();
    expect(extractInfoHashFromTorrent(42)).toBeNull();
  });

  test('returns null for truncated data', () => {
    // Dictionary that starts but data is cut off
    expect(extractInfoHashFromTorrent(Buffer.from('d4:info'))).toBeNull();
  });

  test('handles keys after info key', () => {
    const infoDict = Buffer.from('d4:name4:teste');
    const expectedHash = sha1(infoDict);

    const torrent = buildDict([
      ['info', infoDict],
      ['source', '8:whatever'],
    ]);

    expect(extractInfoHashFromTorrent(torrent)).toBe(expectedHash);
  });

  test('handles binary data in pieces field', () => {
    // pieces field contains raw SHA1 hashes (binary data, not ASCII)
    const binaryPieces = Buffer.alloc(20);
    crypto.randomFillSync(binaryPieces);

    // Build info dict manually with binary pieces
    const infoParts = [
      Buffer.from('d'),
      Buffer.from('4:name4:test'),
      Buffer.from('6:pieces20:'),
      binaryPieces,
      Buffer.from('e'),
    ];
    const infoDict = Buffer.concat(infoParts);
    const expectedHash = sha1(infoDict);

    const torrent = Buffer.concat([
      Buffer.from('d4:info'),
      infoDict,
      Buffer.from('e'),
    ]);

    expect(extractInfoHashFromTorrent(torrent)).toBe(expectedHash);
  });
});
