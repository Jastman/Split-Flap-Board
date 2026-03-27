'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import FlapRow from './FlapRow';
import { DRUM_CHARS } from '@/types/board';

interface ClockConfig {
  cols: number;
  rows: number;
  cellWidth: string;
  cellHeight: string;
  flipSpeed: number;
  waveDelay: number;
  accentColor: string;
  boardBg: string;
  cellBg: string;
  charColor: string;
  fontFamily: string;
}

interface ClockBoardProps {
  targetRows: string[];
  config: ClockConfig;
  onWaveStart?: (colCount: number) => void;
}

export default function ClockBoard({ targetRows, config, onWaveStart }: ClockBoardProps) {
  const [displayedRows, setDisplayedRows] = useState<string[]>(() =>
    Array.from({ length: config.rows }, () => ' '.repeat(config.cols)),
  );
  const [scale, setScale] = useState(1);
  const prevTargetRef = useRef<string[]>([]);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const waveCalledRef = useRef(false);

  const computeScale = useCallback(() => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const parse = (s: string) => s.endsWith('rem') ? parseFloat(s) * rem : parseFloat(s);
    const cellW = parse(config.cellWidth) + 2;
    const cellH = parse(config.cellHeight) + 2;
    const naturalW = config.cols * cellW + 24;
    const naturalH = config.rows * cellH + 24 + (config.rows - 1) * 2;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const s = Math.min((vw * 0.96) / naturalW, (vh * 0.9) / naturalH, 2.5);
    setScale(Math.max(s, 0.25));
  }, [config.cols, config.rows, config.cellWidth, config.cellHeight]);

  useEffect(() => {
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [computeScale]);

  useEffect(() => {
    const prev = prevTargetRef.current;
    const changed = targetRows.some((row, i) => row !== prev[i]);
    if (!changed) return;

    if (onWaveStart && !waveCalledRef.current) {
      waveCalledRef.current = true;
      onWaveStart(config.cols);
      setTimeout(() => { waveCalledRef.current = false; }, 300);
    }

    // Snap displayedRows from previous target so FlapCell knows its start position
    setDisplayedRows(prev.length > 0
      ? prev.map((r) => r.padEnd(config.cols, ' ').slice(0, config.cols))
      : Array.from({ length: config.rows }, () => ' '.repeat(config.cols)),
    );
    prevTargetRef.current = targetRows;

    // Short sync: just enough time for a single-step flip to complete
    // Max steps for a clock = ~5 (digit 9→0 = 1 step forward, rarely more)
    const maxSteps = Math.min(Math.ceil(DRUM_CHARS.length / 2), 6);
    const syncDelay = config.waveDelay * config.cols + maxSteps * config.flipSpeed + 150;

    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      setDisplayedRows(
        targetRows.map((r) => r.padEnd(config.cols, ' ').slice(0, config.cols)),
      );
    }, syncDelay);

    return () => clearTimeout(syncTimerRef.current);
  }, [targetRows, config.cols, config.rows, config.waveDelay, config.flipSpeed, onWaveStart]);

  const allCurrentRows = [
    ...displayedRows,
    ...Array.from({ length: Math.max(0, config.rows - displayedRows.length) }, () => ' '.repeat(config.cols)),
  ].slice(0, config.rows);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
        display: 'inline-flex',
        flexDirection: 'column',
        background: config.boardBg,
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.3)',
        gap: '2px',
      }}
    >
      {allCurrentRows.map((currentRow, rowIdx) => (
        <FlapRow
          key={rowIdx}
          currentRow={currentRow}
          targetRow={targetRows[rowIdx] ?? ' '.repeat(config.cols)}
          cols={config.cols}
          accentCols={[]}
          config={{
            ...config,
            id: 1 as const,
            latitude: 0,
            longitude: 0,
            timezone: 'UTC',
            fontSize: 1,
            brightness: 1,
            presetId: 'clock',
            rotationInterval: 0,
            audioEnabled: false,
            audioVolume: 0,
            textHAlign: 'center',
            textVAlign: 'top',
          }}
          cellDelays={Array.from({ length: config.cols }, (_, i) => i * config.waveDelay)}
          onCellFlip={undefined}
        />
      ))}

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
