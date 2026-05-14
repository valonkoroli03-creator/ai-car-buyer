'use client';

import { Car } from 'lucide-react';

export function TopBar({ onLogo }: { onLogo: () => void }) {
  return (
    <header
      style={{
        background: 'var(--ink)',
        color: '#fff',
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <button
        onClick={onLogo}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 0,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ink)',
          }}
        >
          <Car size={16} strokeWidth={2.5} />
        </span>
        AI Car Buyer
      </button>
    </header>
  );
}
