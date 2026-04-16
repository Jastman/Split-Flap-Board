'use client';

import FlapCell from './FlapCell';
import type { AppConfig } from '@/types/config';

interface FlapRowProps {
  currentRow: string;
  targetRow: string;
  cols: number;
  accentCols: number[];
  config: AppConfig;
  /** Per-column start delays (ms). Length must equal cols. */
  cellDelays: number[];
  onCellFlip?: () => void;
  /** Increment to trigger ghost flips on unchanged cells (Matrix effect). */
  ghostTrigger?: number;
}

/** Split a string into an array of grapheme clusters (handles emoji). */
function toGraphemes(str: string): string[] {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter().segment(str), (s) => s.segment);
  }
  return Array.from(str);
}

/** Return exactly `cols` grapheme tokens, padding with spaces or truncating. */
function toColArray(row: string, cols: number): string[] {
  const graphemes = toGraphemes(row);
  if (graphemes.length >= cols) return graphemes.slice(0, cols);
  return [...graphemes, ...Array(cols - graphemes.length).fill(' ')];
}

export default function FlapRow({
  currentRow,
  targetRow,
  cols,
  accentCols,
  config,
  cellDelays,
  onCellFlip,
  ghostTrigger,
}: FlapRowProps) {
  const current = toColArray(currentRow, cols);
  const target = toColArray(targetRow, cols);

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {Array.from({ length: cols }).map((_, colIdx) => (
        <FlapCell
          key={colIdx}
          char={current[colIdx] ?? ' '}
          targetChar={target[colIdx] ?? ' '}
          isAccent={accentCols.includes(colIdx)}
          accentColor={config.accentColor}
          cellBg={config.cellBg}
          charColor={config.charColor}
          cellWidth={config.cellWidth}
          cellHeight={config.cellHeight}
          fontFamily={config.fontFamily}
          flipSpeed={config.flipSpeed}
          flipDelay={cellDelays[colIdx] ?? 0}
          onFlipStart={onCellFlip}
          ghostTrigger={ghostTrigger}
        />
      ))}
    </div>
  );
}
