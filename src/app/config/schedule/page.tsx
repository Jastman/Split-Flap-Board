'use client';

import { useEffect, useState, useCallback } from 'react';

interface ScheduleSlot {
  id: number;
  position: number;
  feed_id: string | null;
  message_id: number | null;
  duration: number;
  enabled: number;
  start_hour: number | null;
  end_hour: number | null;
}

interface Feed {
  id: string;
  label: string;
  type: string;
}

const numInputStyle: React.CSSProperties = {
  background: '#111', border: '1px solid #333', color: '#e5e5e5',
  padding: '0.2rem 0.4rem', borderRadius: '3px',
  fontFamily: 'monospace', fontSize: '0.75rem', width: '4rem', textAlign: 'right',
};

export default function SchedulePage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedHours, setExpandedHours] = useState<Set<number>>(new Set());

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
          start_hour: s.start_hour,
          end_hour: s.end_hour,
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

  const toggleHours = useCallback((idx: number) => {
    setExpandedHours((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const getFeedLabel = (feedId: string | null) => {
    if (!feedId) return '—';
    return feeds.find((f) => f.id === feedId)?.label ?? feedId;
  };

  const formatHour = (h: number | null) => {
    if (h === null) return '—';
    const period = h >= 12 ? 'PM' : 'AM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}${period}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.15em', margin: 0 }}>SCHEDULE</h1>
          <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Rotation order — feeds that are not timely are automatically skipped.
            Optionally restrict slots to certain hours of the day.
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
        {slots.map((slot, idx) => {
          const hasHours = slot.start_hour !== null || slot.end_hour !== null;
          const hoursExpanded = expandedHours.has(idx);

          return (
            <div
              key={slot.id}
              style={{
                background: '#181818',
                border: `1px solid ${slot.enabled ? '#2a2a2a' : '#1a1a1a'}`,
                borderRadius: '4px',
                overflow: 'hidden',
                opacity: slot.enabled ? 1 : 0.55,
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 1rem',
              }}>
                <span style={{ color: '#444', fontSize: '0.7rem', fontFamily: 'monospace', width: '1.5rem', textAlign: 'right' }}>
                  {idx + 1}.
                </span>
                <span style={{ flex: 1, fontSize: '0.85rem', letterSpacing: '0.06em' }}>
                  {getFeedLabel(slot.feed_id)}
                </span>

                {/* Time-of-day badge */}
                <button
                  onClick={() => toggleHours(idx)}
                  title="Set time-of-day restriction"
                  style={{
                    background: hasHours ? 'rgba(232,93,4,0.15)' : '#111',
                    border: `1px solid ${hasHours ? 'rgba(232,93,4,0.4)' : '#333'}`,
                    color: hasHours ? '#e85d04' : '#444',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '3px', cursor: 'pointer',
                    fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {hasHours
                    ? `${formatHour(slot.start_hour)}–${formatHour(slot.end_hour)}`
                    : 'ALL DAY'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={slot.duration}
                    onChange={(e) => updateSlot(idx, { duration: parseInt(e.target.value) || 30 })}
                    style={numInputStyle}
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

              {/* Time-of-day hours panel */}
              {hoursExpanded && (
                <div style={{
                  borderTop: '1px solid #222',
                  padding: '0.75rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: '#131313',
                }}>
                  <span style={{ color: '#666', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                    ACTIVE HOURS
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      value={slot.start_hour ?? ''}
                      onChange={(e) =>
                        updateSlot(idx, { start_hour: e.target.value === '' ? null : parseInt(e.target.value) })
                      }
                      style={{
                        background: '#111', border: '1px solid #333', color: '#e5e5e5',
                        padding: '0.2rem 0.4rem', borderRadius: '3px',
                        fontFamily: 'monospace', fontSize: '0.75rem',
                      }}
                    >
                      <option value="">All Day</option>
                      {Array.from({ length: 24 }, (_, h) => (
                        <option key={h} value={h}>{formatHour(h)}</option>
                      ))}
                    </select>
                    <span style={{ color: '#444', fontSize: '0.7rem' }}>to</span>
                    <select
                      value={slot.end_hour ?? ''}
                      onChange={(e) =>
                        updateSlot(idx, { end_hour: e.target.value === '' ? null : parseInt(e.target.value) })
                      }
                      style={{
                        background: '#111', border: '1px solid #333', color: '#e5e5e5',
                        padding: '0.2rem 0.4rem', borderRadius: '3px',
                        fontFamily: 'monospace', fontSize: '0.75rem',
                      }}
                    >
                      <option value="">All Day</option>
                      {Array.from({ length: 24 }, (_, h) => (
                        <option key={h} value={h}>{formatHour(h)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => updateSlot(idx, { start_hour: null, end_hour: null })}
                      style={{
                        background: 'none', border: '1px solid #333', color: '#555',
                        padding: '0.2rem 0.5rem', borderRadius: '3px', cursor: 'pointer',
                        fontSize: '0.65rem', fontFamily: 'monospace',
                      }}
                    >
                      CLEAR
                    </button>
                  </div>
                  <span style={{ color: '#444', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                    (wraps midnight if start &gt; end)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
