import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';
import { aiExtractListing, aiFreeAnalysis } from '@/lib/claude';
import { scoreAll } from '@/lib/scoring';
import type { Listing, UserAnswers } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { urls, answers } = body as { urls: string[]; answers: UserAnswers };

    if (!Array.isArray(urls) || urls.length < 1) {
      return NextResponse.json({ error: 'Au moins une URL requise.' }, { status: 400 });
    }
    if (urls.length > 8) {
      return NextResponse.json({ error: 'Maximum 8 annonces.' }, { status: 400 });
    }

    console.log('[AICB/free] Scraping', urls.length, 'URL(s)');
    const scrapeResults = await Promise.allSettled(urls.map((url) => scrapeUrl(url)));

    const scraped: Array<Partial<Listing> & { id: string }> = [];
    const rejected: { url: string; reason: string }[] = [];

    scrapeResults.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        scraped.push({ ...result.value, id: `l${i + 1}`, url: urls[i] });
      } else {
        console.error(`[AICB/free] Échec scraping ${urls[i]}:`, result.reason);
        rejected.push({
          url: urls[i],
          reason: 'Impossible de lire cette annonce — site indisponible ou format inattendu',
        });
      }
    });

    if (scraped.length === 0) {
      return NextResponse.json(
        { error: "Aucune annonce n'a pu être lue. Vérifiez vos liens.", rejected },
        { status: 422 }
      );
    }

    if (process.env.ANTHROPIC_API_KEY) {
      console.log('[AICB/free] Enrichissement IA');
      for (let i = 0; i < scraped.length; i++) {
        const s = scraped[i];
        const needsAI = !s.make || !s.model || !s.price || !s.year || !s.mileage || !s.fuel || !s.power;
        if (needsAI && s.rawHtml) {
          try {
            const enriched = await aiExtractListing(s, s.rawHtml);
            scraped[i] = { ...s, ...enriched, id: s.id, url: s.url, rawHtml: s.rawHtml };
          } catch (err) {
            console.error('[AICB/free] Extraction IA échouée:', err);
          }
        }
      }
    }

    const usable = scraped.filter((s) => s.price && (s.year || s.mileage || s.make));
    scraped.filter((s) => !(s.price && (s.year || s.mileage || s.make))).forEach((u) => {
      rejected.push({
        url: u.url || '',
        reason: 'Données insuffisantes (prix, année ou kilométrage manquants)',
      });
    });

    if (usable.length === 0) {
      return NextResponse.json(
        { error: "Aucune annonce ne contient assez de données pour être analysée.", rejected },
        { status: 422 }
      );
    }

    const scored = scoreAll(usable, answers);
    const cleanScored = scored.map((s) => {
      const { rawHtml, ...rest } = s as any;
      return rest;
    });

    let freeAnalysis;
    if (process.env.ANTHROPIC_API_KEY) {
      freeAnalysis = await aiFreeAnalysis(cleanScored, answers);
    } else {
      // Fallback déterministe
      freeAnalysis = {
        listings: cleanScored.map((s: any) => ({
          id: s.id,
          url: s.url,
          make: s.make,
          model: s.model,
          variant: s.variant,
          price: s.price,
          year: s.year,
          mileage: s.mileage,
          fuel: s.fuel,
          power: s.power,
          transmission: s.transmission,
          images: s.images,
          score: s.score,
          quickImpression: `${s.make || ''} ${s.model || ''} de ${s.year || '?'} avec ${s.mileage ? s.mileage.toLocaleString('fr-CH') + ' km' : 'kilométrage inconnu'}.`,
          badges: s.priceDelta < -0.05 ? ['Bon prix'] : [],
        })),
        provisionalWinnerId: cleanScored[0].id,
        meta: {
          analyzedCount: cleanScored.length,
          rejectedCount: rejected.length,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Stash full scored data (with rawHtml stripped) in the response for premium step.
    // We send back the scored data so the client can call /premium without re-scraping.
    return NextResponse.json({
      ...freeAnalysis,
      _scored: cleanScored,
      _answers: answers,
      rejected,
    });
  } catch (err: any) {
    console.error('[AICB/free] Erreur API:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
