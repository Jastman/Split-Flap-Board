'use client';

import { useEffect, useState, useCallback } from 'react';

interface ScheduleSlot {
  id: number;
  position: number;
  feed_id: string | null;
  message_id: number | null;
  duration: number;
  enabled: number;
}

interface Feed {
  id: string;
  label: string;
  type: string;
}

export default function SchedulePage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/schedule').then((r) => r.json()),
      fetch('/api/feeds').then((r) => r.json()),
    ]).then(([s, f]) => {
      setSlots(s);
      setFeeds(f);
    });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    await fetch('/api/schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        slots.map((s) => ({
          feed_id: s.feed_id,
          message_id: s.message_id,
          duration: s.duration,
          enabled: Boolean(s.enabled),
        })),
      ),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [slots]);

  const moveSlot = useCallback((idx: number, dir: -1 | 1) => {
    const next = [...slots];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSlots(next.map((s, i) => ({ ...s, position: i })));
  }, [slots]);

  const updateSlot = useCallback((idx: number, patch: Partial<ScheduleSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }, []);

  const getFeedLabel = (feedId: string | null) => {
    if (!feedId) return '—';
    return feeds.find((f) => f.id === feedId)?.label ?? feedId;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.15em', margin: 0 }}>SCHEDULE</h1>
          <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Rotation order — feeds that are not timely are automatically skipped
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{
            background: '#e85d04', border: 'none', color: '#fff',
            padding: '0.5rem 1.25rem', borderRadius: '4px',
            cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8rem',
            letterSpacing: '0.1em',
          }}
        >
          {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {slots.map((slot, idx) => (
          <div
            key={slot.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#181818',
              border: `1px solid ${slot.enabled ? '#2a2a2a' : '#1a1a1a'}`,
              borderRadius: '4px',
              padding: '0.6rem 1rem',
              opacity: slot.enabled ? 1 : 0.5,
            }}
          >
            <span style={{ color: '#444', fontSize: '0.7rem', fontFamily: 'monospace', width: '1.5rem', textAlign: 'right' }}>
              {idx + 1}.
            </span>
            <span style={{ flex: 1, fontSize: '0.85rem', letterSpacing: '0.06em' }}>
              {getFeedLabel(slot.feed_id)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="number"
                min={5}
                max={300}
                value={slot.duration}
                onChange={(e) => updateSlot(idx, { duration: parseInt(e.target.value) || 30 })}
                style={{
                  background: '#111', border: '1px solid #333', color: '#e5e5e5',
                  padding: '0.2rem 0.4rem', borderRadius: '3px',
                  fontFamily: 'monospace', fontSize: '0.75rem', width: '4rem', textAlign: 'right',
                }}
              />
              <span style={{ color: '#555', fontSize: '0.65rem' }}>SEC</span>
            </div>
            <button
              onClick={() => updateSlot(idx, { enabled: slot.enabled ? 0 : 1 })}
              style={{
                background: slot.enabled ? '#222' : '#111',
                border: '1px solid #333',
                color: slot.enabled ? '#888' : '#444',
                padding: '0.2rem 0.5rem',
                borderRadius: '3px', cursor: 'pointer',
                fontSize: '0.65rem', fontFamily: 'monospace',
              }}
            >
              {slot.enabled ? 'ON' : 'OFF'}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                onClick={() => moveSlot(idx, -1)}
                disabled={idx === 0}
                style={{
                  background: '#222', border: '1px solid #333', color: '#666',
                  padding: '0 0.4rem', borderRadius: '2px', cursor: 'pointer',
                  fontSize: '0.6rem', lineHeight: 1.4,
                }}
              >▲</button>
              <button
                onClick={() => moveSlot(idx, 1)}
                disabled={idx === slots.length - 1}
                style={{
                  background: '#222', border: '1px solid #333', color: '#666',
                  padding: '0 0.4rem', borderRadius: '2px', cursor: 'pointer',
                  fontSize: '0.6rem', lineHeight: 1.4,
                }}
              >▼</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
