'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SAFE_CHARS } from '@/types/board';

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
}

function getCharIndex(c: string): number {
  const idx = SAFE_CHARS.indexOf(c);
  return idx === -1 ? 0 : idx;
}

function nextChar(current: string): string {
  const idx = getCharIndex(current);
  return SAFE_CHARS[(idx + 1) % SAFE_CHARS.length];
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
}: FlapCellProps) {
  const [displayChar, setDisplayChar] = useState(char);
  const [isFlipping, setIsFlipping] = useState(false);
  const cycleRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const animTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const startedRef = useRef(false);

  const buildCycle = useCallback((from: string, to: string): string[] => {
    if (from === to) return [];
    const cycle: string[] = [];
    let c = from;
    let safety = SAFE_CHARS.length + 1;
    while (c !== to && safety-- > 0) {
      c = nextChar(c);
      cycle.push(c);
    }
    return cycle;
  }, []);

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

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(animTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (char === targetChar) return;

    cycleRef.current = buildCycle(char, targetChar);

    if (cycleRef.current.length === 0) return;

    timerRef.current = setTimeout(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        onFlipStart?.();
        runNextFlip();
      }
    }, flipDelay);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [char, targetChar, flipDelay, buildCycle, runNextFlip, onFlipStart]);

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
        <span
          style={{
            ...charStyle,
            transform: 'translateY(50%)',
          }}
        >
          {displayChar === ' ' ? '\u00A0' : displayChar}
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
        <span
          style={{
            ...charStyle,
            transform: 'translateY(-50%)',
          }}
        >
          {targetChar === ' ' ? '\u00A0' : targetChar}
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
          <span
            style={{
              ...charStyle,
              transform: 'translateY(-50%)',
            }}
          >
            {displayChar === ' ' ? '\u00A0' : displayChar}
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
          <span
            style={{
              ...charStyle,
              transform: 'translateY(50%)',
            }}
          >
            {targetChar === ' ' ? '\u00A0' : targetChar}
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
