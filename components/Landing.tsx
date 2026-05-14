'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  ArrowRight, Sparkles, Plus, Trash2, Check, Shield, Zap, Target, Link as LinkIcon,
} from 'lucide-react';
import { PrimaryButton } from './ui';

function detectSource(url: string): string | null {
  if (/autoscout24\.ch/i.test(url)) return 'AutoScout24';
  if (/anibis\.ch/i.test(url)) return 'Anibis';
  if (/comparis\.ch/i.test(url)) return 'Comparis';
  if (/ricardo\.ch/i.test(url)) return 'Ricardo';
  if (/leboncoin\.fr/i.test(url)) return 'leboncoin';
  if (/^https?:\/\//.test(url)) return 'Lien';
  return null;
}

function isValidUrl(url: string): boolean {
  return /^https?:\/\/.+\..+/.test(url.trim());
}

export function Landing({
  urls,
  setUrls,
  onContinue,
}: {
  urls: string[];
  setUrls: (u: string[]) => void;
  onContinue: () => void;
}) {
  const validCount = useMemo(() => urls.filter(isValidUrl).length, [urls]);
  const canContinue = validCount >= 1;

  const updateUrl = (i: number, v: string) => {
    const next = [...urls];
    next[i] = v;
    setUrls(next);
  };

  const addUrl = () => {
    if (urls.length >= 8) return;
    setUrls([...urls, '']);
  };

  const removeUrl = (i: number) => {
    if (urls.length <= 1) return;
    setUrls(urls.filter((_, idx) => idx !== i));
  };

  const fillExample = () => {
    setUrls([
      'https://www.autoscout24.ch/fr/d/peugeot-208-12-mhev-145-gt-aut-panorama-glasdach-20410341',
      'https://www.autoscout24.ch/fr/d/mercedes-benz-gle-63-s-amg-4matic-sitzluftung-panorama-burmester-head-up-20398301',
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: 760, margin: '0 auto', padding: '96px 24px 120px' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--accent)',
          color: 'var(--ink)',
          padding: '6px 14px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 28,
        }}
      >
        <Sparkles size={14} strokeWidth={2.5} />
        IA · Analyse réelle de vos annonces
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          fontSize: 'clamp(40px, 6vw, 64px)',
          fontWeight: 700,
          letterSpacing: '-0.035em',
          lineHeight: 1.02,
          margin: '0 0 20px',
        }}
      >
        Trouvez la meilleure voiture en{' '}
        <span className="yellow-underline">2 minutes.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ fontSize: 19, lineHeight: 1.55, color: 'var(--ink2)', margin: '0 0 48px', maxWidth: 600 }}
      >
        Collez vos liens AutoScout24 (ou autres). Notre IA va sur chaque page, lit les vraies données, et vous dit laquelle acheter.
      </motion.p>

      {/* Listings header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink2)',
          }}
        >
          Vos annonces ({validCount}/8)
        </div>
        <button
          onClick={fillExample}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink2)',
            fontSize: 13,
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Charger un exemple
        </button>
      </div>

      {/* URL blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <AnimatePresence>
          {urls.map((url, i) => (
            <UrlBlock
              key={i}
              index={i}
              value={url}
              onChange={(v) => updateUrl(i, v)}
              onRemove={urls.length > 1 ? () => removeUrl(i) : null}
            />
          ))}
        </AnimatePresence>
      </div>

      {urls.length < 8 && (
        <button
          onClick={addUrl}
          style={{
            width: '100%',
            background: 'transparent',
            border: '2px dashed var(--border)',
            borderRadius: 16,
            padding: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--ink2)',
            fontSize: 15,
            fontWeight: 600,
            transition: 'all 200ms',
            marginBottom: 32,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--ink)';
            e.currentTarget.style.color = 'var(--ink)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--ink2)';
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Ajouter une annonce
        </button>
      )}

      <PrimaryButton onClick={onContinue} disabled={!canContinue} fullWidth large>
        Continuer
        <ArrowRight size={20} strokeWidth={2.5} />
      </PrimaryButton>

      <p
        style={{
          margin: '16px 0 0',
          fontSize: 13,
          color: 'var(--ink3)',
          textAlign: 'center',
        }}
      >
        {canContinue
          ? 'Aucun compte requis · Vos données ne sont pas stockées'
          : 'Ajoutez au moins une URL pour démarrer'}
      </p>

      {/* Trust strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginTop: 56,
        }}
      >
        {[
          { icon: <Shield size={18} />, label: 'Privé & sécurisé' },
          { icon: <Zap size={18} />, label: 'Analyse en 30 secondes' },
          { icon: <Target size={18} />, label: 'Une recommandation claire' },
        ].map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--ink2)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <span style={{ color: 'var(--ink)' }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function UrlBlock({
  index,
  value,
  onChange,
  onRemove,
}: {
  index: number;
  value: string;
  onChange: (v: string) => void;
  onRemove: (() => void) | null;
}) {
  const [focused, setFocused] = useState(false);
  const valid = isValidUrl(value);
  const source = detectSource(value);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: '#fff',
        border: `1.5px solid ${focused ? 'var(--ink)' : valid ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'border-color 200ms',
        boxShadow: focused ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 18px',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: valid ? 'var(--accent)' : 'var(--bg2)',
            border: valid ? 'none' : '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: 'JetBrains Mono, monospace',
            flexShrink: 0,
          }}
        >
          {valid ? <Check size={14} strokeWidth={3} /> : index + 1}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <LinkIcon size={14} strokeWidth={2} style={{ color: 'var(--ink3)', flexShrink: 0 }} />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`Lien de l'annonce ${index + 1} (AutoScout24, Anibis, Comparis…)`}
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: 'var(--ink)',
              background: 'transparent',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          {source && (
            <span
              style={{
                background: 'var(--ink)',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.02em',
                flexShrink: 0,
              }}
            >
              {source}
            </span>
          )}
        </div>

        {onRemove && (
          <button
            onClick={onRemove}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink3)',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: 6,
              transition: 'all 150ms',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--danger)';
              e.currentTarget.style.background = '#FEF2F2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ink3)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
