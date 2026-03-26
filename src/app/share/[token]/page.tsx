'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import SplitFlapBoard from '@/components/board/SplitFlapBoard';
import { useAudio } from '@/hooks/useAudio';
import type { BoardState } from '@/types/board';
import type { AppConfig } from '@/types/config';
import { DEFAULT_CONFIG } from '@/types/config';
import { use } from 'react';

interface ExtendedBoardState extends BoardState {
  config: AppConfig;
}

const POLL_INTERVAL = 5000;

function useSharedBoardState(token: string) {
  const [state, setState] = useState<ExtendedBoardState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const revisionRef = useRef(-1);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/share/board?token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        setError(res.status === 403 ? 'This board is no longer shared.' : `Error ${res.status}`);
        return;
      }
      const data = (await res.json()) as ExtendedBoardState;
      if (data.revision !== revisionRef.current) {
        revisionRef.current = data.revision;
        setState(data);
      }
      setError(null);
    } catch (err) {
      setError(String(err));
    }
  }, [token]);

  useEffect(() => {
    fetchState();
    const schedule = () => {
      pollTimerRef.current = setTimeout(() => {
        fetchState().then(schedule);
      }, POLL_INTERVAL);
    };
    schedule();
    return () => clearTimeout(pollTimerRef.current);
  }, [fetchState]);

  return { state, error, config: state?.config ?? DEFAULT_CONFIG };
}

export default function SharedBoardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { state, error, config } = useSharedBoardState(token);
  const { scheduleWave, isEnabled: audioEnabled, isReady: audioReady, enable, toggle: toggleAudio } =
    useAudio(config.audioEnabled, config.audioVolume);
  const [showClickHint, setShowClickHint] = useState(true);
  const [containerH, setContainerH] = useState('100svh');
  const [prevRevision, setPrevRevision] = useState(-1);

  useEffect(() => {
    if (audioReady) setShowClickHint(false);
  }, [audioReady]);

  useEffect(() => {
    const update = () => setContainerH(`${window.innerHeight}px`);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleFirstClick = useCallback(() => {
    enable();
    setShowClickHint(false);
  }, [enable]);

  const handleWaveStart = useCallback(
    (cols: number) => {
      if (audioEnabled) scheduleWave(cols, config.waveDelay);
    },
    [audioEnabled, scheduleWave, config.waveDelay],
  );

  useEffect(() => {
    if (state && state.revision !== prevRevision) {
      setPrevRevision(state.revision);
      handleWaveStart(config.cols);
    }
  }, [state, prevRevision, handleWaveStart, config.cols]);

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

      {state && (
        <SplitFlapBoard
          targetRows={state.rows}
          accentCols={state.accentCols}
          config={config}
          feedName={state.feedName}
          feedIcon={state.feedIcon}
          onWaveStart={handleWaveStart}
        />
      )}

      {error && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem',
          fontFamily: 'monospace', letterSpacing: '0.1em',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Sound hint */}
      {showClickHint && state && (
        <div style={{
          position: 'absolute', bottom: '3.5rem', left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem',
          fontFamily: 'monospace', letterSpacing: '0.15em',
          pointerEvents: 'none', whiteSpace: 'nowrap',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          CLICK ANYWHERE TO ENABLE SOUND
        </div>
      )}

      {/* Sound toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
        style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontFamily: 'monospace',
          padding: '0.3rem 0.6rem', cursor: 'pointer', borderRadius: '3px',
          letterSpacing: '0.1em', zIndex: 100,
        }}
      >
        {audioEnabled ? 'SND ON' : 'SND OFF'}
      </button>

      {/* "Powered by Flipflap" attribution */}
      <a
        href="/"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: '1rem', left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem',
          fontFamily: 'monospace', letterSpacing: '0.12em',
          textDecoration: 'none', whiteSpace: 'nowrap',
          zIndex: 100,
        }}
      >
        POWERED BY FLIPFLAP
      </a>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
}
