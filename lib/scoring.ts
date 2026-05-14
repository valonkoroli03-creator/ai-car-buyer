import type { Listing, ScoredListing, UserAnswers } from '@/types';

export function estimateMarketPrice(listing: Partial<Listing>): number | null {
  if (!listing.price || !listing.year || !listing.mileage) return null;
  const age = new Date().getFullYear() - listing.year;
  const make = listing.make || '';
  const isLuxury = /Porsche|Ferrari|Lamborghini|Bentley|McLaren|Maserati|Aston/i.test(make);
  const isPremium =
    /BMW|Mercedes|Audi|Lexus|Tesla|Volvo|Land Rover|Jaguar|Genesis|Mini/i.test(make);

  // Approximate baseline new price by class
  let baseValue: number;
  if (isLuxury) baseValue = 150000;
  else if (isPremium) baseValue = 60000;
  else baseValue = 32000;

  // Adjust for body type
  if (/SUV/i.test(listing.body || '')) baseValue *= 1.15;
  if (/Coupé|Cabriolet/i.test(listing.body || '')) baseValue *= 1.1;

  // Depreciation
  const rate = isLuxury ? 0.10 : isPremium ? 0.13 : 0.16;
  let value = baseValue * Math.pow(1 - rate, age);

  // Mileage adjustment
  const expectedKm = Math.max(age, 1) * 15000;
  const kmDelta = listing.mileage - expectedKm;
  const kmPenalty = (kmDelta / 10000) * (isLuxury ? 2500 : isPremium ? 1400 : 900);
  value -= kmPenalty;

  // Power bonus
  if (listing.power && listing.power > 250) value *= 1.05;

  return Math.max(2000, Math.round(value / 100) * 100);
}

export function scoreListing(
  listing: Partial<Listing> & { id: string },
  answers: UserAnswers
): ScoredListing {
  const marketMid = estimateMarketPrice(listing);
  const priceDelta = marketMid && listing.price ? (listing.price - marketMid) / marketMid : 0;

  // Price score
  let priceScore: number;
  if (priceDelta <= -0.10) priceScore = 1.0;
  else if (priceDelta <= -0.03) priceScore = 0.85;
  else if (priceDelta <= 0.03) priceScore = 0.70;
  else if (priceDelta <= 0.10) priceScore = 0.45;
  else priceScore = 0.20;

  // Technical score
  let techScore = 1.0;
  if (listing.year && listing.mileage) {
    const age = new Date().getFullYear() - listing.year;
    const expectedKm = Math.max(age, 1) * 15000;
    const kmRatio = listing.mileage / expectedKm;
    if (kmRatio > 1.5) techScore -= 0.30;
    else if (kmRatio > 1.2) techScore -= 0.15;
    if (age > 12) techScore -= 0.20;
    else if (age > 8) techScore -= 0.10;
  }
  techScore = Math.max(0, Math.min(1, techScore));

  // Profile match
  let profileScore = 0;
  if (answers.budget && listing.price && listing.price <= answers.budget) profileScore += 0.30;
  else if (answers.budget && listing.price && listing.price <= answers.budget * 1.05) profileScore += 0.15;

  if (answers.priority === 'price') profileScore += priceScore * 0.30;
  else if (answers.priority === 'reliability') {
    const reliable = /Toyota|Honda|Lexus|Mazda|Subaru|Volvo/i.test(listing.make || '');
    profileScore += reliable ? 0.30 : 0.15;
  } else if (answers.priority === 'perf') {
    const sporty = (listing.power || 0) > 200 || /AMG|M\d|RS|S-line|GT/i.test(listing.variant || listing.title || '');
    profileScore += sporty ? 0.30 : 0.15;
  } else profileScore += 0.20;

  if (answers.usage === 'family') {
    if (/SUV|Break|Monospace/i.test(listing.body || '') || (listing.seats || 0) >= 5) profileScore += 0.10;
  } else if (answers.usage === 'city') {
    if (/Citadine|Compact/i.test(listing.body || '') || (listing.power || 999) < 130) profileScore += 0.10;
  }

  if (answers.risk === 'low') {
    const age = listing.year ? new Date().getFullYear() - listing.year : 99;
    if (age <= 5 && (listing.mileage || 0) < 100000) profileScore += 0.20;
    else profileScore += 0.05;
  } else if (answers.risk === 'medium') profileScore += 0.15;
  else profileScore += 0.10;

  profileScore = Math.min(1, profileScore);

  const finalScore = 10 * (0.40 * priceScore + 0.30 * techScore + 0.30 * profileScore);

  // Build initial reasons/warnings (will be overridden by AI)
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (priceDelta < -0.05) reasons.push(`Prix ${Math.abs(priceDelta * 100).toFixed(0)}% sous le marché estimé`);
  else if (Math.abs(priceDelta) < 0.03) reasons.push('Prix cohérent avec le marché');

  if (listing.year && listing.mileage) {
    const age = Math.max(1, new Date().getFullYear() - listing.year);
    const ratio = listing.mileage / (age * 15000);
    if (ratio < 0.9) reasons.push('Kilométrage faible pour son année');
    else if (ratio > 1.3) warnings.push(`Kilométrage élevé (${Math.round(ratio * 100)}% de la moyenne)`);
  }

  if (answers.budget && listing.price && listing.price <= answers.budget) reasons.push('Dans votre budget');
  else if (answers.budget && listing.price && listing.price > answers.budget) {
    warnings.push(`Dépasse votre budget de CHF ${(listing.price - answers.budget).toLocaleString('fr-CH')}`);
  }

  if (priceDelta > 0.08) warnings.push("Prix au-dessus du marché : marge de négociation");
  warnings.push("Demandez le carnet d'entretien complet");

  const full: ScoredListing = {
    id: listing.id,
    url: listing.url || '',
    source: listing.source || 'unknown',
    title: listing.title || '',
    make: listing.make ?? null,
    model: listing.model ?? null,
    variant: listing.variant ?? null,
    price: listing.price ?? null,
    currency: listing.currency || 'CHF',
    year: listing.year ?? null,
    mileage: listing.mileage ?? null,
    fuel: listing.fuel ?? null,
    transmission: listing.transmission ?? null,
    power: listing.power ?? null,
    body: listing.body ?? null,
    seats: listing.seats ?? null,
    doors: listing.doors ?? null,
    color: listing.color ?? null,
    location: listing.location ?? null,
    sellerType: listing.sellerType ?? null,
    daysOnline: listing.daysOnline ?? null,
    images: listing.images || [],
    description: listing.description || '',
    equipments: listing.equipments || [],
    marketMid,
    priceDelta,
    score: Math.round(finalScore * 10) / 10,
    reasons: reasons.slice(0, 4),
    warnings: warnings.slice(0, 3),
  };

  return full;
}

export function scoreAll(
  listings: Array<Partial<Listing> & { id: string }>,
  answers: UserAnswers
): ScoredListing[] {
  return listings.map((l) => scoreListing(l, answers)).sort((a, b) => b.score - a.score);
}
