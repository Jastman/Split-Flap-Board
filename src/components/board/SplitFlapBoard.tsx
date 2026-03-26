'use client';

import { useEffect, useRef, useState } from 'react';
import FlapRow from './FlapRow';
import type { AppConfig } from '@/types/config';

interface SplitFlapBoardProps {
  targetRows: string[];
  accentCols: number[];
  config: AppConfig;
  feedName?: string;
  feedIcon?: string;
  onWaveStart?: (colCount: number) => void;
}

export default function SplitFlapBoard({
  targetRows,
  accentCols,
  config,
  feedName,
  feedIcon,
  onWaveStart,
}: SplitFlapBoardProps) {
  const [displayedRows, setDisplayedRows] = useState<string[]>(() =>
    Array.from({ length: config.rows }, () => ' '.repeat(config.cols)),
  );
  const prevTargetRef = useRef<string[]>([]);
  const waveCalledRef = useRef(false);

  useEffect(() => {
    const prev = prevTargetRef.current;
    const changed = targetRows.some((row, i) => row !== prev[i]);
    if (!changed) return;

    // Trigger wave sound if rows changed
    if (onWaveStart && !waveCalledRef.current) {
      waveCalledRef.current = true;
      onWaveStart(config.cols);
      setTimeout(() => { waveCalledRef.current = false; }, 500);
    }

    setDisplayedRows(prev.length > 0 ? [...prev] : Array.from({ length: config.rows }, () => ' '.repeat(config.cols)));
    prevTargetRef.current = targetRows;
  }, [targetRows, config.cols, config.rows, onWaveStart]);

  // Sync displayedRows to targetRows after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedRows(targetRows.map((row) => row.padEnd(config.cols, ' ').slice(0, config.cols)));
    }, config.cols * config.waveDelay + SAFE_CHARS_MAX * config.flipSpeed + 200);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRows]);

  const SAFE_CHARS_MAX = 54; // max drum steps in one flip cycle

  const emptyRows = Array.from(
    { length: Math.max(0, config.rows - displayedRows.length) },
    () => ' '.repeat(config.cols),
  );

  const allCurrentRows = [...displayedRows, ...emptyRows].slice(0, config.rows);
  const allTargetRows = targetRows.slice(0, config.rows);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        background: config.boardBg,
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.3)',
        position: 'relative',
        gap: '2px',
      }}
    >
      {allCurrentRows.map((currentRow, rowIdx) => (
        <FlapRow
          key={rowIdx}
          currentRow={currentRow}
          targetRow={allTargetRows[rowIdx] ?? ' '.repeat(config.cols)}
          cols={config.cols}
          accentCols={rowIdx === 0 ? accentCols : []}
          config={config}
          waveDelay={config.waveDelay}
          onCellFlip={undefined}
        />
      ))}

      {/* Feed name overlay */}
      {feedName && (
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '8px',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            pointerEvents: 'none',
          }}
        >
          {feedIcon ? `[${feedIcon}] ` : ''}{feedName}
        </div>
      )}

      {/* Scan-line overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
          pointerEvents: 'none',
          borderRadius: '6px',
        }}
      />
    </div>
  );
}
