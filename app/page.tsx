'use client';

import { useState } from 'react';
import { Landing } from '@/components/Landing';
import { Questionnaire } from '@/components/Questionnaire';
import { LoadingScreen } from '@/components/LoadingScreen';
import { FreeAnalysisScreen } from '@/components/FreeAnalysisScreen';
import { PremiumAnalysisScreen } from '@/components/PremiumAnalysisScreen';
import { PaywallScreen } from '@/components/PaywallScreen';
import { TopBar } from '@/components/TopBar';
import { Footer } from '@/components/Footer';
import type { FreeAnalysis, PremiumAnalysis, UserAnswers, ScoredListing } from '@/types';

type Stage =
  | 'landing'
  | 'questions'
  | 'loading-free'
  | 'free-result'
  | 'paywall'
  | 'loading-premium'
  | 'premium-result'
  | 'error';

export default function Home() {
  const [stage, setStage] = useState<Stage>('landing');
  const [urls, setUrls] = useState<string[]>(['', '']);
  const [answers, setAnswers] = useState<Partial<UserAnswers>>({ budget: 30000 });
  const [freeResult, setFreeResult] = useState<(FreeAnalysis & { _scored?: ScoredListing[]; _answers?: UserAnswers }) | null>(null);
  const [premiumResult, setPremiumResult] = useState<PremiumAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const launchFreeAnalysis = async (finalAnswers: UserAnswers) => {
    setStage('loading-free');
    setError(null);

    const validUrls = urls.filter((u) => u.trim().length > 8 && /^https?:\/\//.test(u));

    try {
      const res = await fetch('/api/analyze/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls, answers: finalAnswers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        setStage('error');
        return;
      }
      setFreeResult(data);
      setStage('free-result');
    } catch (err: any) {
      setError(err?.message || 'Erreur réseau.');
      setStage('error');
    }
  };

  const launchPremiumAnalysis = async () => {
    if (!freeResult) return;
    setStage('loading-premium');
    setError(null);

    try {
      const res = await fetch('/api/analyze/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scored: freeResult._scored,
          answers: freeResult._answers,
          freeAnalysis: {
            listings: freeResult.listings,
            provisionalWinnerId: freeResult.provisionalWinnerId,
            meta: freeResult.meta,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        setStage('error');
        return;
      }
      setPremiumResult(data);
      setStage('premium-result');
    } catch (err: any) {
      setError(err?.message || 'Erreur réseau.');
      setStage('error');
    }
  };

  const restart = () => {
    setStage('landing');
    setUrls(['', '']);
    setAnswers({ budget: 30000 });
    setFreeResult(null);
    setPremiumResult(null);
    setError(null);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopBar onLogo={restart} />

      {stage === 'landing' && (
        <Landing urls={urls} setUrls={setUrls} onContinue={() => setStage('questions')} />
      )}

      {stage === 'questions' && (
        <Questionnaire
          initialAnswers={answers}
          onComplete={(a) => {
            setAnswers(a);
            launchFreeAnalysis(a);
          }}
          onBack={() => setStage('landing')}
        />
      )}

      {stage === 'loading-free' && <LoadingScreen mode="free" />}

      {stage === 'free-result' && freeResult && (
        <FreeAnalysisScreen
          data={freeResult}
          onUnlock={() => setStage('paywall')}
          onRestart={restart}
        />
      )}

      {stage === 'paywall' && (
        <PaywallScreen
          onPay={launchPremiumAnalysis}
          onCancel={() => setStage('free-result')}
        />
      )}

      {stage === 'loading-premium' && <LoadingScreen mode="premium" />}

      {stage === 'premium-result' && premiumResult && (
        <PremiumAnalysisScreen data={premiumResult} onRestart={restart} />
      )}

      {stage === 'error' && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.025em' }}>
            Oups, l'analyse a échoué
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink2)', marginBottom: 32, lineHeight: 1.5 }}>
            {error}
          </p>
          <button
            onClick={restart}
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Recommencer
          </button>
        </div>
      )}

      <Footer />
    </main>
  );
}
