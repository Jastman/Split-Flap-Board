export type AnimationPattern =
  | 'wave-lr'
  | 'wave-rl'
  | 'top-bottom'
  | 'spiral'
  | 'hatch'
  | 'snake-up'
  | 'matrix'
  | 'row-by-row'
  | 'dissolve'
  | 'diagonal'
  | 'middle-out';

export type TextHAlign = 'left' | 'center' | 'right' | 'justify';
export type TextVAlign = 'top' | 'middle' | 'bottom';

export const ALL_PATTERNS: AnimationPattern[] = [
  'wave-lr',
  'wave-rl',
  'top-bottom',
  'spiral',
  'hatch',
  'snake-up',
  'matrix',
  'row-by-row',
  'dissolve',
  'diagonal',
  'middle-out',
];

export function pickRandomPattern(from?: AnimationPattern[]): AnimationPattern {
  const pool = from && from.length > 0 ? from : ALL_PATTERNS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Compute per-cell flip start delays (ms).
 * Returns a 2-D array: delays[row][col].
 * `step` is the wave-delay unit (ms) — same as config.waveDelay.
 */
export function computeDelays(
  pattern: AnimationPattern,
  rows: number,
  cols: number,
  step: number,
): number[][] {
  const d: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  switch (pattern) {
    // ─────────────────────────────────────────── Left → Right (original wave)
    case 'wave-lr':
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          d[r][c] = c * step;
      break;

    // ─────────────────────────────────────────── Right → Left
    case 'wave-rl':
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          d[r][c] = (cols - 1 - c) * step;
      break;

    // ─────────────────────────────────────────── Top → Bottom (row sweep)
    case 'top-bottom': {
      const rowGap = step * Math.max(cols * 0.4, 6);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          d[r][c] = r * rowGap + c * step * 0.25;
      break;
    }

    // ─────────────────────────────────────────── Spiral (outer → inner)
    case 'spiral': {
      const order = new Array(rows * cols).fill(0);
      let top = 0, bottom = rows - 1, left = 0, right = cols - 1, i = 0;
      while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c++) order[top * cols + c] = i++;
        top++;
        for (let r = top; r <= bottom; r++) order[r * cols + right] = i++;
        right--;
        if (top <= bottom) {
          for (let c = right; c >= left; c--) order[bottom * cols + c] = i++;
          bottom--;
        }
        if (left <= right) {
          for (let r = bottom; r >= top; r--) order[r * cols + left] = i++;
          left++;
        }
      }
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          d[r][c] = order[r * cols + c] * step * 0.28;
      break;
    }

    // ─────────────────────────────────────────── Hatch (checkerboard)
    case 'hatch':
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          d[r][c] = (r + c) % 2 === 0 ? 0 : step * 5;
      break;

    // ─────────────────────────────────────────── Snake Up (S-curve from bottom-right)
    case 'snake-up':
      for (let r = 0; r < rows; r++) {
        const rb = rows - 1 - r;
        for (let c = 0; c < cols; c++) {
          const pos = rb % 2 === 0 ? cols - 1 - c : c;
          d[r][c] = (rb * cols + pos) * step * 0.28;
        }
      }
      break;

    // ─────────────────────────────────────────── Matrix (digital rain by column)
    case 'matrix': {
      for (let c = 0; c < cols; c++) {
        const colStart = Math.random() * step * cols * 0.55;
        for (let r = 0; r < rows; r++)
          d[r][c] = colStart + r * step * 0.45;
      }
      break;
    }

    // ─────────────────────────────────────────── Row-by-Row
    case 'row-by-row': {
      const rowGap = cols * step * 0.45;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          d[r][c] = r * rowGap + c * step * 0.08;
      break;
    }

    // ─────────────────────────────────────────── Dissolve (random)
    case 'dissolve':
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          d[r][c] = Math.random() * step * cols * 0.65;
      break;

    // ─────────────────────────────────────────── Diagonal (x+y wipe)
    case 'diagonal':
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          d[r][c] = (r + c) * step;
      break;

    // ─────────────────────────────────────────── Middle-Out (expanding ring)
    case 'middle-out': {
      const cx = (cols - 1) / 2;
      const cy = (rows - 1) / 2;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const dist = Math.max(Math.abs(c - cx), Math.abs(r - cy));
          d[r][c] = dist * step * 1.7;
        }
      break;
    }
  }

  return d;
}

/** Maximum delay in a 2-D delay matrix. */
export function maxDelay(delays: number[][]): number {
  return delays.reduce((m, row) => Math.max(m, ...row), 0);
}

// ─── Alignment ───────────────────────────────────────────────────────────────

/** Grapheme-safe length (handles emoji/multi-byte in our drum charset). */
function gLen(s: string): number {
  if (typeof Intl !== 'undefined' && (Intl as unknown as Record<string, unknown>).Segmenter) {
    return Array.from(
      new (Intl as unknown as { Segmenter: new () => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter().segment(s),
      () => 1,
    ).length;
  }
  return Array.from(s).length;
}

function hAlignRow(text: string, cols: number, align: TextHAlign): string {
  const len = gLen(text);
  if (len >= cols) return text;
  const gap = cols - len;
  switch (align) {
    case 'right':
      return ' '.repeat(gap) + text;
    case 'center': {
      const left = Math.floor(gap / 2);
      return ' '.repeat(left) + text + ' '.repeat(gap - left);
    }
    case 'justify': {
      const words = text.split(/\s+/).filter(Boolean);
      if (words.length <= 1) return text + ' '.repeat(gap);
      const wordLen = words.reduce((s, w) => s + gLen(w), 0);
      const spaces = cols - wordLen;
      const gaps = words.length - 1;
      const base = Math.floor(spaces / gaps);
      const extra = spaces % gaps;
      return words.reduce((acc, w, i) => {
        if (i === 0) return w;
        return acc + ' '.repeat(base + (i - 1 < extra ? 1 : 0)) + w;
      }, '');
    }
    default: // 'left'
      return text + ' '.repeat(gap);
  }
}

/**
 * Apply horizontal and vertical alignment to board rows.
 * Feeds produce left-padded rows; this trims and re-aligns them.
 */
export function alignRows(
  rows: string[],
  cols: number,
  hAlign: TextHAlign,
  vAlign: TextVAlign,
  totalRows: number,
): string[] {
  const blank = ' '.repeat(cols);

  const hAligned = rows.map((row) => {
    const trimmed = row.trim();
    return trimmed ? hAlignRow(trimmed, cols, hAlign) : blank;
  });

  const contentRows = hAligned.filter((r) => r.trim().length > 0);
  const padCount = Math.max(0, totalRows - contentRows.length);

  let result: string[];
  switch (vAlign) {
    case 'bottom':
      result = [...Array(padCount).fill(blank), ...contentRows];
      break;
    case 'middle': {
      const topPad = Math.floor(padCount / 2);
      result = [...Array(topPad).fill(blank), ...contentRows, ...Array(totalRows).fill(blank)];
      break;
    }
    default: // 'top'
      result = [...contentRows, ...Array(padCount).fill(blank)];
  }

  while (result.length < totalRows) result.push(blank);
  return result.slice(0, totalRows);
}
