import { SAFE_CHARS } from '@/types/board';

/** Split a string into grapheme clusters (handles multi-byte emoji). */
function toGraphemes(str: string): string[] {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter().segment(str), (s) => s.segment);
  }
  return Array.from(str);
}

/**
 * Sanitize a string to only contain characters in SAFE_CHARS,
 * convert to uppercase, and replace unsupported chars with a space.
 */
export function sanitize(input: string): string {
  return toGraphemes(input.toUpperCase())
    .map((c) => (SAFE_CHARS.includes(c) ? c : ' '))
    .join('');
}

/**
 * Grapheme-aware length: count visual characters, not code units.
 */
export function gLen(str: string): number {
  return toGraphemes(str).length;
}

/**
 * Pad or truncate a string to exactly `cols` grapheme clusters.
 */
export function padRow(str: string, cols: number): string {
  const graphemes = toGraphemes(str);
  if (graphemes.length >= cols) return graphemes.slice(0, cols).join('');
  return str + ' '.repeat(cols - graphemes.length);
}

/**
 * Word-wrap `text` into lines of at most `cols` grapheme clusters.
 * Preserves existing newlines as explicit line breaks.
 */
export function wordWrap(text: string, cols: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (gLen(candidate) <= cols) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        if (gLen(word) > cols) {
          // Break a word that exceeds col width (grapheme-aware)
          const wordChars = toGraphemes(word);
          let remaining = wordChars;
          while (remaining.length > cols) {
            lines.push(remaining.slice(0, cols).join(''));
            remaining = remaining.slice(cols);
          }
          current = remaining.join('');
        } else {
          current = word;
        }
      }
    }
    if (current) lines.push(current);
  }

  return lines;
}

/**
 * Center-align a string within `cols` grapheme clusters.
 */
export function center(str: string, cols: number): string {
  const len = gLen(str);
  if (len >= cols) return toGraphemes(str).slice(0, cols).join('');
  const totalPad = cols - len;
  const leftPad = Math.floor(totalPad / 2);
  return ' '.repeat(leftPad) + str + ' '.repeat(totalPad - leftPad);
}

/**
 * Format arbitrary text into exactly `maxRows` padded rows of `cols` grapheme clusters each.
 */
export function formatForBoard(
  text: string,
  cols: number,
  maxRows: number,
  align: 'left' | 'center' = 'left',
): string[] {
  const sanitized = sanitize(text);
  const wrapped = wordWrap(sanitized, cols);
  const sliced = wrapped.slice(0, maxRows);

  return sliced.map((line) => {
    const aligned = align === 'center' ? center(line, cols) : line;
    return padRow(aligned, cols);
  });
}
