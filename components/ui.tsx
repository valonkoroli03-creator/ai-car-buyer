'use client';

import { useState } from 'react';

const styles = {
  shadowYellow: '0 8px 24px rgba(245, 242, 0, 0.40)',
  shadowMd: '0 4px 16px rgba(10, 10, 10, 0.06)',
};

export function PrimaryButton({
  children,
  onClick,
  disabled,
  fullWidth,
  large,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  large?: boolean;
  type?: 'button' | 'submit';
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: fullWidth ? '100%' : 'auto',
        background: disabled ? 'var(--border)' : hover ? 'var(--accent-hover)' : 'var(--accent)',
        color: disabled ? 'var(--ink3)' : 'var(--ink)',
        border: 'none',
        borderRadius: 12,
        padding: large ? '18px 28px' : '14px 24px',
        fontSize: large ? 17 : 15,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: disabled || !hover ? 'none' : styles.shadowYellow,
        transform: hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--bg2)' : 'transparent',
        color: 'var(--ink)',
        border: '1.5px solid var(--border)',
        borderRadius: 12,
        padding: '14px 22px',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 200ms',
      }}
    >
      {children}
    </button>
  );
}
