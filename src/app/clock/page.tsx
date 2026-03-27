'use client';

import { useEffect, useState, useCallback } from 'react';
import ClockBoard from '@/components/board/ClockBoard';
import { useAudio } from '@/hooks/useAudio';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// 8 cols: " HH:MM:SS " — wide cells, each digit is physically satisfying to flip
const COLS = 10;

const CLOCK_CONFIG = {
  cols: COLS,
  rows: 2,
  cellWidth: '4rem',
  cellHeight: '7rem',
  // Slower flip speed = more satisfying mechanical sound and visual
  flipSpeed: 140,
  // Small wave delay so digits ripple left-to-right, like an airport board
  waveDelay: 18,
  accentColor: '#e85d04',
  boardBg: '#1a1a1a',
  cellBg: '#111111',
  charColor: '#f5f0e8',
  fontFamily: "'Courier Prime', 'Courier New', monospace",
};

function getClockRows(): string[] {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  // " HH:MM:SS " — space padding to fill COLS
  const timeStr = ` ${h}:${m}:${s} `;

  const day = DAYS[now.getDay()];
  const mon = MONTHS[now.getMonth()];
  const dd = String(now.getDate()).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  // " FRI MAR 27" → pad to COLS
  const raw = `${day} ${mon} ${dd} ${yyyy}`;
  const pad = Math.max(0, COLS - raw.length);
  const l = Math.floor(pad / 2);
  const dateStr = ' '.repeat(l) + raw + ' '.repeat(pad - l);

  return [timeStr.slice(0, COLS).padEnd(COLS), dateStr.slice(0, COLS).padEnd(COLS)];
}

export default function ClockPage() {
  const [rows, setRows] = useState<string[]>(() => getClockRows());
  const [containerH, setContainerH] = useState('100svh');
  const [showClickHint, setShowClickHint] = useState(true);

  const { scheduleWave, isEnabled: audioEnabled, isReady: audioReady, enable, toggle: toggleAudio } =
    useAudio(true, 0.7);

  useEffect(() => {
    if (audioReady) setShowClickHint(false);
  }, [audioReady]);

  const handleFirstClick = useCallback(() => {
    enable();
    setShowClickHint(false);
  }, [enable]);

  useEffect(() => {
    const update = () => setContainerH(`${window.innerHeight}px`);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    // Align to the start of each second
    const msUntilNextSec = 1000 - (Date.now() % 1000);
    let interval: ReturnType<typeof setInterval>;

    const tick = () => {
      setRows(getClockRows());
    };

    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 1000);
    }, msUntilNextSec);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const handleWave = useCallback(
    (cols: number) => {
      if (audioEnabled) scheduleWave(cols, CLOCK_CONFIG.waveDelay);
    },
    [audioEnabled, scheduleWave],
  );

  return (
    <div
      onClick={handleFirstClick}
      style={{
        width: '100vw',
        height: containerH,
        background: '#0a0a0a',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'default',
      }}
    >
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none', zIndex: 50,
      }} />

      <ClockBoard
        targetRows={rows}
        config={CLOCK_CONFIG}
        onWaveStart={handleWave}
      />

      {/* Sound hint */}
      {showClickHint && (
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem',
          fontFamily: 'monospace', letterSpacing: '0.15em',
          pointerEvents: 'none', whiteSpace: 'nowrap',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          CLICK ANYWHERE TO ENABLE SOUND
        </div>
      )}

      {/* Controls */}
      <div style={{
        position: 'absolute', top: '1rem', right: '1rem',
        display: 'flex', gap: '0.5rem', zIndex: 100,
      }}>
        <button onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontFamily: 'monospace',
            padding: '0.3rem 0.6rem', cursor: 'pointer', borderRadius: '3px', letterSpacing: '0.1em',
          }}>
          {audioEnabled ? 'SND ON' : 'SND OFF'}
        </button>
        <a href="/board" onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontFamily: 'monospace',
            padding: '0.3rem 0.6rem', cursor: 'pointer', borderRadius: '3px',
            letterSpacing: '0.1em', textDecoration: 'none',
          }}>
          BOARD
        </a>
        <a href="/config" onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontFamily: 'monospace',
            padding: '0.3rem 0.6rem', cursor: 'pointer', borderRadius: '3px',
            letterSpacing: '0.1em', textDecoration: 'none',
          }}>
          SETTINGS
        </a>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
}
