import Link from 'next/link';

const NAV_LINKS = [
  { href: '/config', label: 'Overview' },
  { href: '/config/feeds', label: 'Feeds' },
  { href: '/config/display', label: 'Display' },
  { href: '/config/schedule', label: 'Schedule' },
  { href: '/config/messages', label: 'Messages' },
  { href: '/config/share', label: 'Share' },
];

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#d4d4d4',
        fontFamily: "system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
        fontSize: '15px',
        lineHeight: 1.6,
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid #2a2a2a',
          padding: '0.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <Link
          href="/board"
          style={{
            color: '#e85d04',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '0.08em',
            fontFamily: "'Courier Prime', 'Courier New', monospace",
          }}
        >
          FLIPFLAP.
        </Link>
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: '#bbb',
                textDecoration: 'none',
                fontSize: '0.9rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                letterSpacing: '0.02em',
                transition: 'color 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginLeft: 'auto' }}>
          <Link
            href="/board"
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              color: '#bbb',
              padding: '0.35rem 0.85rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            ← Board
          </Link>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
