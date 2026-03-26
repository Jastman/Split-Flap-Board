'use client';

import { useCallback, useEffect, useState } from 'react';
import SplitFlapBoard from '@/components/board/SplitFlapBoard';
import { useBoardState } from '@/hooks/useBoardState';
import { useAudio } from '@/hooks/useAudio';

export default function BoardPage() {
  const { state, error, config } = useBoardState();
  const { scheduleWave, isEnabled: audioEnabled, isReady: audioReady, enable, toggle: toggleAudio } = useAudio(
    config.audioEnabled,
    config.audioVolume,
  );
  const [showClickHint, setShowClickHint] = useState(true);
  const [prevRevision, setPrevRevision] = useState(-1);
  const [showLocPrompt, setShowLocPrompt] = useState(false);

  // Show location prompt if still on default NYC coords
  useEffect(() => {
    if (config.latitude === 40.7128 && config.longitude === -74.006) {
      const timer = setTimeout(() => setShowLocPrompt(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowLocPrompt(false);
    }
  }, [config.latitude, config.longitude]);

  // Hide click hint once audio is ready
  useEffect(() => {
    if (audioReady) setShowClickHint(false);
  }, [audioReady]);

  const handleFirstClick = useCallback(() => {
    enable();
    setShowClickHint(false);
  }, [enable]);

  const handleWaveStart = useCallback(
    (cols: number) => {
      if (audioEnabled) {
        scheduleWave(cols, config.waveDelay);
      }
    },
    [audioEnabled, scheduleWave, config.waveDelay],
  );

  // Trigger wave sound on state change
  useEffect(() => {
    if (state && state.revision !== prevRevision) {
      setPrevRevision(state.revision);
      handleWaveStart(config.cols);
    }
  }, [state, prevRevision, handleWaveStart, config.cols]);

  const targetRows = state?.rows ?? [
    ' '.repeat(config.cols),
    ' '.repeat(config.cols),
    ' '.repeat(config.cols),
  ];

  return (
    <div
      onClick={handleFirstClick}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Vignette overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />

      <SplitFlapBoard
        targetRows={targetRows}
        accentCols={state?.accentCols ?? []}
        config={config}
        feedName={state?.feedName}
        feedIcon={state?.feedIcon}
        onWaveStart={handleWaveStart}
      />

      {/* Sound hint */}
      {showClickHint && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            letterSpacing: '0.15em',
            pointerEvents: 'none',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          CLICK ANYWHERE TO ENABLE SOUND
        </div>
      )}

      {/* Location prompt */}
      {showLocPrompt && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(20,20,20,0.92)',
            border: '1px solid rgba(232,93,4,0.4)',
            borderRadius: '4px',
            padding: '0.6rem 1rem',
            zIndex: 100,
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
            USING DEFAULT LOCATION (NEW YORK)
          </span>
          <a
            href="/config/display"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#e85d04',
              color: '#fff',
              fontSize: '0.65rem',
              fontFamily: 'monospace',
              padding: '0.2rem 0.6rem',
              borderRadius: '3px',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}
          >
            SET MY LOCATION →
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); setShowLocPrompt(false); }}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', fontSize: '0.8rem', padding: '0 0.25rem',
            }}
          >✕</button>
        </div>
      )}

      {/* Error state */}
      {error && !state && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            color: 'rgba(255,80,80,0.6)',
            fontSize: '0.65rem',
            fontFamily: 'monospace',
          }}
        >
          CONNECTION ERROR — RETRYING
        </div>
      )}

      {/* Controls overlay */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 100,
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            padding: '0.3rem 0.6rem',
            cursor: 'pointer',
            borderRadius: '3px',
            letterSpacing: '0.1em',
          }}
        >
          {audioEnabled ? 'SND ON' : 'SND OFF'}
        </button>
        <a
          href="/config"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            padding: '0.3rem 0.6rem',
            cursor: 'pointer',
            borderRadius: '3px',
            letterSpacing: '0.1em',
            textDecoration: 'none',
          }}
        >
          SETTINGS
        </a>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
