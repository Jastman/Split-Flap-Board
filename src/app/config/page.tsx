'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AppConfig } from '@/types/config';

interface FeedStatus {
  id: string;
  label: string;
  enabled: boolean;
  error: string | null;
  lastFetched: number | null;
}

export default function ConfigOverview() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [feeds, setFeeds] = useState<FeedStatus[]>([]);

  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then(setConfig);
    fetch('/api/feeds').then((r) => r.json()).then(setFeeds);
  }, []);

  const sections = [
    { href: '/config/feeds', title: 'DATA FEEDS', desc: 'Enable/disable and configure live data sources' },
    { href: '/config/display', title: 'DISPLAY', desc: 'Board layout, preset themes, colors, and fonts' },
    { href: '/config/schedule', title: 'SCHEDULE', desc: 'Rotation order and duration per feed slot' },
    { href: '/config/messages', title: 'MESSAGES', desc: 'Static messages and preset quote library' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#fff', letterSpacing: '-0.01em' }}>
        Settings
      </h1>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>
        {config
          ? `${config.cols}×${config.rows} board · ${config.latitude.toFixed(2)}, ${config.longitude.toFixed(2)}`
          : 'Loading...'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: 'block',
              background: '#181818',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              padding: '1.25rem',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e85d04', marginBottom: '0.35rem' }}>
              {s.title}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>{s.desc}</div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#bbb', marginBottom: '0.75rem' }}>
        Feed Status
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {feeds.map((f) => (
          <div
            key={f.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: '#181818',
              border: '1px solid #222',
              borderRadius: '4px',
              padding: '0.6rem 1rem',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: f.error ? '#cc4444' : f.enabled ? '#44cc44' : '#444',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.8rem', flex: 1, letterSpacing: '0.08em' }}>{f.label}</span>
            <span style={{ fontSize: '0.7rem', color: '#555' }}>
              {f.enabled ? (f.error ? 'ERROR' : 'ACTIVE') : 'DISABLED'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
