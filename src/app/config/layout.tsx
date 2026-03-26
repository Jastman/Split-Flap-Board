import Link from 'next/link';

const NAV_LINKS = [
  { href: '/config', label: 'Overview' },
  { href: '/config/feeds', label: 'Feeds' },
  { href: '/config/display', label: 'Display' },
  { href: '/config/schedule', label: 'Schedule' },
  { href: '/config/messages', label: 'Messages' },
];

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#e5e5e5',
        fontFamily: "'Courier Prime', 'Courier New', monospace",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid #222',
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
            letterSpacing: '0.1em',
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
                color: '#888',
                textDecoration: 'none',
                fontSize: '0.8rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '3px',
                letterSpacing: '0.08em',
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
              color: '#888',
              padding: '0.3rem 0.75rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            ← BOARD
          </Link>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
