'use client';

import { useEffect, useState, useCallback } from 'react';

interface ShareSettings {
  token: string | null;
  enabled: boolean;
  hideLocation: boolean;
  hideCalendar: boolean;
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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (settings.token && settings.enabled) {
      setShareUrl(`${window.location.origin}/share/${settings.token}`);
    } else {
      setShareUrl('');
    }
  }, [settings.token, settings.enabled]);

  const save = useCallback(async (updates: Partial<ShareSettings> & { regenerate?: boolean }) => {
    setSaving(true);
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, ...updates }),
    });
    if (res.ok) {
      const data = (await res.json()) as { token: string };
      setSettings((prev) => ({ ...prev, ...updates, token: data.token }));
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
    ? `<iframe src="${shareUrl}?embed=1" width="800" height="300" frameborder="0" allowfullscreen></iframe>`
    : '';

  const inputStyle: React.CSSProperties = {
    background: '#111',
    border: '1px solid #333',
    color: '#e5e5e5',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '3px',
    width: '100%',
    boxSizing: 'border-box',
  };

  const btnStyle: React.CSSProperties = {
    background: '#e85d04',
    border: 'none',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    padding: '0.4rem 1rem',
    borderRadius: '3px',
    cursor: 'pointer',
    letterSpacing: '0.08em',
  };

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    color: active ? '#e85d04' : '#666',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    letterSpacing: '0.06em',
    userSelect: 'none',
  });

  if (loading) {
    return <p style={{ color: '#666', fontFamily: 'monospace' }}>LOADING...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.1rem', letterSpacing: '0.12em', margin: '0 0 0.25rem' }}>
          SHARE
        </h1>
        <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>
          Share a read-only live view of your board. Anyone with the link can view it — no account required.
        </p>
      </div>

      {/* Enable toggle */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={toggleStyle(settings.enabled)}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => save({ enabled: e.target.checked })}
            style={{ accentColor: '#e85d04' }}
          />
          {settings.enabled ? 'SHARING ENABLED' : 'SHARING DISABLED'}
        </label>

        {!settings.enabled && (
          <p style={{ color: '#555', fontSize: '0.75rem', margin: 0, fontFamily: 'monospace' }}>
            Enable sharing to generate a public link to your board.
          </p>
        )}
      </section>

      {settings.enabled && (
        <>
          {/* Privacy warnings */}
          <section style={{
            background: 'rgba(232,93,4,0.08)',
            border: '1px solid rgba(232,93,4,0.3)',
            borderRadius: '4px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <p style={{ color: '#e85d04', fontSize: '0.75rem', fontFamily: 'monospace', margin: 0, letterSpacing: '0.08em' }}>
              ⚠ PRIVACY NOTICE
            </p>
            <p style={{ color: '#aaa', fontSize: '0.75rem', margin: 0, lineHeight: 1.6 }}>
              Your shared board may include personal data. Weather, flights, and ISS passes are based on
              your GPS location. Your calendar events are visible if the calendar feed is enabled.
              Control what&apos;s visible using the options below.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={toggleStyle(settings.hideLocation)}>
                <input
                  type="checkbox"
                  checked={settings.hideLocation}
                  onChange={(e) => save({ hideLocation: e.target.checked })}
                  style={{ accentColor: '#e85d04' }}
                />
                HIDE LOCATION-BASED FEEDS (weather, flights, ISS)
              </label>
              <label style={toggleStyle(settings.hideCalendar)}>
                <input
                  type="checkbox"
                  checked={settings.hideCalendar}
                  onChange={(e) => save({ hideCalendar: e.target.checked })}
                  style={{ accentColor: '#e85d04' }}
                />
                HIDE CALENDAR FEED
              </label>
            </div>
          </section>

          {/* Share URL */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: '#888', fontSize: '0.75rem', fontFamily: 'monospace', margin: 0, letterSpacing: '0.06em' }}>
              SHARE LINK
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                readOnly
                value={shareUrl}
                style={inputStyle}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button style={btnStyle} onClick={copyUrl}>
                {copied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
            <button
              style={{ ...btnStyle, background: '#222', border: '1px solid #444', color: '#aaa' }}
              onClick={() => save({ regenerate: true })}
              disabled={saving}
            >
              GENERATE NEW LINK
            </button>
            <p style={{ color: '#444', fontSize: '0.7rem', fontFamily: 'monospace', margin: 0 }}>
              Generating a new link will invalidate the old one immediately.
            </p>
          </section>

          {/* Embed code */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: '#888', fontSize: '0.75rem', fontFamily: 'monospace', margin: 0, letterSpacing: '0.06em' }}>
              EMBED CODE
            </p>
            <textarea
              readOnly
              value={embedCode}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <p style={{ color: '#444', fontSize: '0.7rem', fontFamily: 'monospace', margin: 0 }}>
              Paste this into any webpage to embed a live read-only view of your board.
            </p>
          </section>

          {/* Preview */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: '#888', fontSize: '0.75rem', fontFamily: 'monospace', margin: 0, letterSpacing: '0.06em' }}>
              PREVIEW
            </p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...btnStyle, textDecoration: 'none', display: 'inline-block', width: 'fit-content' }}
            >
              OPEN SHARED VIEW →
            </a>
          </section>
        </>
      )}
    </div>
  );
}
