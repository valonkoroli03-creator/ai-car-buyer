'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { PrimaryButton, GhostButton } from './ui';
import type { UserAnswers } from '@/types';

type Q =
  | { id: keyof UserAnswers; type: 'slider'; title: string; subtitle?: string; min: number; max: number; step: number; default: number; format: (v: number) => string }
  | { id: keyof UserAnswers; type: 'cards' | 'list'; title: string; subtitle?: string; options: { id: string; label: string; desc?: string; emoji?: string }[] };

const QUESTIONS: Q[] = [
  {
    id: 'budget',
    type: 'slider',
    title: 'Quel est votre budget maximum ?',
    subtitle: "Tout compris — prix d'achat + frais initiaux.",
    min: 5000, max: 200000, step: 1000, default: 30000,
    format: (v) => `CHF ${v.toLocaleString('fr-CH')}`,
  },
  {
    id: 'city',
    type: 'list',
    title: 'Votre ville de résidence',
    subtitle: "Sert à estimer assurance et impôts cantonaux.",
    options: [
      { id: 'Genève', label: 'Genève' },
      { id: 'Lausanne', label: 'Lausanne' },
      { id: 'Fribourg', label: 'Fribourg' },
      { id: 'Neuchâtel', label: 'Neuchâtel' },
      { id: 'Sion', label: 'Sion' },
      { id: 'Zurich', label: 'Zurich' },
      { id: 'Bâle', label: 'Bâle' },
      { id: 'Berne', label: 'Berne' },
      { id: 'Lugano', label: 'Lugano' },
      { id: 'Autre', label: 'Autre' },
    ],
  },
  {
    id: 'usage',
    type: 'cards',
    title: 'Type d\'utilisation principal',
    options: [
      { id: 'ville', label: 'Ville', desc: 'Trajets courts urbains', emoji: '🏙' },
      { id: 'autoroute', label: 'Autoroute', desc: 'Longs trajets réguliers', emoji: '🛣' },
      { id: 'famille', label: 'Famille', desc: 'Espace, sécurité', emoji: '👨‍👩‍👧' },
      { id: 'plaisir', label: 'Plaisir', desc: 'Style, performance', emoji: '✨' },
      { id: 'business', label: 'Business', desc: 'Image, confort pro', emoji: '💼' },
      { id: 'montagne', label: 'Montagne', desc: '4x4, neige', emoji: '🏔' },
      { id: 'mixte', label: 'Mixte', desc: 'Polyvalent', emoji: '🔀' },
    ],
  },
  {
    id: 'annualKm',
    type: 'cards',
    title: 'Kilométrage annuel estimé',
    options: [
      { id: '<10000', label: '< 10 000 km', desc: 'Faible', emoji: '🚗' },
      { id: '10000-15000', label: '10 – 15 000', desc: 'Moyen', emoji: '🚙' },
      { id: '15000-25000', label: '15 – 25 000', desc: 'Élevé', emoji: '🛻' },
      { id: '>25000', label: '> 25 000 km', desc: 'Très élevé', emoji: '🚚' },
    ],
  },
  {
    id: 'priority',
    type: 'cards',
    title: 'Votre priorité numéro 1',
    options: [
      { id: 'prix', label: 'Prix', desc: 'Le moins cher', emoji: '💰' },
      { id: 'fiabilite', label: 'Fiabilité', desc: 'Pas de pannes', emoji: '🔧' },
      { id: 'confort', label: 'Confort', desc: 'Plaisir au quotidien', emoji: '🛋' },
      { id: 'puissance', label: 'Puissance', desc: 'Performance', emoji: '🚀' },
      { id: 'consommation', label: 'Consommation', desc: 'Économique', emoji: '⛽' },
      { id: 'image', label: 'Image', desc: 'Look, prestige', emoji: '✨' },
      { id: 'revente', label: 'Revente', desc: 'Garde sa valeur', emoji: '📈' },
      { id: 'couts_bas', label: 'Coûts bas', desc: 'Entretien minimal', emoji: '💸' },
    ],
  },
  {
    id: 'insurance',
    type: 'cards',
    title: 'Type d\'assurance souhaité',
    subtitle: 'Pour estimer le coût annuel.',
    options: [
      { id: 'rc_simple', label: 'RC simple', desc: 'Couverture minimale', emoji: '🛡' },
      { id: 'casco_partielle', label: 'Casco partielle', desc: 'Vol, bris de glace', emoji: '🛡️' },
      { id: 'casco_complete', label: 'Casco complète', desc: 'Tout risque', emoji: '🛡️🛡️' },
    ],
  },
  {
    id: 'driverProfile',
    type: 'cards',
    title: 'Votre profil conducteur',
    options: [
      { id: 'jeune', label: 'Jeune conducteur', desc: '< 3 ans permis', emoji: '🆕' },
      { id: 'experimente', label: 'Expérimenté', desc: 'Aucun bonus/malus négatif', emoji: '👤' },
      { id: 'famille', label: 'Famille', desc: 'Conducteur principal + 2nd', emoji: '👨‍👩‍👧' },
      { id: 'professionnel', label: 'Indépendant / Pro', desc: 'Usage business', emoji: '💼' },
    ],
  },
];

