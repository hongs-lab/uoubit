import type { Listing, Quote } from '@/types/market';

export const HISTORY_LENGTH = 40;

export function createQuote(listing: Listing): Quote {
  return {
    code: listing.code,
    price: listing.basePrice,
    prevClose: listing.basePrice,
    change: 0,
    changeRate: 0,
    high: listing.basePrice,
    low: listing.basePrice,
    tick: 0,
    history: Array.from({ length: HISTORY_LENGTH }, () => listing.basePrice),
  };
}
