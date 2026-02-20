const crypto = require('crypto');

/**
 * Minimal bencode parser for extracting info_hash from .torrent files.
 * Only parses enough to find the 'info' key in the top-level dictionary
 * and SHA1-hash its raw bencoded bytes.
 *
 * Bencode format:
 *   d...e  = dictionary (keys are sorted byte strings)
 *   l...e  = list
 *   i<n>e  = integer
 *   <len>:<data> = byte string
 */

/**
 * Decode a bencode byte string at the given position.
 * Format: <length>:<data>
 * @param {Buffer} buf
 * @param {number} pos
 * @returns {{ value: Buffer, end: number }}
 */
function decodeString(buf, pos) {
  const colonIdx = buf.indexOf(0x3a, pos); // 0x3a = ':'
  if (colonIdx === -1 || colonIdx >= buf.length) return null;

  const lenStr = buf.slice(pos, colonIdx).toString('ascii');
  const len = parseInt(lenStr, 10);
  if (isNaN(len) || len < 0) return null;

  const start = colonIdx + 1;
  const end = start + len;
  if (end > buf.length) return null;

  return { value: buf.slice(start, end), end };
}

/**
 * Skip over a bencoded integer: i<number>e
 * @param {Buffer} buf
 * @param {number} pos - position of the 'i'
 * @returns {number} position after the 'e', or -1 on error
 */
function skipInteger(buf, pos) {
  const eIdx = buf.indexOf(0x65, pos + 1); // 0x65 = 'e'
  if (eIdx === -1) return -1;
  return eIdx + 1;
}

/**
 * Skip over any bencoded value (string, integer, list, dict).
 * @param {Buffer} buf
 * @param {number} pos
 * @returns {number} position after the value, or -1 on error
 */
function skipValue(buf, pos) {
  if (pos >= buf.length) return -1;

  const byte = buf[pos];

  // Integer: i<number>e
  if (byte === 0x69) { // 'i'
    return skipInteger(buf, pos);
  }

  // List: l...e
  if (byte === 0x6c) { // 'l'
    pos++;
    while (pos < buf.length && buf[pos] !== 0x65) { // 'e'
      pos = skipValue(buf, pos);
      if (pos === -1) return -1;
    }
    return pos < buf.length ? pos + 1 : -1;
  }

  // Dictionary: d...e
  if (byte === 0x64) { // 'd'
    pos++;
    while (pos < buf.length && buf[pos] !== 0x65) { // 'e'
      // Key (byte string)
      const key = decodeString(buf, pos);
      if (!key) return -1;
      pos = key.end;
      // Value
      pos = skipValue(buf, pos);
      if (pos === -1) return -1;
    }
    return pos < buf.length ? pos + 1 : -1;
  }

  // Byte string: <length>:<data>
  if (byte >= 0x30 && byte <= 0x39) { // '0'-'9'
    const str = decodeString(buf, pos);
    if (!str) return -1;
    return str.end;
  }

  return -1;
}

/**
 * Extract the info_hash from raw .torrent file bytes.
 * Parses the top-level bencoded dictionary to find the 'info' key,
 * then SHA1-hashes its raw bencoded value bytes.
 *
 * @param {Buffer} torrentBuffer - Raw .torrent file content
 * @returns {string|null} - 40-character lowercase hex info_hash, or null
 */
function extractInfoHashFromTorrent(torrentBuffer) {
  if (!Buffer.isBuffer(torrentBuffer) || torrentBuffer.length === 0) return null;

  // Top-level must be a dictionary: starts with 'd'
  if (torrentBuffer[0] !== 0x64) return null;

  let pos = 1; // skip opening 'd'

  while (pos < torrentBuffer.length && torrentBuffer[pos] !== 0x65) { // 'e'
    // Decode key (byte string)
    const key = decodeString(torrentBuffer, pos);
    if (!key) return null;
    pos = key.end;

    const keyStr = key.value.toString('ascii');

    if (keyStr === 'info') {
      // Record start of info value
      const infoStart = pos;
      const infoEnd = skipValue(torrentBuffer, pos);
      if (infoEnd === -1) return null;

      // SHA1 hash the raw bytes of the info value
      const infoBytes = torrentBuffer.slice(infoStart, infoEnd);
      return crypto.createHash('sha1').update(infoBytes).digest('hex');
    }

    // Skip the value for non-info keys
    pos = skipValue(torrentBuffer, pos);
    if (pos === -1) return null;
  }

  // 'info' key not found
  return null;
}

module.exports = { extractInfoHashFromTorrent };
