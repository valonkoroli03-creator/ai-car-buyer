import Anthropic from '@anthropic-ai/sdk';
import type {
  Listing, ScoredListing, UserAnswers, FreeAnalysis, PremiumAnalysis,
} from '@/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

// ============================================================
// AI Extraction — fills missing fields from raw HTML
// ============================================================
export async function aiExtractListing(
  partial: Partial<Listing>,
  rawHtml: string
): Promise<Partial<Listing>> {
  const text = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 12000);

  const missing = [];
  if (!partial.make) missing.push('make');
  if (!partial.model) missing.push('model');
  if (!partial.price) missing.push('price');
  if (!partial.year) missing.push('year');
  if (!partial.mileage) missing.push('mileage');
  if (!partial.fuel) missing.push('fuel');
  if (!partial.transmission) missing.push('transmission');
  if (!partial.power) missing.push('power');
  if (!partial.equipments || partial.equipments.length === 0) missing.push('equipments');
  if (missing.length === 0) return partial;

  const prompt = `Tu es un extracteur de données d'annonces automobiles suisses. Analyse ce texte de page et retourne UNIQUEMENT un JSON valide.

Champs (mets null si non trouvé):
- make, model, variant (string)
- price (number, CHF)
- year (number)
- mileage (number, km)
- fuel: "Diesel" | "Essence" | "Hybride" | "Électrique" | "Hybride rechargeable"
- transmission: "Automatique" | "Manuelle"
- power (number, ch)
- torque (number, Nm) — si mentionné
- consumption (number, L/100km) — si mentionné
- emissions (number, g CO2/km) — si mentionné
- body: "Berline" | "Break" | "SUV" | "Coupé" | "Cabriolet" | "Citadine" | "Monospace"
- seats, doors (number)
- color (string)
- location (string, ville)
- previousOwners (number) — si mentionné
- warranty (string) — si mentionnée
- equipments (array of strings, max 20) — toutes les options/équipements visibles
- description (string, max 400 chars)

TEXTE:
${text}

Réponds UNIQUEMENT avec le JSON.`;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const txt = res.content.filter(c => c.type === 'text').map(c => (c as any).text).join('');
    const cleaned = txt.replace(/```json/gi, '').replace(/```/g, '').trim();
    const extracted = JSON.parse(cleaned);

    const merged: Partial<Listing> = { ...partial };
    for (const key of Object.keys(extracted) as (keyof Listing)[]) {
      const aiVal = (extracted as any)[key];
      const cur = (merged as any)[key];
      const empty = cur == null || cur === '' || (Array.isArray(cur) && cur.length === 0);
      if (aiVal != null && aiVal !== '' && empty) (merged as any)[key] = aiVal;
    }
    return merged;
  } catch (err) {
    console.error('[AICB] Extraction IA échouée:', err);
    return partial;
  }
}

