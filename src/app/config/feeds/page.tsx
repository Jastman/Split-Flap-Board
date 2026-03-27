'use client';

import { useEffect, useState, useCallback } from 'react';

interface Feed {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
  cacheTtl: number;
  error: string | null;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: '0.78rem', color: '#999', letterSpacing: '0.04em', display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = 'text',
}: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: '#111',
        border: '1px solid #2e2e2e',
        color: '#e0e0e0',
        padding: '0.4rem 0.7rem',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    />
  );
}

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const loadFeeds = useCallback(async () => {
    const res = await fetch('/api/feeds');
    setFeeds(await res.json());
  }, []);

  useEffect(() => { loadFeeds(); }, [loadFeeds]);

  const updateFeed = useCallback(async (id: string, patch: Partial<Feed>) => {
    setSaving(id);
    await fetch(`/api/feeds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await loadFeeds();
    setSaving(null);
  }, [loadFeeds]);

  const refreshFeed = useCallback(async (id: string) => {
    setRefreshing(id);
    await fetch('/api/feeds/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedId: id }),
    });
    setRefreshing(null);
  }, []);

  const updateConfig = useCallback(async (feed: Feed, key: string, value: unknown) => {
    const newConfig = { ...feed.config, [key]: value };
    await updateFeed(feed.id, { config: newConfig });
  }, [updateFeed]);

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#fff', letterSpacing: '-0.01em' }}>
        Data Feeds
      </h1>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Configure live data sources. Timely feeds (ISS, launches, flights) only appear when relevant.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {feeds.map((feed) => (
          <div
            key={feed.id}
            style={{
              background: '#181818',
              border: `1px solid ${feed.enabled ? '#2a2a2a' : '#1a1a1a'}`,
              borderRadius: '6px',
              padding: '1.25rem',
              opacity: feed.enabled ? 1 : 0.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: feed.enabled ? '1rem' : 0 }}>
              <div
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: feed.error ? '#cc4444' : feed.enabled ? '#44cc44' : '#444',
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600 }}>
                {feed.label}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace' }}>
                {feed.type}
              </span>
              <button
                onClick={() => refreshFeed(feed.id)}
                disabled={refreshing === feed.id}
                style={{
                  background: '#222',
                  border: '1px solid #333',
                  color: '#999',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                {refreshing === feed.id ? '...' : 'REFRESH'}
              </button>
              <button
                onClick={() => updateFeed(feed.id, { enabled: !feed.enabled })}
                disabled={saving === feed.id}
                style={{
                  background: feed.enabled ? '#e85d04' : '#222',
                  border: `1px solid ${feed.enabled ? '#e85d04' : '#333'}`,
                  color: feed.enabled ? '#fff' : '#888',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {feed.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {feed.enabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {feed.type === 'news' && (
                  <>
                    <div>
                      <Label>RSS URL</Label>
                      <Input
                        value={(feed.config.rssUrl as string) ?? ''}
                        onChange={(v) => updateConfig(feed, 'rssUrl', v)}
                      />
                    </div>
                    <div>
                      <Label>SOURCE LABEL</Label>
                      <Input
                        value={(feed.config.source as string) ?? ''}
                        onChange={(v) => updateConfig(feed, 'source', v.toUpperCase())}
                      />
                    </div>
                  </>
                )}
                {feed.type === 'launches' && (
                  <div>
                    <Label>WINDOW (HOURS AHEAD)</Label>
                    <Input
                      type="number"
                      value={(feed.config.windowHours as number) ?? 48}
                      onChange={(v) => updateConfig(feed, 'windowHours', parseInt(v))}
                    />
                  </div>
                )}
                {feed.type === 'iss' && (
                  <div>
                    <Label>WINDOW (HOURS AHEAD)</Label>
                    <Input
                      type="number"
                      value={(feed.config.windowHours as number) ?? 6}
                      onChange={(v) => updateConfig(feed, 'windowHours', parseInt(v))}
                    />
                  </div>
                )}
                {feed.type === 'flights' && (
                  <div>
                    <Label>SEARCH RADIUS (DEGREES)</Label>
                    <Input
                      type="number"
                      value={(feed.config.radiusDeg as number) ?? 0.5}
                      onChange={(v) => updateConfig(feed, 'radiusDeg', parseFloat(v))}
                    />
                  </div>
                )}
                {feed.type === 'sports' && (
                  <>
                    <div>
                      <Label>SPORT</Label>
                      <select
                        value={(feed.config.sport as string) ?? 'baseball'}
                        onChange={(e) => updateConfig(feed, 'sport', e.target.value)}
                        style={{
                          background: '#111', border: '1px solid #333', color: '#e5e5e5',
                          padding: '0.35rem 0.6rem', borderRadius: '3px',
                          fontFamily: 'monospace', fontSize: '0.8rem', width: '100%',
                        }}
                      >
                        <option value="baseball">Baseball</option>
                        <option value="basketball">Basketball</option>
                        <option value="football">Football</option>
                        <option value="hockey">Hockey</option>
                        <option value="soccer">Soccer</option>
                      </select>
                    </div>
                    <div>
                      <Label>LEAGUE</Label>
                      <select
                        value={(feed.config.league as string) ?? 'mlb'}
                        onChange={(e) => updateConfig(feed, 'league', e.target.value)}
                        style={{
                          background: '#111', border: '1px solid #333', color: '#e5e5e5',
                          padding: '0.35rem 0.6rem', borderRadius: '3px',
                          fontFamily: 'monospace', fontSize: '0.8rem', width: '100%',
                        }}
                      >
                        <option value="mlb">MLB</option>
                        <option value="nba">NBA</option>
                        <option value="nfl">NFL</option>
                        <option value="nhl">NHL</option>
                        <option value="wnba">WNBA</option>
                        <option value="mens-college-basketball">NCAA Basketball</option>
                        <option value="college-football">NCAA Football</option>
                        <option value="eng.1">Premier League</option>
                        <option value="usa.1">MLS</option>
                      </select>
                    </div>
                  </>
                )}
                {feed.type === 'stocks' && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <Label>SYMBOLS (COMMA-SEPARATED)</Label>
                    <Input
                      value={((feed.config.symbols as string[]) ?? []).join(', ')}
                      onChange={(v) =>
                        updateConfig(
                          feed,
                          'symbols',
                          v.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
                        )
                      }
                    />
                    <span style={{ fontSize: '0.65rem', color: '#555', fontFamily: 'monospace' }}>
                      e.g. SPY, QQQ, AAPL, TSLA
                    </span>
                  </div>
                )}
                {feed.type === 'countdown' && (
                  <>
                    <div>
                      <Label>EVENT LABEL</Label>
                      <Input
                        value={(feed.config.label as string) ?? ''}
                        onChange={(v) => updateConfig(feed, 'label', v.toUpperCase())}
                      />
                    </div>
                    <div>
                      <Label>TARGET DATE/TIME (LOCAL)</Label>
                      <Input
                        type="datetime-local"
                        value={(feed.config.targetDate as string) ?? ''}
                        onChange={(v) => updateConfig(feed, 'targetDate', v)}
                      />
                    </div>
                  </>
                )}
                {feed.error && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <span style={{ fontSize: '0.8rem', color: '#f87171', fontFamily: 'monospace' }}>
                      Error: {feed.error}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
