export type Listing = {
  id: string;
  url: string;
  source: string;
  title: string;
  make: string | null;
  model: string | null;
  variant: string | null;
  price: number | null;
  currency: string;
  year: number | null;
  mileage: number | null;
  fuel: string | null;
  transmission: string | null;
  power: number | null;
  torque: number | null;
  consumption: number | null;
  emissions: number | null;
  body: string | null;
  seats: number | null;
  doors: number | null;
  color: string | null;
  location: string | null;
  sellerType: 'private' | 'dealer' | null;
  daysOnline: number | null;
  previousOwners: number | null;
  warranty: string | null;
  images: string[];
  description: string;
  equipments: string[];
  rawHtml?: string;
};

export type SwissCity =
  | 'Genève' | 'Lausanne' | 'Fribourg' | 'Neuchâtel' | 'Sion'
  | 'Zurich' | 'Bâle' | 'Berne' | 'Lugano' | 'Autre';

export type UsageType = 'ville' | 'autoroute' | 'famille' | 'plaisir' | 'business' | 'montagne' | 'mixte';
export type AnnualKm = '<10000' | '10000-15000' | '15000-25000' | '>25000';
export type Priority = 'prix' | 'fiabilite' | 'confort' | 'puissance' | 'consommation' | 'image' | 'revente' | 'couts_bas';
export type InsuranceType = 'rc_simple' | 'casco_partielle' | 'casco_complete';
export type DriverProfile = 'jeune' | 'experimente' | 'famille' | 'professionnel';

export type UserAnswers = {
  budget: number;
  city: SwissCity;
  usage: UsageType;
  annualKm: AnnualKm;
  priority: Priority;
  insurance: InsuranceType;
  driverProfile: DriverProfile;
};

export type ScoredListing = Listing & {
  marketMid: number | null;
  priceDelta: number;
  score: number;
  reasons: string[];
  warnings: string[];
};

export type FreeAnalysis = {
  listings: Array<{
    id: string;
    url: string;
    make: string | null;
    model: string | null;
    variant: string | null;
    price: number | null;
    year: number | null;
    mileage: number | null;
    fuel: string | null;
    power: number | null;
    transmission: string | null;
    images: string[];
    score: number;
    quickImpression: string;
    badges: string[];
  }>;
  provisionalWinnerId: string;
  meta: {
    analyzedCount: number;
    rejectedCount: number;
    timestamp: string;
  };
};

export type PremiumAnalysis = FreeAnalysis & {
  finalSummary: {
    bestChoiceId: string;
    secondChoiceId: string | null;
    avoidId: string | null;
    globalScore: number;
    recommendation: string;
  };

  generalComparison: Array<{
    label: string;
    values: Record<string, string | null>;
  }>;

  engineComparison: Array<{
    listingId: string;
    pros: string[];
    cons: string[];
    drivingFeel: string;
    consumption: string;
    knownReliability: string;
    maintenanceCost: string;
    mechanicalRisk: string;
    cityFit: string;
    highwayFit: string;
    mountainFit: string;
    transmissionNote: string;
  }>;

  swissCosts: Array<{
    listingId: string;
    purchasePrice: number;
    insuranceAnnualMin: number;
    insuranceAnnualMax: number;
    insuranceNote: string;
    plateAnnualMin: number;
    plateAnnualMax: number;
    plateNote: string;
    fuelAnnual: number;
    maintenanceAnnual: number;
    tiresAnnual: number;
    depreciation3yr: number;
    totalCost3yr: number;
  }>;

  optionsComparison: Array<{
    listingId: string;
    luxuryPacks: string[];
    comfort: string[];
    safety: string[];
    technology: string[];
    rare: string[];
    missing: string[];
  }>;

  reliability: Array<{
    listingId: string;
    strengths: string[];
    knownIssues: string[];
    preBuyChecks: string[];
    expectedRepairCosts: string;
    mileageRisk: 'low' | 'medium' | 'high';
    transmissionRisk: 'low' | 'medium' | 'high';
    engineRisk: 'low' | 'medium' | 'high';
    serviceHistoryNote: string;
  }>;

  proComparison: {
    winnerId: string;
    winnerReason: string;     // "Pourquoi X l'emporte..."
    scores: Array<{
      listingId: string;
      value: number;          // 0-10
      maintenance: number;    // 0-10
      riskInverse: number;    // 0-10 (10 = très peu de risque)
      resale: number;         // 0-10
    }>;
  };

  resaleAnalysis: Array<{
    listingId: string;
    resaleEase: 'easy' | 'moderate' | 'hard';
    brandImage: string;
    swissDemand: string;
    expectedDepreciation: string;
    colorConfigNote: string;
    engineDemand: string;
  }>;

  negotiation: Array<{
    listingId: string;
    askingPrice: number;
    fairPrice: number;
    targetPrice: number;
    marginPct: number;
    script: string;
  }>;

  finalVerdict: {
    bestChoice: { listingId: string; reason: string };
    bestValue: { listingId: string; reason: string };
    mostReliable: { listingId: string; reason: string };
    mostExpensiveToRun: { listingId: string; reason: string };
    avoidIfTight: { listingId: string; reason: string } | null;
  };
};
