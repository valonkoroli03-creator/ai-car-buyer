'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Lock, Check, ArrowLeft, CreditCard, Shield } from 'lucide-react';
import { PrimaryButton, GhostButton } from './ui';

export function PaywallScreen({ onPay, onCancel }: { onPay: () => void; onCancel: () => void }) {
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onPay();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 600, margin: '0 auto', padding: '96px 24px' }}
    >
      <button
        onClick={onCancel}
        style={{
          background: 'none', border: 'none',
          color: 'var(--ink2)', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          marginBottom: 32, padding: 0,
        }}
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        Retour à l'analyse gratuite
      </button>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--accent)', color: 'var(--ink)',
        padding: '6px 14px', borderRadius: 999,
        fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 20,
      }}>
        <Lock size={13} strokeWidth={2.5} />
        ACCÈS PREMIUM
      </div>

      <h1 style={{
        fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 700,
        letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px',
      }}>
        Débloquez l'analyse <span className="yellow-underline">complète</span>
      </h1>

      <p style={{ fontSize: 17, color: 'var(--ink2)', lineHeight: 1.55, marginBottom: 40 }}>
        Comparaison détaillée avec estimation des coûts réels en Suisse, assurance, plaques,
        taxes, moteur, fiabilité, valeur de revente et recommandation finale.
      </p>

      <div style={{
        background: '#fff',
        border: '2px solid var(--ink)',
        borderRadius: 20, padding: 28,
        boxShadow: 'var(--shadow-lg)',
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
              color: 'var(--ink3)', textTransform: 'uppercase', marginBottom: 4,
            }}>
              Paiement unique
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', fontFamily: 'JetBrains Mono, monospace' }}>
              CHF 19.<span style={{ fontSize: 22 }}>00</span>
            </div>
          </div>
          <div style={{
            background: 'var(--accent)', color: 'var(--ink)',
            padding: '6px 12px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          }}>
            INCLUS
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {[
            'Résumé final + verdict en un coup d\'œil',
            'Comparaison technique complète (12 critères)',
            'Analyse moteur détaillée (fiabilité, agrément, coûts)',
            'Coûts réels en Suisse adaptés à votre canton',
            'Estimation assurance + plaques cantonales',
            'Décote sur 3 ans + valeur de revente',
            'Script de négociation personnalisé',
            'Vérifications avant achat spécifiques',
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Check size={16} strokeWidth={3} style={{ color: 'var(--ink)', marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>

        <PrimaryButton onClick={handlePay} disabled={processing} fullWidth large>
          {processing ? (
            <>
              <div className="spin" style={{
                width: 18, height: 18, borderRadius: 999,
                border: '2.5px solid var(--ink)', borderTopColor: 'transparent',
              }} />
              Traitement…
            </>
          ) : (
            <>
              <CreditCard size={18} strokeWidth={2.5} />
              Payer CHF 19 et débloquer
            </>
          )}
        </PrimaryButton>

        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center',
          gap: 8, fontSize: 12, color: 'var(--ink3)', justifyContent: 'center',
        }}>
          <Shield size={12} strokeWidth={2} />
          Paiement sécurisé · Aucun abonnement · Garantie satisfait
        </div>
      </div>

      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 16px',
        fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5,
      }}>
        <strong style={{ color: 'var(--ink)' }}>Mode démo :</strong> ceci est un faux paiement
        pour tester l'application. Aucune transaction réelle n'a lieu. Cliquez sur le bouton
        pour accéder directement à l'analyse complète.
      </div>
    </motion.div>
  );
}
