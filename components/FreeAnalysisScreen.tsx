'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles, Lock, Check, Star, Car, Zap, Shield, TrendingUp, Award } from 'lucide-react';
import { PrimaryButton } from './ui';
import type { FreeAnalysis } from '@/types';

const BADGE_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'Bon prix': { icon: <Check size={11} strokeWidth={3} />, color: '#0A0A0A', bg: '#F5F200' },
  'Risque élevé': { icon: <Shield size={11} strokeWidth={2.5} />, color: '#fff', bg: '#B91C1C' },
  'Premium': { icon: <Star size={11} strokeWidth={2.5} />, color: '#fff', bg: '#0A0A0A' },
  'Faible coût': { icon: <Check size={11} strokeWidth={3} />, color: '#0A0A0A', bg: '#FEF3C7' },
  'Kilométrage faible': { icon: <Zap size={11} strokeWidth={2.5} />, color: '#0A0A0A', bg: '#F5F200' },
  'Kilométrage élevé': { icon: <TrendingUp size={11} strokeWidth={2.5} />, color: '#fff', bg: '#525252' },
  'Récente': { icon: <Sparkles size={11} strokeWidth={2.5} />, color: '#0A0A0A', bg: '#F5F200' },
  'Ancienne': { icon: <Car size={11} strokeWidth={2.5} />, color: '#fff', bg: '#525252' },
  'Forte puissance': { icon: <Zap size={11} strokeWidth={2.5} />, color: '#fff', bg: '#0A0A0A' },
  'Économique': { icon: <Check size={11} strokeWidth={3} />, color: '#0A0A0A', bg: '#FEF3C7' },
};

