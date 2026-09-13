export type Confidence = 'low' | 'mid' | 'high';

export interface Listing {
  code: string;
  name: string;
  sector: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  volatility: number;
  confidence: Confidence;
  marketCap: number;
  sourceUrl: string;
}

export interface SectorSeed {
  name: string;
  count: number;
  baseMarketCap: number;
  baseAvgPrice: number;
}

export interface MarketDataset {
  university: string;
  source: string;
  fetchedAt: string;
  indexBase: number;
  baseMarketCap: number;
  stats: {
    surveyed: number;
    listed: number;
    unlisted: number;
    totalReviews: number;
    sectors: number;
  };
  sectors: SectorSeed[];
  listings: Listing[];
}

export interface Quote {
  code: string;
  price: number;
  prevClose: number;
  change: number;
  changeRate: number;
  high: number;
  low: number;
  tick: 1 | -1 | 0;
  history: number[];
}

export type Row = Listing & Quote;

export interface IndexPoint {
  t: number;
  value: number;
}

export interface MarketSnapshot {
  index: number;
  indexChange: number;
  indexChangeRate: number;
  indexHistory: IndexPoint[];
  advancing: number;
  declining: number;
  unchanged: number;
  tradedTicks: number;
  updatedAt: number;
}

export type SortKey =
  'marketCap' | 'changeRate' | 'price' | 'reviewCount' | 'name';
