'use client';

import FlapCell from './FlapCell';
import type { AppConfig } from '@/types/config';

interface FlapRowProps {
  currentRow: string;
  targetRow: string;
  cols: number;
  accentCols: number[];
  config: AppConfig;
  waveDelay: number;
  onCellFlip?: () => void;
}

export default function FlapRow({
  currentRow,
  targetRow,
  cols,
  accentCols,
  config,
  waveDelay,
  onCellFlip,
}: FlapRowProps) {
  const current = currentRow.padEnd(cols, ' ').slice(0, cols);
  const target = targetRow.padEnd(cols, ' ').slice(0, cols);

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
          flipDelay={colIdx * waveDelay}
          onFlipStart={onCellFlip}
        />
      ))}
    </div>
  );
}
