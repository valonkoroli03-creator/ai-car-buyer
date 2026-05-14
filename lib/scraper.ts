import * as cheerio from 'cheerio';
import type { Listing } from '@/types';

/**
 * AutoScout24 (Switzerland) listings have rich JSON-LD structured data + Next.js
 * __NEXT_DATA__ JSON. We try multiple extraction strategies in order of reliability:
 *  1. __NEXT_DATA__ → most reliable (full structured object)
 *  2. JSON-LD <script type="application/ld+json"> → schema.org/Vehicle
 *  3. Cheerio selectors → fallback
 *  4. Claude AI extraction → last resort
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

export async function fetchListingHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-CH,fr;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
    },
    redirect: 'follow',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} en récupérant ${url}`);
  }
  return await res.text();
}

export function detectSource(url: string): string {
  if (/autoscout24/.test(url)) return 'autoscout24';
  if (/anibis/.test(url)) return 'anibis';
  if (/comparis/.test(url)) return 'comparis';
  if (/ricardo/.test(url)) return 'ricardo';
  if (/leboncoin/.test(url)) return 'leboncoin';
  return 'unknown';
}

// ============================================================
// Generic extractors
// ============================================================
function parseNumber(s: string | undefined | null): number | null {
  if (!s) return null;
  const cleaned = String(s).replace(/[^\d]/g, '');
  if (!cleaned) return null;
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
}

function extractNextData($: cheerio.CheerioAPI): any | null {
  const raw = $('#__NEXT_DATA__').html();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractJsonLd($: cheerio.CheerioAPI): any[] {
  const blocks: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const txt = $(el).html();
      if (!txt) return;
      const obj = JSON.parse(txt);
      if (Array.isArray(obj)) blocks.push(...obj);
      else blocks.push(obj);
    } catch {
      // ignore malformed JSON-LD
    }
  });
  return blocks;
}

// ============================================================
// AutoScout24 scraper (CH)
// ============================================================
function scrapeAutoScout(html: string, url: string): Partial<Listing> {
  const $ = cheerio.load(html);
  const partial: Partial<Listing> = {
    url,
    source: 'autoscout24',
    images: [],
    equipments: [],
    description: '',
    title: '',
    currency: 'CHF',
  };

  // Strategy 1 — __NEXT_DATA__
  const nextData = extractNextData($);
  if (nextData) {
    try {
      // AutoScout24 puts the listing under various paths depending on the page structure.
      // We dig defensively.
      const queries = JSON.stringify(nextData);
      // Heuristic: look for a "listing" or "vehicle" node with price + make
      const found = findListingNode(nextData);
      if (found) {
        if (found.make) partial.make = String(found.make);
        if (found.model) partial.model = String(found.model);
        if (found.modelVersion || found.version) partial.variant = String(found.modelVersion || found.version);
        if (found.price?.amount) partial.price = Number(found.price.amount);
        if (found.price?.currency) partial.currency = String(found.price.currency);
        if (found.firstRegistrationYear) partial.year = Number(found.firstRegistrationYear);
        if (found.year) partial.year = Number(found.year);
        if (found.mileage) partial.mileage = Number(found.mileage);
        if (found.fuelType) partial.fuel = String(found.fuelType);
        if (found.transmissionType) partial.transmission = String(found.transmissionType);
        if (found.bodyType) partial.body = String(found.bodyType);
        if (found.power?.hp) partial.power = Number(found.power.hp);
        if (found.seats) partial.seats = Number(found.seats);
        if (found.doors) partial.doors = Number(found.doors);
        if (found.color) partial.color = String(found.color);
        if (found.images && Array.isArray(found.images)) {
          partial.images = found.images
            .map((im: any) => im?.uri || im?.url || im?.src || (typeof im === 'string' ? im : null))
            .filter(Boolean)
            .slice(0, 8);
        }
        if (found.description) partial.description = String(found.description);
        if (found.location?.city) partial.location = String(found.location.city);
        if (found.seller?.type) {
          partial.sellerType = /private/i.test(found.seller.type) ? 'private' : 'dealer';
        }
        if (found.equipments && Array.isArray(found.equipments)) {
          partial.equipments = found.equipments.map((e: any) => String(e?.name || e)).filter(Boolean);
        }
      }
    } catch {
      // proceed to next strategies
    }
  }

  // Strategy 2 — JSON-LD
  if (!partial.price || !partial.make) {
    const jsonLds = extractJsonLd($);
    for (const ld of jsonLds) {
      const types = Array.isArray(ld['@type']) ? ld['@type'] : [ld['@type']];
      if (types.some((t: string) => /Vehicle|Car|Product/i.test(String(t)))) {
        if (!partial.make && ld.brand?.name) partial.make = String(ld.brand.name);
        if (!partial.model && ld.model) partial.model = String(ld.model);
        if (!partial.year && ld.modelDate) partial.year = parseNumber(ld.modelDate) ?? null;
        if (!partial.mileage && ld.mileageFromOdometer?.value) {
          partial.mileage = parseNumber(ld.mileageFromOdometer.value) ?? null;
        }
        if (!partial.price && ld.offers?.price) partial.price = parseNumber(ld.offers.price) ?? null;
        if (!partial.fuel && ld.fuelType) partial.fuel = String(ld.fuelType);
        if (!partial.transmission && ld.vehicleTransmission)
          partial.transmission = String(ld.vehicleTransmission);
        if ((!partial.images || partial.images.length === 0) && ld.image) {
          const arr = Array.isArray(ld.image) ? ld.image : [ld.image];
          partial.images = arr.map((i: any) => (typeof i === 'string' ? i : i?.url)).filter(Boolean);
        }
        if (!partial.description && ld.description) partial.description = String(ld.description);
      }
    }
  }

  // Strategy 3 — DOM selectors (last resort for AutoScout24)
  // Title
  const h1 = $('h1').first().text().trim();
  if (h1 && !partial.title) partial.title = h1;
  if (!partial.make || !partial.model) {
    const titleParts = h1.split(/\s+/);
    if (titleParts.length >= 2) {
      partial.make = partial.make || titleParts[0];
      partial.model = partial.model || titleParts.slice(1, 3).join(' ');
    }
  }

  // Price (CHF format with apostrophes: 18'900)
  if (!partial.price) {
    const priceText = $('[class*="price" i], [data-testid*="price" i]')
      .first()
      .text()
      .replace(/[^\d']/g, '')
      .replace(/'/g, '');
    if (priceText) partial.price = parseNumber(priceText);
  }

  // Images via og:image / link rel
  if (!partial.images || partial.images.length === 0) {
    const imgs: string[] = [];
    $('meta[property="og:image"]').each((_, el) => {
      const c = $(el).attr('content');
      if (c) imgs.push(c);
    });
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && /\/listings\/|\/cdn\//.test(src) && imgs.length < 8) imgs.push(src);
    });
    partial.images = [...new Set(imgs)].slice(0, 8);
  }

  // Title fallback from og:title
  if (!partial.title) {
    partial.title = $('meta[property="og:title"]').attr('content')?.trim() || '';
  }

  return partial;
}

/**
 * Walk the __NEXT_DATA__ tree to find the most "listing-like" node:
 * - has price + (make or model)
 * - has mileage or year
 */
