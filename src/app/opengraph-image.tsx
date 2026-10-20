import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Levy Desk — Visitor Levy Returns for Holiday Lets'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#fdf8f2',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Orange accent bar */}
        <div
          style={{
            width: 56,
            height: 5,
            background: '#ea580c',
            borderRadius: 4,
            marginBottom: 48,
            display: 'flex',
          }}
        />

        {/* Brand */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: '#78716c',
            letterSpacing: '-0.3px',
            marginBottom: 28,
            display: 'flex',
          }}
        >
          Levy Desk
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: '#1c1917',
            letterSpacing: '-2px',
            lineHeight: 1.05,
            marginBottom: 16,
            display: 'flex',
          }}
        >
          Visitor levy returns,
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: '#ea580c',
            letterSpacing: '-2px',
            lineHeight: 1.05,
            marginBottom: 40,
            display: 'flex',
          }}
        >
          done correctly.
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 26,
            color: '#78716c',
            fontWeight: 400,
            marginBottom: 52,
            display: 'flex',
          }}
        >
          For holiday let owners and agents in Scotland &amp; Wales
        </div>

        {/* Council pills */}
        <div style={{ display: 'flex', gap: 12 }}>
          {['Edinburgh', 'Glasgow', 'Cardiff', 'Aberdeen'].map((city) => (
            <div
              key={city}
              style={{
                background: '#fff7ed',
                border: '1.5px solid #fed7aa',
                borderRadius: 9999,
                padding: '10px 24px',
                fontSize: 20,
                color: '#9a3412',
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {city}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
