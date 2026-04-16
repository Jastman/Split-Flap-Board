'use client';

import { useEffect, useState, useCallback } from 'react';

interface ShareSettings {
  token: string | null;
  enabled: boolean;
  hideLocation: boolean;
  hideCalendar: boolean;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
      {/* Track */}
      <div
        onClick={() => onChange(!checked)}
        style={{
          flexShrink: 0,
          marginTop: '2px',
          width: '42px',
          height: '24px',
          borderRadius: '12px',
          background: checked ? '#e85d04' : '#333',
          position: 'relative',
          transition: 'background 0.2s',
          cursor: 'pointer',
        }}
      >
        {/* Knob */}
        <div style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '21px' : '3px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </div>
      <div>
        <div style={{ fontSize: '0.95rem', color: '#e0e0e0', fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px', lineHeight: 1.4 }}>{description}</div>}
      </div>
    </label>
  );
}

export default function SharePage() {
  const [settings, setSettings] = useState<ShareSettings>({
    token: null,
    enabled: false,
    hideLocation: false,
    hideCalendar: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/share');
    if (res.ok) {
      const data = (await res.json()) as ShareSettings;
      setSettings(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (settings.token && settings.enabled) {
      setShareUrl(`${window.location.origin}/share/${settings.token}`);
    } else {
      setShareUrl('');
    }
  }, [settings.token, settings.enabled]);

  const save = useCallback(async (updates: Partial<ShareSettings> & { regenerate?: boolean }) => {
    setSaving(true);
    const merged = { ...settings, ...updates };
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    });
    if (res.ok) {
      const data = (await res.json()) as { token: string };
      setSettings({ ...merged, token: data.token });
    }
    setSaving(false);
  }, [settings]);

  const copyUrl = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const embedCode = shareUrl
    ? `<iframe src="${shareUrl}" width="800" height="300" frameborder="0" allowfullscreen></iframe>`
    : '';

  if (loading) {
    return <p style={{ color: '#888' }}>Loading...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px' }}>
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#fff', letterSpacing: '-0.01em' }}>
          Share Board
        </h1>
        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
          Share a live read-only view of your board. Anyone with the link can view it — no account needed.
        </p>
      </div>

      {/* Main sharing toggle */}
      <div style={{
        background: '#181818',
        border: '1px solid #2a2a2a',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <Toggle
          checked={settings.enabled}
          onChange={(v) => save({ enabled: v })}
          label={settings.enabled ? 'Sharing ON' : 'Sharing OFF'}
          description={settings.enabled
            ? 'Your board is publicly accessible via the link below.'
            : 'Enable to generate a public link to your board.'}
        />
      </div>

      {settings.enabled && (
        <>
          {/* Privacy controls */}
          <div style={{
            background: 'rgba(232,93,4,0.07)',
            border: '1px solid rgba(232,93,4,0.25)',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div>
              <p style={{ color: '#e85d04', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.25rem', letterSpacing: '0.04em' }}>
                PRIVACY
              </p>
              <p style={{ color: '#999', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                Your board may contain personal data. Control what viewers can see.
              </p>
            </div>

            <Toggle
              checked={settings.hideLocation}
              onChange={(v) => save({ hideLocation: v })}
              label="Hide location-based feeds"
              description="Hides weather, overhead flights, and ISS passes (based on your GPS coordinates)."
            />
            <Toggle
              checked={settings.hideCalendar}
              onChange={(v) => save({ hideCalendar: v })}
              label="Hide calendar feed"
              description="Hides calendar events from the shared view."
            />
          </div>

          {/* Share link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ccc' }}>Share Link</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  background: '#111',
                  border: '1px solid #333',
                  color: '#e0e0e0',
                  fontSize: '0.85rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '5px',
                  fontFamily: 'monospace',
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={copyUrl}
                style={{
                  background: '#e85d04', border: 'none', color: '#fff',
                  padding: '0.5rem 1rem', borderRadius: '5px',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => save({ regenerate: true })}
                disabled={saving}
                style={{
                  background: '#1e1e1e', border: '1px solid #333', color: '#aaa',
                  padding: '0.4rem 0.85rem', borderRadius: '5px',
                  cursor: 'pointer', fontSize: '0.8rem',
                }}
              >
                Generate new link
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#1e1e1e', border: '1px solid #333', color: '#aaa',
                  padding: '0.4rem 0.85rem', borderRadius: '5px',
                  fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Open shared view ↗
              </a>
            </div>
            <p style={{ color: '#555', fontSize: '0.75rem', margin: 0 }}>
              Generating a new link will immediately invalidate the old one.
            </p>
          </div>

          {/* Embed code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ccc' }}>Embed Code</label>
            <textarea
              readOnly
              value={embedCode}
              rows={3}
              style={{
                background: '#111', border: '1px solid #333', color: '#e0e0e0',
                fontSize: '0.8rem', padding: '0.5rem 0.75rem', borderRadius: '5px',
                fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.5,
                width: '100%', boxSizing: 'border-box',
              }}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <p style={{ color: '#555', fontSize: '0.75rem', margin: 0 }}>
              Paste into any webpage to embed a live view of your board.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
