import { SAFE_CHARS } from '@/types/board';

/**
 * Sanitize a string to only contain characters in the flap drum charset,
 * convert to uppercase, and replace unsupported chars with space.
 */
export function sanitize(input: string): string {
  return input
    .toUpperCase()
    .split('')
    .map((c) => (SAFE_CHARS.includes(c) ? c : ' '))
    .join('');
}

/**
 * Pad or truncate a string to exactly `cols` characters.
 */
export function padRow(str: string, cols: number): string {
  if (str.length >= cols) return str.slice(0, cols);
  return str + ' '.repeat(cols - str.length);
}

/**
 * Word-wrap `text` into lines of at most `cols` characters.
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
      if (candidate.length <= cols) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        // If word itself is longer than cols, break it
        if (word.length > cols) {
          let remaining = word;
          while (remaining.length > cols) {
            lines.push(remaining.slice(0, cols));
            remaining = remaining.slice(cols);
          }
          current = remaining;
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
 * Center-align a string within `cols` characters.
 */
export function center(str: string, cols: number): string {
  if (str.length >= cols) return str.slice(0, cols);
  const totalPad = cols - str.length;
  const leftPad = Math.floor(totalPad / 2);
  return ' '.repeat(leftPad) + str + ' '.repeat(totalPad - leftPad);
}

/**
 * Format arbitrary text into exactly `maxRows` padded rows of `cols` chars each.
 * @param text - raw text (may include newlines)
 * @param cols - board column count
 * @param maxRows - maximum rows to return
 * @param align - 'left' or 'center'
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