export function FreeAnalysisScreen({
  data,
  onUnlock,
  onRestart,
}: {
  data: FreeAnalysis;
  onUnlock: () => void;
  onRestart: () => void;
}) {
  const winnerListing = data.listings.find(l => l.id === data.provisionalWinnerId) || data.listings[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px 0' }}
    >
      {/* Header */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--accent)', color: 'var(--ink)',
        padding: '6px 14px', borderRadius: 999,
        fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 24,
      }}>
        <Sparkles size={13} strokeWidth={2.5} />
        ANALYSE GRATUITE
      </div>

      <h1 style={{
        fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700,
        letterSpacing: '-0.035em', lineHeight: 1.05, margin: '0 0 16px',
      }}>
        Voici la <span className="yellow-underline">première analyse</span>.
      </h1>
      <p style={{ fontSize: 18, color: 'var(--ink2)', margin: '0 0 56px', lineHeight: 1.5, maxWidth: 700 }}>
        {data.listings.length} véhicule{data.listings.length > 1 ? 's' : ''} analysé{data.listings.length > 1 ? 's' : ''}.
        Notre choix provisoire :{' '}
        <strong style={{ color: 'var(--ink)' }}>
          {[winnerListing.make, winnerListing.model].filter(Boolean).join(' ')}
        </strong>{' '}
        avec un score de <strong style={{ color: 'var(--ink)' }}>{winnerListing.score}/10</strong>.
      </p>

      {/* Vehicle cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: 20,
        marginBottom: 64,
      }}>
        {data.listings.map((l, i) => {
          const isWinner = l.id === data.provisionalWinnerId;
          return (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              style={{
                background: '#fff',
                border: isWinner ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: isWinner ? '0 12px 40px rgba(245, 242, 0, 0.25)' : 'var(--shadow-sm)',
                position: 'relative',
                transition: 'all 200ms',
              }}
            >
              {isWinner && (
                <div style={{
                  position: 'absolute', top: 16, left: 16, zIndex: 2,
                  background: 'var(--accent)', color: 'var(--ink)',
                  padding: '5px 12px', borderRadius: 999,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  boxShadow: 'var(--shadow-md)',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  <Award size={12} strokeWidth={2.5} />
                  Meilleur choix
                </div>
              )}

              {/* Image */}
              <div style={{
                position: 'relative',
                aspectRatio: '16 / 10',
                background: l.images.length > 0 ? '#000' : 'linear-gradient(135deg, var(--ink) 0%, #1a1a1a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}>
                {l.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.images[0]}
                    alt={`${l.make} ${l.model}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                    onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                  />
                ) : (
                  <Car size={48} strokeWidth={1.5} style={{ opacity: 0.3 }} />
                )}

                {/* Score badge */}
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 64, height: 64, borderRadius: 999,
                  background: '#fff', color: 'var(--ink)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-lg)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {l.score.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.5, marginTop: 1 }}>/ 10</div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 20 }}>
                {l.make && (
                  <div style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                    color: 'var(--ink3)', textTransform: 'uppercase', marginBottom: 4,
                  }}>
                    {l.make}
                  </div>
                )}
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
                  {l.model || ''} {l.variant ? <span style={{ fontWeight: 500, color: 'var(--ink2)' }}>{l.variant}</span> : null}
                </div>

                {/* Specs row */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 6,
                  fontSize: 12, color: 'var(--ink2)', marginBottom: 12,
                }}>
                  {l.year && <span>{l.year}</span>}
                  {l.mileage && <><span style={{ color: 'var(--ink3)' }}>·</span><span>{l.mileage.toLocaleString('fr-CH')} km</span></>}
                  {l.fuel && <><span style={{ color: 'var(--ink3)' }}>·</span><span>{l.fuel}</span></>}
                  {l.transmission && <><span style={{ color: 'var(--ink3)' }}>·</span><span>{l.transmission}</span></>}
                  {l.power && <><span style={{ color: 'var(--ink3)' }}>·</span><span>{l.power} ch</span></>}
                </div>

                {/* Price */}
                {l.price && (
                  <div style={{
                    fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em',
                    fontFamily: 'JetBrains Mono, monospace',
                    marginBottom: 14,
                  }}>
                    CHF {l.price.toLocaleString('fr-CH')}
                  </div>
                )}

                {/* Badges */}
                {l.badges.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {l.badges.map((b, j) => {
                      const cfg = BADGE_ICONS[b] || { icon: null, color: 'var(--ink)', bg: 'var(--bg2)' };
                      return (
                        <span key={j} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: cfg.bg, color: cfg.color,
                          padding: '3px 9px', borderRadius: 999,
                          fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
                        }}>
                          {cfg.icon}
                          {b}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Quick impression */}
                <div style={{
                  fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5,
                  background: 'var(--bg2)',
                  padding: '12px 14px', borderRadius: 10,
                  borderLeft: '3px solid ' + (isWinner ? 'var(--accent)' : 'var(--border)'),
                }}>
                  {l.quickImpression}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* PAYWALL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: 'var(--ink)', color: '#fff',
          borderRadius: 24, padding: 'clamp(32px, 5vw, 56px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          marginBottom: 64,
        }}
      >
        {/* decorative yellow accent */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 300, height: 300, borderRadius: 999,
          background: 'radial-gradient(circle, rgba(245, 242, 0, 0.15) 0%, transparent 70%)',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.08)', color: '#fff',
          padding: '6px 14px', borderRadius: 999,
          fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
          marginBottom: 24, border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <Lock size={13} strokeWidth={2.5} />
          ANALYSE COMPLÈTE
        </div>

        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
          letterSpacing: '-0.03em', lineHeight: 1.1,
          margin: '0 0 16px', color: '#fff', position: 'relative',
        }}>
          Débloquez l'analyse <span style={{ color: 'var(--accent)' }}>complète</span>
        </h2>

        <p style={{
          fontSize: 17, color: 'rgba(255,255,255,0.7)',
          maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.55,
          position: 'relative',
        }}>
          Comparaison détaillée avec estimation des coûts réels en Suisse,
          assurance, plaques, taxes, moteur, fiabilité, valeur de revente
          et recommandation finale personnalisée.
        </p>

        {/* Features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12, maxWidth: 720, margin: '0 auto 36px',
          position: 'relative',
        }}>
          {[
            'Coûts réels en Suisse (assurance, plaques, taxes selon canton)',
            'Comparaison moteur détaillée + risques mécaniques',
            'Analyse de fiabilité par modèle',
            'Options & équipements comparés',
            'Décote prévue + valeur de revente',
            'Script de négociation personnalisé',
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'left',
              padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
              borderRadius: 10, lineHeight: 1.4,
            }}>
              <Check size={14} strokeWidth={2.5} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <PrimaryButton onClick={onUnlock} large>
            <Lock size={18} strokeWidth={2.5} />
            Débloquer l'analyse complète
          </PrimaryButton>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em',
          }}>
            Paiement unique · Aucun abonnement
          </div>
        </div>
      </motion.div>

      {/* Restart link */}
      <div style={{
        textAlign: 'center', paddingBottom: 64,
        fontSize: 14, color: 'var(--ink3)',
      }}>
        <button
          onClick={onRestart}
          style={{
            background: 'none', border: 'none',
            color: 'var(--ink2)', fontWeight: 600,
            cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          Recommencer avec d'autres annonces
        </button>
      </div>
    </motion.div>
  );
}
