'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Sparkles, Car, Award, AlertTriangle, Check, X, Copy, Phone, ExternalLink,
  Zap, Shield, TrendingDown, Wrench, Gauge, DollarSign, Star, Settings,
  TrendingUp, MessageSquare, Trophy,
} from 'lucide-react';
import { PrimaryButton, GhostButton } from './ui';
import type { PremiumAnalysis } from '@/types';

export function PremiumAnalysisScreen({
  data,
  onRestart,
}: {
  data: PremiumAnalysis;
  onRestart: () => void;
}) {
  const winner = data.listings.find(l => l.id === data.finalSummary.bestChoiceId) || data.listings[0];
  const second = data.finalSummary.secondChoiceId
    ? data.listings.find(l => l.id === data.finalSummary.secondChoiceId) || null
    : null;

  const carLabel = (id: string) => {
    const l = data.listings.find(x => x.id === id);
    return l ? `${l.make || ''} ${l.model || ''}`.trim() : id;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ background: 'var(--bg)' }}
    >
      {/* Hero */}
      <Section dark>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px 48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent)', color: 'var(--ink)',
            padding: '6px 14px', borderRadius: 999,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 24,
          }}>
            <Sparkles size={13} strokeWidth={2.5} />
            ANALYSE PREMIUM COMPLÈTE
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
            letterSpacing: '-0.035em', lineHeight: 1.05, margin: '0 0 24px', color: '#fff',
          }}>
            Le meilleur choix est{' '}
            <span style={{ color: 'var(--accent)' }}>
              {[winner.make, winner.model].filter(Boolean).join(' ')}
            </span>
          </h1>

          <p style={{
            fontSize: 19, color: 'rgba(255,255,255,0.7)',
            margin: '0 0 32px', lineHeight: 1.5, maxWidth: 720,
          }}>
            {data.finalSummary.recommendation}
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 16,
            background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
            padding: '20px 28px', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999,
              background: 'var(--accent)', color: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
              fontSize: 20, letterSpacing: '-0.03em',
            }}>
              {data.finalSummary.globalScore.toFixed(1)}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 2 }}>
                Score global
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>
                Sur {data.listings.length} véhicule{data.listings.length > 1 ? 's' : ''} analysé{data.listings.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 1 — Final Summary */}
      <Section>
        <SectionTitle eyebrow="01 · RÉSUMÉ FINAL" title="Verdict en un coup d'œil" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          <SummaryCard
            badge="MEILLEUR CHOIX"
            badgeColor="var(--accent)"
            badgeInk="var(--ink)"
            title={carLabel(data.finalSummary.bestChoiceId)}
            highlight
            icon={<Trophy size={20} strokeWidth={2} />}
          />
          {second && (
            <SummaryCard
              badge="DEUXIÈME CHOIX"
              badgeColor="var(--ink)"
              badgeInk="#fff"
              title={carLabel(data.finalSummary.secondChoiceId!)}
              icon={<Award size={20} strokeWidth={2} />}
            />
          )}
          {data.finalSummary.avoidId && (
            <SummaryCard
              badge="À ÉVITER"
              badgeColor="#FEE2E2"
              badgeInk="#B91C1C"
              title={carLabel(data.finalSummary.avoidId)}
              icon={<X size={20} strokeWidth={2} />}
            />
          )}
        </div>
      </Section>

      {/* SECTION 2 — General Comparison */}
      <Section>
        <SectionTitle eyebrow="02 · COMPARAISON GÉNÉRALE" title="Toutes les caractéristiques côte à côte" />
        <ComparisonTable rows={data.generalComparison} listings={data.listings} winnerId={data.finalSummary.bestChoiceId} />
      </Section>

      {/* SECTION 2.5 — Pro Comparison (radar scores) */}
      {data.proComparison && (
        <Section bg2>
          <SectionTitle eyebrow="VUE COMPARATIVE PRO" title="Ce qui compte vraiment" />
          <ProComparisonView data={data.proComparison} listings={data.listings} />
        </Section>
      )}

      {/* SECTION 3 — Engine Comparison */}
      <Section>
        <SectionTitle eyebrow="03 · COMPARAISON MOTEUR" title="Qu'est-ce qui se passe sous le capot" />
        <div style={{ display: 'grid', gap: 16 }}>
          {data.engineComparison.map((e) => {
            const car = data.listings.find(l => l.id === e.listingId);
            const isWinner = e.listingId === data.finalSummary.bestChoiceId;
            return (
              <DetailCard
                key={e.listingId}
                title={`${car?.make || ''} ${car?.model || ''}`}
                subtitle={`${car?.fuel || ''} · ${car?.power || '?'} ch · ${car?.transmission || ''}`}
                isWinner={isWinner}
              >
                <ProsCons pros={e.pros} cons={e.cons} />
                <DetailRow label="Agrément" value={e.drivingFeel} icon={<Gauge size={14} />} />
                <DetailRow label="Consommation" value={e.consumption} icon={<Zap size={14} />} />
                <DetailRow label="Fiabilité connue" value={e.knownReliability} icon={<Shield size={14} />} />
                <DetailRow label="Coût entretien" value={e.maintenanceCost} icon={<DollarSign size={14} />} />
                <DetailRow label="Risque mécanique" value={e.mechanicalRisk} icon={<AlertTriangle size={14} />} />
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
                  marginTop: 12, paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                }}>
                  <FitCard label="Ville" value={e.cityFit} />
                  <FitCard label="Autoroute" value={e.highwayFit} />
                  <FitCard label="Montagne" value={e.mountainFit} />
                </div>
                <DetailRow label="Boîte" value={e.transmissionNote} icon={<Settings size={14} />} />
              </DetailCard>
            );
          })}
        </div>
      </Section>

      {/* SECTION 4 — Swiss Costs */}
      <Section bg2>
        <SectionTitle eyebrow="04 · COÛTS RÉELS EN SUISSE" title="Combien ça coûte vraiment au quotidien" />
        <div style={{ display: 'grid', gap: 16 }}>
          {data.swissCosts.map((c) => {
            const car = data.listings.find(l => l.id === c.listingId);
            const isWinner = c.listingId === data.finalSummary.bestChoiceId;
            return (
              <DetailCard
                key={c.listingId}
                title={`${car?.make || ''} ${car?.model || ''}`}
                subtitle="Estimation annuelle complète"
                isWinner={isWinner}
              >
                <CostRow label="Prix d'achat" value={`CHF ${c.purchasePrice.toLocaleString('fr-CH')}`} />
                <CostRow
                  label="Assurance / an"
                  value={`CHF ${c.insuranceAnnualMin.toLocaleString('fr-CH')} – ${c.insuranceAnnualMax.toLocaleString('fr-CH')}`}
                  note={c.insuranceNote}
                />
                <CostRow
                  label="Plaques / impôt / an"
                  value={`CHF ${c.plateAnnualMin.toLocaleString('fr-CH')} – ${c.plateAnnualMax.toLocaleString('fr-CH')}`}
                  note={c.plateNote}
                />
                <CostRow label="Carburant / an" value={`CHF ${c.fuelAnnual.toLocaleString('fr-CH')}`} />
                <CostRow label="Entretien / an" value={`CHF ${c.maintenanceAnnual.toLocaleString('fr-CH')}`} />
                <CostRow label="Pneus / an" value={`CHF ${c.tiresAnnual.toLocaleString('fr-CH')}`} />
                <CostRow label="Décote sur 3 ans" value={`CHF ${c.depreciation3yr.toLocaleString('fr-CH')}`} />
                <div style={{
                  marginTop: 12, padding: '14px 16px',
                  background: isWinner ? 'var(--accent)' : 'var(--ink)',
                  color: isWinner ? 'var(--ink)' : '#fff',
                  borderRadius: 12,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontWeight: 700,
                }}>
                  <span style={{ fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Coût total estimé sur 3 ans
                  </span>
                  <span style={{ fontSize: 22, fontFamily: 'JetBrains Mono, monospace' }}>
                    CHF {c.totalCost3yr.toLocaleString('fr-CH')}
                  </span>
                </div>
              </DetailCard>
            );
          })}
        </div>
      </Section>

      {/* SECTION 5 — Options */}
      <Section>
        <SectionTitle eyebrow="05 · OPTIONS & ÉQUIPEMENT" title="Ce que vous avez vraiment dans la voiture" />
        <div style={{ display: 'grid', gap: 16 }}>
          {data.optionsComparison.map((o) => {
            const car = data.listings.find(l => l.id === o.listingId);
            const isWinner = o.listingId === data.finalSummary.bestChoiceId;
            return (
              <DetailCard
                key={o.listingId}
                title={`${car?.make || ''} ${car?.model || ''}`}
                subtitle="Équipements détectés et options manquantes"
                isWinner={isWinner}
              >
                {o.luxuryPacks.length > 0 && (
                  <OptGroup title="Packs premium" items={o.luxuryPacks} highlight />
                )}
                {o.comfort.length > 0 && (
                  <OptGroup title="Confort" items={o.comfort} />
                )}
                {o.safety.length > 0 && (
                  <OptGroup title="Sécurité" items={o.safety} />
                )}
                {o.technology.length > 0 && (
                  <OptGroup title="Technologie" items={o.technology} />
                )}
                {o.rare.length > 0 && (
                  <OptGroup title="Options rares" items={o.rare} highlight />
                )}
                {o.missing.length > 0 && (
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#FFFBEB', borderLeft: '3px solid var(--accent)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink2)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Manque vs. concurrents
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {o.missing.map((m, i) => (
                        <span key={i} style={{
                          fontSize: 12, padding: '3px 9px', borderRadius: 999,
                          background: '#fff', color: 'var(--ink2)',
                          border: '1px solid var(--border)', fontWeight: 500,
                        }}>{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </DetailCard>
            );
          })}
        </div>
      </Section>

      {/* SECTION 6 — Reliability */}
      <Section bg2>
        <SectionTitle eyebrow="06 · FIABILITÉ & RISQUES" title="Ce qui peut casser et ce que ça coûte" />
        <div style={{ display: 'grid', gap: 16 }}>
          {data.reliability.map((r) => {
            const car = data.listings.find(l => l.id === r.listingId);
            const isWinner = r.listingId === data.finalSummary.bestChoiceId;
            return (
              <DetailCard
                key={r.listingId}
                title={`${car?.make || ''} ${car?.model || ''}`}
                subtitle="Analyse mécanique"
                isWinner={isWinner}
              >
                <ProsCons pros={r.strengths} cons={r.knownIssues} prosLabel="Points forts" consLabel="Problèmes connus" />

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
                  marginTop: 12, marginBottom: 12,
                }}>
                  <RiskCard label="Kilométrage" risk={r.mileageRisk} />
                  <RiskCard label="Boîte" risk={r.transmissionRisk} />
                  <RiskCard label="Moteur" risk={r.engineRisk} />
                </div>

                <DetailRow label="Coûts réparations" value={r.expectedRepairCosts} icon={<Wrench size={14} />} />
                <DetailRow label="Historique entretien" value={r.serviceHistoryNote} icon={<Shield size={14} />} />

                <div style={{ marginTop: 16 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    color: 'var(--ink2)', textTransform: 'uppercase', marginBottom: 8,
                  }}>
                    À vérifier avant achat
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {r.preBuyChecks.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5,
                          background: 'var(--ink)', color: 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 2,
                        }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>{c}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </DetailCard>
            );
          })}
        </div>
      </Section>

      {/* SECTION 7 — Resale */}
      <Section>
        <SectionTitle eyebrow="07 · REVENTE EN SUISSE" title="Combien vous récupérerez dans 3 ans" />
        <div style={{ display: 'grid', gap: 16 }}>
          {data.resaleAnalysis.map((rs) => {
            const car = data.listings.find(l => l.id === rs.listingId);
            const isWinner = rs.listingId === data.finalSummary.bestChoiceId;
            return (
              <DetailCard
                key={rs.listingId}
                title={`${car?.make || ''} ${car?.model || ''}`}
                subtitle="Marché de l'occasion suisse"
                isWinner={isWinner}
              >
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ResaleBadge ease={rs.resaleEase} />
                  <div style={{ fontSize: 13, color: 'var(--ink2)' }}>Facilité de revente</div>
                </div>
                <DetailRow label="Image marque" value={rs.brandImage} icon={<Star size={14} />} />
                <DetailRow label="Demande CH" value={rs.swissDemand} icon={<TrendingUp size={14} />} />
                <DetailRow label="Décote attendue" value={rs.expectedDepreciation} icon={<TrendingDown size={14} />} />
                <DetailRow label="Couleur / config" value={rs.colorConfigNote} icon={<Settings size={14} />} />
                <DetailRow label="Motorisation" value={rs.engineDemand} icon={<Zap size={14} />} />
              </DetailCard>
            );
          })}
        </div>
      </Section>

      {/* SECTION 8 — Negotiation */}
      <Section bg2>
        <SectionTitle eyebrow="08 · NÉGOCIATION" title="Comment payer le juste prix" />
        <div style={{ display: 'grid', gap: 16 }}>
          {data.negotiation.map((n) => (
            <NegotiationCard key={n.listingId} negotiation={n} listings={data.listings} winnerId={data.finalSummary.bestChoiceId} />
          ))}
        </div>
      </Section>

      {/* SECTION 9 — Verdict */}
      <Section dark>
        <SectionTitle dark eyebrow="09 · VERDICT FINAL" title="Le récap pour décider en 30 secondes" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}>
          <VerdictCard
            badge="🏆 Meilleur choix"
            title={carLabel(data.finalVerdict.bestChoice.listingId)}
            reason={data.finalVerdict.bestChoice.reason}
            highlight
          />
          <VerdictCard
            badge="💰 Meilleur rapport qualité/prix"
            title={carLabel(data.finalVerdict.bestValue.listingId)}
            reason={data.finalVerdict.bestValue.reason}
          />
          <VerdictCard
            badge="🛡 Plus fiable"
            title={carLabel(data.finalVerdict.mostReliable.listingId)}
            reason={data.finalVerdict.mostReliable.reason}
          />
          <VerdictCard
            badge="💸 Plus cher à entretenir"
            title={carLabel(data.finalVerdict.mostExpensiveToRun.listingId)}
            reason={data.finalVerdict.mostExpensiveToRun.reason}
          />
          {data.finalVerdict.avoidIfTight && (
            <VerdictCard
              badge="⚠ À éviter si budget serré"
              title={carLabel(data.finalVerdict.avoidIfTight.listingId)}
              reason={data.finalVerdict.avoidIfTight.reason}
              warning
            />
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <button
            onClick={onRestart}
            style={{
              background: 'var(--accent)', color: 'var(--ink)',
              border: 'none', borderRadius: 12,
              padding: '16px 28px', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', display: 'inline-flex',
              alignItems: 'center', gap: 8,
            }}
          >
            Analyser d'autres annonces
          </button>
        </div>
      </Section>
    </motion.div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================
function Section({ children, bg2, dark }: { children: React.ReactNode; bg2?: boolean; dark?: boolean }) {
  return (
    <section style={{
      background: dark ? 'var(--ink)' : bg2 ? 'var(--bg2)' : 'var(--bg)',
      padding: '64px 0',
    }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px' }}>
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, dark }: { eyebrow: string; title: string; dark?: boolean }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
        color: dark ? 'rgba(255,255,255,0.5)' : 'var(--ink3)',
        textTransform: 'uppercase', marginBottom: 8,
      }}>
        {eyebrow}
      </div>
      <h2 style={{
        fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700,
        letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0,
        color: dark ? '#fff' : 'var(--ink)',
      }}>
        {title}
      </h2>
    </div>
  );
}

function SummaryCard({ badge, badgeColor, badgeInk, title, highlight, icon }: { badge: string; badgeColor: string; badgeInk: string; title: string; highlight?: boolean; icon: React.ReactNode }) {
  return (
    <div style={{
      background: highlight ? 'var(--ink)' : '#fff',
      color: highlight ? '#fff' : 'var(--ink)',
      border: highlight ? 'none' : '1px solid var(--border)',
      borderRadius: 20, padding: 24,
      boxShadow: highlight ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: badgeColor, color: badgeInk,
        padding: '5px 11px', borderRadius: 999,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', marginBottom: 16,
      }}>
        {icon} {badge}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        {title}
      </div>
    </div>
  );
}

function ComparisonTable({ rows, listings, winnerId }: { rows: PremiumAnalysis['generalComparison']; listings: PremiumAnalysis['listings']; winnerId: string }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden', overflowX: 'auto',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
        <thead>
          <tr style={{ background: 'var(--ink)', color: '#fff' }}>
            <th style={{
              padding: '14px 18px', textAlign: 'left',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}></th>
            {listings.map((l) => (
              <th key={l.id} style={{
                padding: '14px 18px', textAlign: 'left',
                fontSize: 13, fontWeight: 600,
                background: l.id === winnerId ? 'var(--accent)' : undefined,
                color: l.id === winnerId ? 'var(--ink)' : '#fff',
              }}>
                {l.id === winnerId && <span style={{ fontSize: 10, marginRight: 6 }}>🏆</span>}
                {[l.make, l.model].filter(Boolean).join(' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <td style={{
                padding: '14px 18px', fontSize: 12, fontWeight: 600,
                color: 'var(--ink2)', letterSpacing: '0.04em', textTransform: 'uppercase',
                background: 'var(--bg2)',
              }}>
                {row.label}
              </td>
              {listings.map((l) => (
                <td key={l.id} style={{
                  padding: '14px 18px', fontSize: 14,
                  background: l.id === winnerId ? 'rgba(245, 242, 0, 0.08)' : '#fff',
                  fontWeight: l.id === winnerId ? 600 : 400,
                  color: 'var(--ink)',
                }}>
                  {row.values[l.id] || <span style={{ color: 'var(--ink3)' }}>—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailCard({ title, subtitle, children, isWinner }: { title: string; subtitle?: string; children: React.ReactNode; isWinner?: boolean }) {
  return (
    <div style={{
      background: '#fff',
      border: isWinner ? '2px solid var(--accent)' : '1px solid var(--border)',
      borderRadius: 16, padding: 24,
      boxShadow: isWinner ? '0 8px 32px rgba(245, 242, 0, 0.15)' : 'var(--shadow-sm)',
      position: 'relative',
    }}>
      {isWinner && (
        <div style={{
          position: 'absolute', top: -10, left: 16,
          background: 'var(--accent)', color: 'var(--ink)',
          padding: '3px 10px', borderRadius: 999,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          🏆 Meilleur choix
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 4 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: 'var(--ink2)' }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function ProsCons({ pros, cons, prosLabel = 'Avantages', consLabel = 'Inconvénients' }: { pros: string[]; cons: string[]; prosLabel?: string; consLabel?: string }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 12, marginBottom: 16,
    }}>
      <div style={{
        background: 'var(--bg2)', borderRadius: 10,
        padding: '12px 14px', borderLeft: '3px solid var(--accent)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink2)', textTransform: 'uppercase', marginBottom: 8 }}>
          {prosLabel}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pros.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, lineHeight: 1.4 }}>
              <Check size={12} strokeWidth={3} style={{ color: 'var(--ink)', marginTop: 3, flexShrink: 0 }} />
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{
        background: '#FFFBEB', borderRadius: 10,
        padding: '12px 14px', borderLeft: '3px solid #B91C1C',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink2)', textTransform: 'uppercase', marginBottom: 8 }}>
          {consLabel}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cons.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, lineHeight: 1.4 }}>
              <X size={12} strokeWidth={3} style={{ color: '#B91C1C', marginTop: 3, flexShrink: 0 }} />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
      padding: '10px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: 'var(--ink2)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}>
        {icon && <span style={{ color: 'var(--ink3)' }}>{icon}</span>}
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink)', textAlign: 'right', maxWidth: '70%', lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}

function FitCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '10px 12px', background: 'var(--bg2)', borderRadius: 8, textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink3)', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

function CostRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink)' }}>
          {value}
        </div>
      </div>
      {note && (
        <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4, lineHeight: 1.4 }}>
          {note}
        </div>
      )}
    </div>
  );
}

function OptGroup({ title, items, highlight }: { title: string; items: string[]; highlight?: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        color: 'var(--ink2)', textTransform: 'uppercase', marginBottom: 6,
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((it, i) => (
          <span key={i} style={{
            fontSize: 12, padding: '3px 9px', borderRadius: 999,
            background: highlight ? 'var(--accent)' : 'var(--bg2)',
            color: 'var(--ink)',
            border: highlight ? 'none' : '1px solid var(--border)',
            fontWeight: highlight ? 600 : 500,
          }}>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function RiskCard({ label, risk }: { label: string; risk: 'low' | 'medium' | 'high' }) {
  const cfg = {
    low: { color: '#0A0A0A', bg: 'var(--accent)', label: 'Faible' },
    medium: { color: '#fff', bg: 'var(--ink)', label: 'Moyen' },
    high: { color: '#fff', bg: '#B91C1C', label: 'Élevé' },
  }[risk];
  return (
    <div style={{
      padding: '12px 10px', background: cfg.bg, color: cfg.color, borderRadius: 10, textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{cfg.label}</div>
    </div>
  );
}

function ResaleBadge({ ease }: { ease: 'easy' | 'moderate' | 'hard' }) {
  const cfg = {
    easy: { color: '#0A0A0A', bg: 'var(--accent)', label: 'Facile' },
    moderate: { color: '#fff', bg: 'var(--ink)', label: 'Modérée' },
    hard: { color: '#fff', bg: '#B91C1C', label: 'Difficile' },
  }[ease];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 11px', borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
    }}>
      {cfg.label}
    </span>
  );
}

function NegotiationCard({ negotiation, listings, winnerId }: { negotiation: PremiumAnalysis['negotiation'][0]; listings: PremiumAnalysis['listings']; winnerId: string }) {
  const car = listings.find(l => l.id === negotiation.listingId);
  const isWinner = negotiation.listingId === winnerId;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(negotiation.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {}
  };

  return (
    <DetailCard
      title={`${car?.make || ''} ${car?.model || ''}`}
      subtitle="Stratégie de négociation"
      isWinner={isWinner}
    >
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 16,
      }}>
        <PriceColumn label="Prix affiché" value={negotiation.askingPrice} />
        <PriceColumn label="Prix juste" value={negotiation.fairPrice} />
        <PriceColumn label="Prix cible" value={negotiation.targetPrice} highlight />
      </div>

      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 12, padding: 18,
        fontSize: 13.5, lineHeight: 1.6,
        fontFamily: 'JetBrains Mono, monospace',
        whiteSpace: 'pre-wrap', marginBottom: 12,
      }}>
        {negotiation.script}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={copy}
          style={{
            background: 'var(--accent)', color: 'var(--ink)',
            border: 'none', borderRadius: 10,
            padding: '10px 16px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'all 150ms',
          }}
        >
          {copied ? <><Check size={14} strokeWidth={3} />Copié</> : <><Copy size={14} strokeWidth={2.5} />Copier le message</>}
        </button>
        {car?.url && (
          <a
            href={car.url} target="_blank" rel="noreferrer"
            style={{
              background: '#fff', color: 'var(--ink)',
              border: '1.5px solid var(--border)', borderRadius: 10,
              padding: '10px 16px', fontSize: 14, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} strokeWidth={2.5} />
            Ouvrir l'annonce
          </a>
        )}
      </div>

      <div style={{
        marginTop: 12, fontSize: 12, color: 'var(--ink3)',
        fontWeight: 500,
      }}>
        Marge de négociation réaliste : {negotiation.marginPct.toFixed(1)}%
      </div>
    </DetailCard>
  );
}

function PriceColumn({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: highlight ? 'var(--ink)' : 'var(--bg2)',
      color: highlight ? '#fff' : 'var(--ink)',
      borderRadius: 12, textAlign: 'center',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', opacity: 0.6, marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 18, fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        color: highlight ? 'var(--accent)' : 'var(--ink)',
      }}>
        CHF {value.toLocaleString('fr-CH')}
      </div>
    </div>
  );
}

function VerdictCard({ badge, title, reason, highlight, warning }: { badge: string; title: string; reason: string; highlight?: boolean; warning?: boolean }) {
  return (
    <div style={{
      background: highlight ? 'var(--accent)' : warning ? '#7F1D1D' : 'rgba(255,255,255,0.05)',
      color: highlight ? 'var(--ink)' : '#fff',
      border: highlight ? 'none' : warning ? 'none' : '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16, padding: 20,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
        marginBottom: 12, opacity: highlight ? 1 : 0.7,
      }}>
        {badge}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 8, lineHeight: 1.2 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.5, opacity: highlight ? 0.8 : 0.7 }}>
        {reason}
      </div>
    </div>
  );
}

// ============================================================
// PRO COMPARISON VIEW — radar-style scores comparison
// ============================================================
function ProComparisonView({ data, listings }: { data: PremiumAnalysis['proComparison']; listings: PremiumAnalysis['listings'] }) {
  const winner = listings.find(l => l.id === data.winnerId);
  const winnerScores = data.scores.find(s => s.listingId === data.winnerId);

  const labels: Array<{ key: keyof Omit<PremiumAnalysis['proComparison']['scores'][0], 'listingId'>; label: string; description: string }> = [
    { key: 'value', label: 'Valeur', description: 'Rapport qualité/prix vs marché' },
    { key: 'maintenance', label: 'Entretien', description: 'Coûts d\'entretien (10 = très bas)' },
    { key: 'riskInverse', label: 'Risque inversé', description: 'Fiabilité (10 = aucun risque)' },
    { key: 'resale', label: 'Revente', description: 'Conservation de la valeur' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Winner banner */}
      {winner && winnerScores && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--ink)',
            color: '#fff',
            borderRadius: 20,
            padding: 'clamp(24px, 4vw, 36px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 240, height: 240, borderRadius: 999,
            background: 'radial-gradient(circle, rgba(245, 242, 0, 0.18) 0%, transparent 70%)',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', color: 'var(--ink)',
            padding: '4px 11px', borderRadius: 999,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 16,
            position: 'relative',
          }}>
            <Trophy size={11} strokeWidth={2.5} />
            Gagnante
          </div>

          <div style={{
            fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700,
            letterSpacing: '-0.02em', marginBottom: 4, position: 'relative',
          }}>
            {winner.make} {winner.model}
          </div>
          <div style={{
            fontSize: 14, color: 'rgba(255,255,255,0.6)',
            marginBottom: 24, position: 'relative',
          }}>
            CHF {winner.price?.toLocaleString('fr-CH')} · Score {winner.score.toFixed(1)}/10
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12, position: 'relative',
          }}>
            {labels.map((l) => (
              <div key={l.key} style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '14px 16px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                  color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                  marginBottom: 6,
                }}>
                  {l.label}
                </div>
                <div style={{
                  fontSize: 24, fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: 'var(--accent)', letterSpacing: '-0.02em',
                }}>
                  {winnerScores[l.key].toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All cars: bar comparison */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {data.scores.map((s, idx) => {
          const car = listings.find(l => l.id === s.listingId);
          const isWinner = s.listingId === data.winnerId;
          if (!car) return null;
          return (
            <motion.div
              key={s.listingId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: '#fff',
                border: isWinner ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 16,
                padding: 22,
                boxShadow: isWinner ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12, flexWrap: 'wrap',
                marginBottom: 18,
              }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em' }}>
                    {car.make} {car.model}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 2 }}>
                    CHF {car.price?.toLocaleString('fr-CH')} · Score {car.score.toFixed(1)}/10
                  </div>
                </div>
                {isWinner && (
                  <div style={{
                    background: 'var(--accent)', color: 'var(--ink)',
                    padding: '4px 10px', borderRadius: 999,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    <Trophy size={11} strokeWidth={2.5} />
                    GAGNANTE
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {labels.map((l) => (
                  <ScoreBar
                    key={l.key}
                    label={l.label}
                    description={l.description}
                    score={s[l.key]}
                    highlight={isWinner}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Why winner — narrative card */}
      {data.winnerReason && (
        <div style={{
          background: 'var(--accent)',
          borderRadius: 16,
          padding: 'clamp(20px, 3vw, 28px)',
          border: '2px solid var(--ink)',
          position: 'relative',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--ink)', color: 'var(--accent)',
            padding: '4px 10px', borderRadius: 999,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 14,
          }}>
            <Sparkles size={11} strokeWidth={2.5} />
            Verdict
          </div>
          <div style={{
            fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: 1.55,
            color: 'var(--ink)',
            fontWeight: 500,
          }}>
            {data.winnerReason}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, description, score, highlight }: {
  label: string;
  description: string;
  score: number;
  highlight?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, score * 10));
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 6,
      }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
          <span style={{ fontSize: 11, color: 'var(--ink3)', marginLeft: 8 }}>{description}</span>
        </div>
        <div style={{
          fontSize: 16, fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--ink)',
          letterSpacing: '-0.01em',
        }}>
          {score.toFixed(1)}
        </div>
      </div>
      <div style={{
        height: 8, background: 'var(--bg2)',
        borderRadius: 999, overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            height: '100%',
            background: highlight ? 'var(--accent)' : 'var(--ink)',
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
