'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { BoardState } from '@/types/board';
import type { AppConfig } from '@/types/config';
import { DEFAULT_CONFIG } from '@/types/config';

interface ExtendedBoardState extends BoardState {
  config: AppConfig;
}

const POLL_INTERVAL = 5000;

export function useBoardState() {
  const [state, setState] = useState<ExtendedBoardState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const revisionRef = useRef(-1);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/board');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ExtendedBoardState;

      if (data.revision !== revisionRef.current) {
        revisionRef.current = data.revision;
        setState(data);
      }
      setError(null);
    } catch (err) {
      setError(String(err));
    }
  }, []);

  useEffect(() => {
    fetchState();

    const schedule = () => {
      pollTimerRef.current = setTimeout(() => {
        fetchState().then(schedule);
      }, POLL_INTERVAL);
    };
    schedule();

    return () => {
      clearTimeout(pollTimerRef.current);
    };
  }, [fetchState]);

  return {
    state,
    error,
    config: state?.config ?? DEFAULT_CONFIG,
    refetch: fetchState,
  };
}