// ============================================================
// Free analysis — quick first impression for each listing
// ============================================================
export async function aiFreeAnalysis(
  scored: ScoredListing[],
  answers: UserAnswers
): Promise<FreeAnalysis> {
  const compact = scored.map(s => {
    const { rawHtml, description, equipments, ...rest } = s as any;
    return rest;
  });

  const prompt = `Tu es un conseiller automobile expert pour le marché suisse.

ANNONCES À ANALYSER (ne JAMAIS inventer de véhicules, analyser UNIQUEMENT ces annonces):
${JSON.stringify(compact, null, 2)}

PROFIL UTILISATEUR:
- Ville: ${answers.city}
- Budget max: CHF ${answers.budget.toLocaleString('fr-CH')}
- Usage: ${answers.usage}
- Km annuel: ${answers.annualKm}
- Priorité: ${answers.priority}
- Assurance: ${answers.insurance}
- Profil conducteur: ${answers.driverProfile}

Pour CHAQUE annonce, génère:
- "quickImpression": première impression en 1 phrase max 22 mots, claire et utile (basée sur les vraies données)
- "badges": 1-3 badges parmi ["Bon prix", "Risque élevé", "Premium", "Faible coût", "Kilométrage faible", "Kilométrage élevé", "Récente", "Ancienne", "Forte puissance", "Économique"]
- "scoreAdjustment": entier entre -1.5 et +1.5 pour ajuster le score selon le match avec le profil

Désigne aussi le "provisionalWinnerId" (l'annonce avec le meilleur match global).

Réponds UNIQUEMENT avec ce JSON, sans markdown:
{
  "perListing": {
    "${scored.map(s => s.id).join('": {"quickImpression":"...","badges":[],"scoreAdjustment":0}, "')}": {"quickImpression":"...","badges":[],"scoreAdjustment":0}
  },
  "provisionalWinnerId": "${scored[0].id}"
}`;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const txt = res.content.filter(c => c.type === 'text').map(c => (c as any).text).join('');
    const cleaned = txt.replace(/```json/gi, '').replace(/```/g, '').trim();
    const ai = JSON.parse(cleaned);

    const listings = scored.map(s => {
      const adjust = ai.perListing?.[s.id]?.scoreAdjustment || 0;
      const adjusted = Math.max(0, Math.min(10, s.score + adjust));
      return {
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
        score: Math.round(adjusted * 10) / 10,
        quickImpression: ai.perListing?.[s.id]?.quickImpression || `${s.make || ''} ${s.model || ''} de ${s.year || '?'} avec ${s.mileage ? s.mileage.toLocaleString('fr-CH') + ' km' : 'kilométrage inconnu'}.`,
        badges: ai.perListing?.[s.id]?.badges || [],
      };
    }).sort((a, b) => b.score - a.score);

    return {
      listings,
      provisionalWinnerId: ai.provisionalWinnerId || listings[0].id,
      meta: {
        analyzedCount: listings.length,
        rejectedCount: 0,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (err) {
    console.error('[AICB] Analyse libre IA échouée:', err);
    // Fallback déterministe
    const listings = scored.map(s => ({
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
      quickImpression: `${s.make || ''} ${s.model || ''} de ${s.year || '?'} — ${s.mileage ? s.mileage.toLocaleString('fr-CH') + ' km' : ''}.`,
      badges: s.priceDelta < -0.05 ? ['Bon prix'] : [],
    }));
    return {
      listings,
      provisionalWinnerId: listings[0]?.id || '',
      meta: { analyzedCount: listings.length, rejectedCount: 0, timestamp: new Date().toISOString() },
    };
  }
}

// ============================================================
// Premium analysis — full breakdown with Swiss costs
// ============================================================
export async function aiPremiumAnalysis(
  scored: ScoredListing[],
  answers: UserAnswers,
  freeAnalysis: FreeAnalysis
): Promise<PremiumAnalysis> {
  const compact = scored.map(s => {
    const { rawHtml, ...rest } = s as any;
    return rest;
  });

  // Annual km midpoint for fuel cost
  const kmMidpoint = answers.annualKm === '<10000' ? 8000
    : answers.annualKm === '10000-15000' ? 12500
    : answers.annualKm === '15000-25000' ? 20000
    : 30000;

  const prompt = `Tu es un conseiller automobile expert SENIOR pour le marché suisse, avec expertise:
- Coûts d'assurance auto en Suisse par canton (avec connaissance des barèmes Mobilière, Allianz, Generali, AXA, Zurich Insurance)
- Impôts automobiles cantonaux (SAN Genève, Vaud, Zurich, etc.)
- Marché de l'occasion suisse (AutoScout24.ch tendances)
- Fiabilité mécanique des marques (TÜV, ADAC, Que Choisir)
- Coûts d'entretien réels par marque en CH

CONTEXTE:
Ville: ${answers.city}
Budget: CHF ${answers.budget.toLocaleString('fr-CH')}
Usage: ${answers.usage}
Km annuel estimé: ~${kmMidpoint.toLocaleString('fr-CH')} km
Priorité: ${answers.priority}
Assurance choisie: ${answers.insurance}
Profil: ${answers.driverProfile}

ANNONCES (UNIQUEMENT analyser celles-ci, JAMAIS inventer):
${JSON.stringify(compact, null, 2)}

Génère une analyse PREMIUM complète. Réponds UNIQUEMENT avec ce JSON (pas de markdown, pas de backticks):

{
  "finalSummary": {
    "bestChoiceId": "id de la meilleure annonce",
    "secondChoiceId": "id second choix ou null",
    "avoidId": "id à éviter ou null si aucune",
    "globalScore": 8.4,
    "recommendation": "Phrase claire commençant par 'Nous recommandons ce véhicule car...' (max 50 mots, basée sur VRAIES données)"
  },

  "generalComparison": [
    {"label": "Prix", "values": {"${scored.map(s=>s.id).join('":"...","')}":"..."}},
    {"label": "Année", "values": {...}},
    {"label": "Kilométrage", "values": {...}},
    {"label": "Motorisation", "values": {...}},
    {"label": "Puissance", "values": {...}},
    {"label": "Boîte", "values": {...}},
    {"label": "Carburant", "values": {...}},
    {"label": "Consommation est.", "values": {...}},
    {"label": "Émissions CO2", "values": {...}},
    {"label": "État général", "values": {...}},
    {"label": "Garantie", "values": {...}},
    {"label": "Propriétaires", "values": {...}}
  ],

  "proComparison": {
    "winnerId": "id du gagnant",
    "winnerReason": "Phrase de 30-50 mots expliquant pourquoi cette voiture l'emporte SUR LES VRAIES données: prix, kilométrage, décote, total sur 3 ans. Cite des chiffres concrets (ex: 'écart de CHF 4'000 sur 3 ans').",
    "scores": [
      {
        "listingId": "id de chaque annonce",
        "value": 8.5,         /* Score 0-10 du rapport qualité/prix vs marché */
        "maintenance": 7.8,   /* Score 0-10 de l'entretien : 10 = très peu cher, 0 = très cher */
        "riskInverse": 8.2,   /* Score 0-10 INVERSE du risque : 10 = aucun risque, 0 = très risqué */
        "resale": 8.0         /* Score 0-10 de la facilité de revente et conservation valeur */
      }
    ]
  },

  "engineComparison": [
    {
      "listingId": "...",
      "pros": ["3 avantages concrets du moteur"],
      "cons": ["3 inconvénients concrets"],
      "drivingFeel": "Description agrément (15 mots max)",
      "consumption": "Conso réelle estimée + commentaire",
      "knownReliability": "Fiabilité connue de CE moteur (TÜV/ADAC)",
      "maintenanceCost": "Coût entretien estimé en CHF",
      "mechanicalRisk": "Risque principal du moteur",
      "cityFit": "Note ville /10 + courte explication",
      "highwayFit": "Note autoroute /10 + courte explication",
      "mountainFit": "Note montagne /10 + courte explication",
      "transmissionNote": "Note sur la boîte (auto/manuelle, double embrayage, etc.)"
    }
  ],

  "swissCosts": [
    {
      "listingId": "...",
      "purchasePrice": 18900,
      "insuranceAnnualMin": 1100,
      "insuranceAnnualMax": 1700,
      "insuranceNote": "Estimation pour ${answers.city}, profil ${answers.driverProfile}, ${answers.insurance}. Indicatif — confirmer avec assureur.",
      "plateAnnualMin": 400,
      "plateAnnualMax": 800,
      "plateNote": "Impôt automobile cantonal de ${answers.city}, basé sur puissance/poids/CO2. À confirmer avec SAN.",
      "fuelAnnual": 2400,
      "maintenanceAnnual": 800,
      "tiresAnnual": 350,
      "depreciation3yr": 6500,
      "totalCost3yr": 32000
    }
  ],

  "optionsComparison": [
    {
      "listingId": "...",
      "luxuryPacks": ["S Line", "AMG Line", etc. si présents],
      "comfort": ["sièges chauffants", "climatisation auto", etc.],
      "safety": ["ACC", "lane assist", etc.],
      "technology": ["Apple CarPlay", "cockpit digital", etc.],
      "rare": ["options rares ou différenciantes"],
      "missing": ["options importantes ABSENTES vs concurrent"]
    }
  ],

  "reliability": [
    {
      "listingId": "...",
      "strengths": ["3 points forts mécaniques connus"],
      "knownIssues": ["3 problèmes typiques de ce modèle/moteur"],
      "preBuyChecks": ["3-5 vérifications spécifiques avant achat"],
      "expectedRepairCosts": "Coûts moyens pannes courantes (CHF)",
      "mileageRisk": "low|medium|high",
      "transmissionRisk": "low|medium|high",
      "engineRisk": "low|medium|high",
      "serviceHistoryNote": "Note sur l'historique d'entretien attendu"
    }
  ],

  "resaleAnalysis": [
    {
      "listingId": "...",
      "resaleEase": "easy|moderate|hard",
      "brandImage": "Image de la marque en CH (15 mots)",
      "swissDemand": "Demande sur le marché suisse",
      "expectedDepreciation": "Décote attendue 3 ans (%)",
      "colorConfigNote": "Note sur couleur/config",
      "engineDemand": "Cette motorisation est-elle recherchée?"
    }
  ],

  "negotiation": [
    {
      "listingId": "...",
      "askingPrice": 18900,
      "fairPrice": 18200,
      "targetPrice": 17500,
      "marginPct": 7.4,
      "script": "Bonjour, votre véhicule m'intéresse. Après comparaison avec le marché suisse [argument factuel km/année], je serais prêt à venir le voir rapidement si un prix autour de CHF X'XXX est envisageable. Cordialement,"
    }
  ],

  "finalVerdict": {
    "bestChoice": {"listingId": "...", "reason": "phrase courte"},
    "bestValue": {"listingId": "...", "reason": "phrase courte"},
    "mostReliable": {"listingId": "...", "reason": "phrase courte"},
    "mostExpensiveToRun": {"listingId": "...", "reason": "phrase courte"},
    "avoidIfTight": {"listingId": "...", "reason": "phrase courte"} ou null
  }
}

CONTRAINTES IMPORTANTES:
- Toutes les estimations CH (assurance, plaques) doivent être réalistes et adaptées à ${answers.city}
- Ne JAMAIS inventer une voiture qui n'est pas dans les annonces fournies
- Les 'reasons' et 'recommendations' doivent citer les VRAIES données (km exacts, année exacte)
- Pour assurance et plaques, donne toujours min-max (fourchette) et précise que c'est indicatif
- Tous les coûts en CHF, format nombre entier`;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });
    const txt = res.content.filter(c => c.type === 'text').map(c => (c as any).text).join('');
    const cleaned = txt.replace(/```json/gi, '').replace(/```/g, '').trim();
    const ai = JSON.parse(cleaned) as Omit<PremiumAnalysis, keyof FreeAnalysis>;

    return { ...freeAnalysis, ...ai };
  } catch (err) {
    console.error('[AICB] Analyse premium IA échouée:', err);
    throw new Error("L'analyse premium a échoué. Réessayez dans un instant.");
  }
}
