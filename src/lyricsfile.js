const { parse } = require('yaml');

function isTimestamp(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function parseLyricsfile(source) {
  if (typeof source !== 'string' || source.length > 256_000) return [];

  const file = parse(source, { schema: 'core', maxAliasCount: 0 });
  if (file?.version !== '1.0' || !Array.isArray(file.lines)) return [];

  const lines = [];
  for (const line of file.lines) {
    if (typeof line?.text !== 'string' || !isTimestamp(line.start_ms)) continue;

    const result = { text: line.text, start: line.start_ms / 1000 };
    if (isTimestamp(line.end_ms) && line.end_ms > line.start_ms) {
      result.end = line.end_ms / 1000;
    }
    if (Array.isArray(line.words) && line.words.length &&
        line.words.every(word => typeof word?.text === 'string' && isTimestamp(word.start_ms)) &&
        line.words.map(word => word.text).join('') === line.text) {
      result.words = line.words.map(word => ({ text: word.text, start: word.start_ms / 1000 }));
    }
    lines.push(result);
  }
  return lines.sort((a, b) => a.start - b.start);
}

module.exports = { parseLyricsfile };
