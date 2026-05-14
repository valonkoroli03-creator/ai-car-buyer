'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const FREE_MESSAGES = [
  'Lecture des annonces…',
  'Extraction des données techniques…',
  'Analyse du marché suisse…',
  'Calcul des scores…',
  'Préparation de votre rapport…',
];

const PREMIUM_MESSAGES = [
  'Analyse approfondie en cours…',
  'Comparaison des moteurs…',
  'Calcul des coûts réels en Suisse…',
  'Estimation assurance et plaques cantonales…',
  'Analyse de fiabilité et revente…',
  'Rédaction des recommandations…',
];

export function LoadingScreen({ mode = 'free' }: { mode?: 'free' | 'premium' }) {
  const [idx, setIdx] = useState(0);
  const messages = mode === 'premium' ? PREMIUM_MESSAGES : FREE_MESSAGES;

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 2000);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div className="spin" style={{
        width: 64, height: 64, borderRadius: 999,
        border: '4px solid var(--border)', borderTopColor: 'var(--accent)',
        marginBottom: 40,
      }} />
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
          style={{
            fontSize: 19, fontWeight: 500, color: 'var(--ink)',
            letterSpacing: '-0.01em', textAlign: 'center', maxWidth: 600,
          }}
        >
          {messages[idx]}
        </motion.div>
      </AnimatePresence>
      <div style={{
        marginTop: 32, fontSize: 13, color: 'var(--ink3)',
        letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500,
      }}>
        {mode === 'premium' ? 'Analyse premium · 30 à 60 secondes' : 'Cela peut prendre 30 secondes'}
      </div>
    </motion.div>
  );
}