function findListingNode(obj: any, depth = 0): any | null {
  if (!obj || depth > 8) return null;
  if (typeof obj !== 'object') return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findListingNode(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const hasPrice = obj.price && (obj.price.amount || typeof obj.price === 'number');
  const hasMake = obj.make || obj.brand;
  const hasMileage = obj.mileage != null;
  const hasYear = obj.year != null || obj.firstRegistrationYear != null;

  if (hasPrice && (hasMake || hasMileage || hasYear)) return obj;

  for (const key of Object.keys(obj)) {
    const found = findListingNode(obj[key], depth + 1);
    if (found) return found;
  }
  return null;
}

// ============================================================
// Generic fallback for other sources (Anibis, Comparis, Ricardo)
// ============================================================
function scrapeGeneric(html: string, url: string, source: string): Partial<Listing> {
  const $ = cheerio.load(html);
  const partial: Partial<Listing> = {
    url,
    source,
    title: '',
    images: [],
    equipments: [],
    description: '',
    currency: 'CHF',
  };

  // og:title / og:image
  partial.title = $('meta[property="og:title"]').attr('content')?.trim() || $('h1').first().text().trim();
  partial.description = $('meta[property="og:description"]').attr('content')?.trim() || '';

  const ogImg = $('meta[property="og:image"]').attr('content');
  if (ogImg) partial.images!.push(ogImg);

  // JSON-LD
  const jsonLds = extractJsonLd($);
  for (const ld of jsonLds) {
    if (ld.offers?.price) partial.price = parseNumber(ld.offers.price);
    if (ld.brand?.name) partial.make = ld.brand.name;
    if (ld.model) partial.model = ld.model;
    if (ld.modelDate) partial.year = parseNumber(ld.modelDate);
    if (ld.mileageFromOdometer?.value) partial.mileage = parseNumber(ld.mileageFromOdometer.value);
  }

  // Aggressive text-search for price/year/km in body text
  const bodyText = $('body').text();
  if (!partial.price) {
    const m = bodyText.match(/(?:CHF|Fr\.?)\s*([\d'\s.,]{3,12})/i);
    if (m) partial.price = parseNumber(m[1]);
  }
  if (!partial.year) {
    const yearM = bodyText.match(/\b(19[9]\d|20[0-3]\d)\b/);
    if (yearM) partial.year = parseNumber(yearM[1]);
  }
  if (!partial.mileage) {
    const kmM = bodyText.match(/([\d'\s.,]{3,8})\s*km\b/i);
    if (kmM) partial.mileage = parseNumber(kmM[1]);
  }

  return partial;
}

// ============================================================
// Public API
// ============================================================
export async function scrapeUrl(url: string): Promise<Partial<Listing>> {
  const source = detectSource(url);
  const html = await fetchListingHtml(url);

  let partial: Partial<Listing>;
  if (source === 'autoscout24') {
    partial = scrapeAutoScout(html, url);
  } else {
    partial = scrapeGeneric(html, url, source);
  }

  // Keep a slice of HTML for AI fallback if needed
  partial.rawHtml = html.length > 50000 ? html.slice(0, 50000) : html;

  return partial;
}
