'use client';

import { useEffect, useState, useCallback } from 'react';

interface Message {
  id: number;
  label: string;
  body: string;
  category: string;
  enabled: number;
}

const CATEGORIES = ['custom', 'optimism', 'meaning', 'parenting', 'universe'];
const CATEGORY_COLORS: Record<string, string> = {
  custom: '#666',
  optimism: '#e8a204',
  meaning: '#04b4e8',
  parenting: '#44cc44',
  universe: '#8844cc',
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('custom');
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    fetch('/api/messages').then((r) => r.json()).then(setMessages);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addMessage = useCallback(async () => {
    if (!newBody.trim()) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newLabel || newBody.slice(0, 30), body: newBody.toUpperCase(), category: newCategory }),
    });
    setNewLabel('');
    setNewBody('');
    load();
  }, [newLabel, newBody, newCategory, load]);

  const displayed = filter === 'all' ? messages : messages.filter((m) => m.category === filter);

  return (
    <div>
      <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.25rem' }}>MESSAGES</h1>
      <p style={{ color: '#555', fontSize: '0.75rem', marginBottom: '2rem' }}>
        Static messages and preset quote library. Text is automatically uppercased.
      </p>

      {/* Add new */}
      <div
        style={{
          background: '#181818',
          border: '1px solid #2a2a2a',
          borderRadius: '6px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '0.8rem', color: '#e85d04', letterSpacing: '0.12em', marginBottom: '1rem' }}>
          ADD MESSAGE
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>LABEL</label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="optional label"
              style={{ background: '#111', border: '1px solid #333', color: '#e5e5e5', padding: '0.35rem 0.6rem', borderRadius: '3px', fontFamily: 'monospace', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>CATEGORY</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ background: '#111', border: '1px solid #333', color: '#e5e5e5', padding: '0.35rem 0.6rem', borderRadius: '3px', fontFamily: 'monospace', fontSize: '0.8rem', width: '100%' }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>
            MESSAGE BODY (use newlines for rows)
          </label>
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            rows={3}
            placeholder="LINE 1&#10;LINE 2&#10;— ATTRIBUTION"
            style={{
              background: '#111', border: '1px solid #333', color: '#e5e5e5',
              padding: '0.5rem 0.6rem', borderRadius: '3px', fontFamily: 'monospace',
              fontSize: '0.8rem', width: '100%', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          onClick={addMessage}
          style={{
            background: '#e85d04', border: 'none', color: '#fff',
            padding: '0.4rem 1rem', borderRadius: '4px',
            cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8rem',
          }}
        >
          ADD
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['all', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              background: filter === cat ? '#222' : 'transparent',
              border: `1px solid ${filter === cat ? '#444' : '#222'}`,
              color: filter === cat ? '#e5e5e5' : '#555',
              padding: '0.2rem 0.6rem',
              borderRadius: '3px', cursor: 'pointer',
              fontFamily: 'monospace', fontSize: '0.7rem',
              letterSpacing: '0.08em',
            }}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Message list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {displayed.map((msg) => (
          <div
            key={msg.id}
            style={{
              background: '#181818',
              border: '1px solid #1f1f1f',
              borderLeft: `3px solid ${CATEGORY_COLORS[msg.category] ?? '#444'}`,
              borderRadius: '4px',
              padding: '0.75rem 1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>{msg.label}</span>
              <span style={{ fontSize: '0.65rem', color: CATEGORY_COLORS[msg.category] ?? '#444' }}>
                {msg.category}
              </span>
            </div>
            <pre style={{
              margin: 0, fontFamily: 'monospace', fontSize: '0.8rem',
              color: '#ccc', whiteSpace: 'pre-wrap',
            }}>
              {msg.body}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