export function Questionnaire({
  initialAnswers,
  onComplete,
  onBack,
}: {
  initialAnswers: Partial<UserAnswers>;
  onComplete: (a: UserAnswers) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserAnswers>>(
    initialAnswers.budget ? initialAnswers : { budget: 30000 }
  );

  const total = QUESTIONS.length;
  const q = QUESTIONS[step];
  const progress = ((step + 1) / total) * 100;

  const setAnswer = (val: any) => setAnswers((p) => ({ ...p, [q.id]: val }));
  const canContinue = answers[q.id] !== undefined && answers[q.id] !== null;

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else onComplete(answers as UserAnswers);
  };
  const prev = () => {
    if (step === 0) onBack();
    else setStep(step - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ height: 3, background: 'var(--border)', width: '100%', position: 'relative' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', background: 'var(--accent)', position: 'absolute', left: 0, top: 0 }}
        />
      </div>

      <div style={{
        maxWidth: 720, width: '100%', margin: '0 auto',
        padding: '48px 24px 120px', flex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 24,
        }}>
          Question {step + 1} sur {total}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ flex: 1 }}
          >
            <h2 style={{
              fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 700,
              letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px',
            }}>
              {q.title}
            </h2>
            {q.subtitle && (
              <p style={{ fontSize: 17, color: 'var(--ink2)', margin: '0 0 48px', lineHeight: 1.5 }}>
                {q.subtitle}
              </p>
            )}

            {q.type === 'slider' && <SliderInput q={q} value={answers[q.id] as number} onChange={setAnswer} />}
            {q.type === 'cards' && <CardsInput q={q} value={answers[q.id] as string} onChange={setAnswer} />}
            {q.type === 'list' && <ListInput q={q} value={answers[q.id] as string} onChange={setAnswer} />}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 56 }}>
          <GhostButton onClick={prev}>
            <ArrowLeft size={16} strokeWidth={2.5} />
            Précédent
          </GhostButton>
          <PrimaryButton onClick={next} disabled={!canContinue}>
            {step === total - 1 ? "Lancer l'analyse" : 'Continuer'}
            <ArrowRight size={18} strokeWidth={2.5} />
          </PrimaryButton>
        </div>
      </div>
    </motion.div>
  );
}

function SliderInput({ q, value, onChange }: { q: Extract<Q, { type: 'slider' }>; value: number | undefined; onChange: (v: number) => void }) {
  const v = value ?? q.default;
  useEffect(() => { if (value === undefined) onChange(q.default); /* eslint-disable-next-line */ }, []);
  const pct = ((v - q.min) / (q.max - q.min)) * 100;
  return (
    <div>
      <div style={{
        fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 700,
        letterSpacing: '-0.03em', marginBottom: 32,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        {q.format(v)}
      </div>
      <input
        type="range" min={q.min} max={q.max} step={q.step} value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
        }}
      />
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 12,
        fontSize: 13, color: 'var(--ink3)', fontFamily: 'JetBrains Mono, monospace',
      }}>
        <span>{q.format(q.min)}</span>
        <span>{q.format(q.max)}</span>
      </div>
    </div>
  );
}

function CardsInput({ q, value, onChange }: { q: Extract<Q, { type: 'cards' }>; value: string | undefined; onChange: (v: string) => void }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${q.options.length >= 6 ? 160 : 200}px, 1fr))`,
      gap: 12,
    }}>
      {q.options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id} onClick={() => onChange(o.id)}
            style={{
              background: selected ? 'var(--ink)' : '#fff',
              color: selected ? '#fff' : 'var(--ink)',
              border: `1.5px solid ${selected ? 'var(--ink)' : 'var(--border)'}`,
              borderRadius: 16, padding: '20px 16px',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              transform: selected ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: selected ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
              position: 'relative',
            }}
          >
            {selected && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                width: 22, height: 22, background: 'var(--accent)', borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
              }}>
                <Check size={12} strokeWidth={3} />
              </div>
            )}
            {o.emoji && <div style={{ fontSize: 24, marginBottom: 6 }}>{o.emoji}</div>}
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2, letterSpacing: '-0.01em' }}>
              {o.label}
            </div>
            {o.desc && (
              <div style={{ fontSize: 12, color: selected ? 'rgba(255,255,255,0.7)' : 'var(--ink2)', lineHeight: 1.4 }}>
                {o.desc}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ListInput({ q, value, onChange }: { q: Extract<Q, { type: 'list' }>; value: string | undefined; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
      {q.options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id} onClick={() => onChange(o.id)}
            style={{
              background: selected ? 'var(--ink)' : '#fff',
              color: selected ? '#fff' : 'var(--ink)',
              border: `1.5px solid ${selected ? 'var(--ink)' : 'var(--border)'}`,
              borderRadius: 12, padding: '14px 16px',
              cursor: 'pointer', textAlign: 'center',
              fontSize: 15, fontWeight: 600,
              transition: 'all 150ms',
              boxShadow: selected ? 'var(--shadow-md)' : 'none',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
