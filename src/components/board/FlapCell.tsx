'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { DRUM_CHARS } from '@/types/board';

interface FlapCellProps {
  char: string;
  targetChar: string;
  isAccent: boolean;
  accentColor: string;
  cellBg: string;
  charColor: string;
  cellWidth: string;
  cellHeight: string;
  fontFamily: string;
  flipSpeed: number;
  flipDelay: number;
  onFlipStart?: () => void;
  /** Increment to trigger a ghost flip even when char===targetChar (Matrix effect). */
  ghostTrigger?: number;
}

function getCharIndex(c: string): number {
  const idx = DRUM_CHARS.indexOf(c);
  return idx === -1 ? 0 : idx;
}

/** Build the shortest-path cycle (forward or backward) from `from` to `to`. */
function buildCycle(from: string, to: string): string[] {
  if (from === to) return [];
  const n = DRUM_CHARS.length;
  const fromIdx = getCharIndex(from);
  const toIdx = getCharIndex(to);

  const forwardSteps = (toIdx - fromIdx + n) % n;
  const backwardSteps = (fromIdx - toIdx + n) % n;

  const cycle: string[] = [];
  if (forwardSteps <= backwardSteps) {
    for (let i = 1; i <= forwardSteps; i++) {
      cycle.push(DRUM_CHARS[(fromIdx + i) % n]);
    }
  } else {
    for (let i = 1; i <= backwardSteps; i++) {
      cycle.push(DRUM_CHARS[(fromIdx - i + n) % n]);
    }
  }
  return cycle;
}

export default function FlapCell({
  char,
  targetChar,
  isAccent,
  accentColor,
  cellBg,
  charColor,
  cellWidth,
  cellHeight,
  fontFamily,
  flipSpeed,
  flipDelay,
  onFlipStart,
  ghostTrigger,
}: FlapCellProps) {
  const [displayChar, setDisplayChar] = useState(char);
  const [isFlipping, setIsFlipping] = useState(false);
  const cycleRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const animTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const ghostTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const startedRef = useRef(false);

  const runNextFlip = useCallback(() => {
    if (cycleRef.current.length === 0) {
      setIsFlipping(false);
      startedRef.current = false;
      return;
    }

    const next = cycleRef.current.shift()!;
    const isLast = cycleRef.current.length === 0;
    const duration = isLast ? Math.max(flipSpeed, 80) : Math.max(flipSpeed * 0.6, 40);

    setIsFlipping(true);

    animTimerRef.current = setTimeout(() => {
      setDisplayChar(next);
      setIsFlipping(false);

      if (cycleRef.current.length > 0) {
        timerRef.current = setTimeout(runNextFlip, 10);
      } else {
        startedRef.current = false;
      }
    }, duration);
  }, [flipSpeed]);

  // Ghost flap — triggered for cells that don't change (Matrix "digital rain")
  useEffect(() => {
    if (!ghostTrigger || char !== targetChar) return;
    clearTimeout(ghostTimerRef.current);
    const flipDur = Math.max(flipSpeed * 0.6, 40);
    ghostTimerRef.current = setTimeout(() => {
      setIsFlipping(true);
      ghostTimerRef.current = setTimeout(() => setIsFlipping(false), flipDur);
    }, flipDelay);
    return () => clearTimeout(ghostTimerRef.current);
  }, [ghostTrigger, char, targetChar, flipDelay, flipSpeed]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(animTimerRef.current);
      clearTimeout(ghostTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (char === targetChar) {
      // Board forced a snap (sync timer) — immediately show the settled char
      clearTimeout(timerRef.current);
      clearTimeout(animTimerRef.current);
      setDisplayChar(targetChar);
      setIsFlipping(false);
      startedRef.current = false;
      return;
    }

    // Cancel any in-flight animation before starting a new one
    clearTimeout(timerRef.current);
    clearTimeout(animTimerRef.current);
    startedRef.current = false;
    setIsFlipping(false);

    cycleRef.current = buildCycle(char, targetChar);
    if (cycleRef.current.length === 0) return;

    timerRef.current = setTimeout(() => {
      startedRef.current = true;
      onFlipStart?.();
      runNextFlip();
    }, flipDelay);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(animTimerRef.current);
      startedRef.current = false;
    };
  }, [char, targetChar, flipDelay, runNextFlip, onFlipStart]);

  const topBg = isAccent ? accentColor : cellBg;
  const bottomBg = cellBg;

  const charStyle: React.CSSProperties = {
    fontFamily,
    color: charColor,
    fontSize: `calc(${cellHeight} * 0.55)`,
    lineHeight: 1,
    userSelect: 'none',
    WebkitFontSmoothing: 'antialiased',
  };

  const displayStr = displayChar === ' ' ? '\u00A0' : displayChar;
  const targetStr = targetChar === ' ' ? '\u00A0' : targetChar;

  return (
    <div
      style={{
        width: cellWidth,
        height: cellHeight,
        position: 'relative',
        perspective: '400px',
        margin: '1px',
        borderRadius: '3px',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Top half — shows current char top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: topBg,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '1px',
          boxSizing: 'border-box',
          borderBottom: '1px solid rgba(0,0,0,0.8)',
        }}
      >
        <span style={{ ...charStyle, transform: 'translateY(50%)' }}>
          {displayStr}
        </span>
      </div>

      {/* Bottom half — shows next char bottom (revealed after flip) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: bottomBg,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '1px',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ ...charStyle, transform: 'translateY(-50%)' }}>
          {targetStr}
        </span>
      </div>

      {/* Animated flap panel — covers bottom half, folds down to reveal new char */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: '50%',
          transformOrigin: 'top center',
          transformStyle: 'preserve-3d',
          transform: isFlipping ? 'rotateX(-180deg)' : 'rotateX(0deg)',
          transition: isFlipping
            ? `transform ${Math.max(flipSpeed * 0.6, 40)}ms cubic-bezier(0.4, 0, 0.6, 1)`
            : 'none',
          zIndex: 10,
        }}
      >
        {/* Front face: bottom half of current char */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: bottomBg,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '1px',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ ...charStyle, transform: 'translateY(-50%)' }}>
            {displayStr}
          </span>
        </div>

        {/* Back face: top half of target char */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: topBg,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '1px',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ ...charStyle, transform: 'translateY(50%)' }}>
            {targetStr}
          </span>
        </div>
      </div>

      {/* Subtle shadow at the fold line */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: '2px',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 20,
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
