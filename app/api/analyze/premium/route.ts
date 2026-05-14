import { NextRequest, NextResponse } from 'next/server';
import { aiPremiumAnalysis } from '@/lib/claude';
import type { ScoredListing, UserAnswers, FreeAnalysis } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scored, answers, freeAnalysis } = body as {
      scored: ScoredListing[];
      answers: UserAnswers;
      freeAnalysis: FreeAnalysis;
    };

    if (!Array.isArray(scored) || scored.length === 0) {
      return NextResponse.json({ error: 'Données scored manquantes.' }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Clé API Anthropic non configurée — analyse premium indisponible.' },
        { status: 503 }
      );
    }

    console.log('[AICB/premium] Analyse premium pour', scored.length, 'annonces');
    const premium = await aiPremiumAnalysis(scored, answers, freeAnalysis);
    return NextResponse.json(premium);
  } catch (err: any) {
    console.error('[AICB/premium] Erreur:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
