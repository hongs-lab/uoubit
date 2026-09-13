import type {
  IndexPoint,
  Listing,
  MarketDataset,
  MarketSnapshot,
  Quote,
  Row,
} from '@/types/market';
import { createQuote, HISTORY_LENGTH } from './engine';

const INDEX_HISTORY = 120;

interface WireTick {
  n: number;
  p: number[];
  i: number;
  a: number;
  d: number;
  u: number;
  t: number;
}

interface WireFull extends WireTick {
  h: number[][];
  ih: [number, number][];
}

type Listener = () => void;

export class MarketStore {
  readonly dataset: MarketDataset;
  readonly listings: Listing[];
  private readonly byCode: Map<string, Listing>;
  private quotes = new Map<string, Quote>();

  private listeners = new Set<Listener>();
  private source: EventSource | null = null;

  version = 0;

  live = false;

  snapshot: MarketSnapshot;

  constructor(dataset: MarketDataset) {
    this.dataset = dataset;
    this.listings = dataset.listings;
    this.byCode = new Map(dataset.listings.map((l) => [l.code, l]));

    for (const l of dataset.listings) {
      this.quotes.set(l.code, createQuote(l));
    }

    this.snapshot = {
      index: dataset.indexBase,
      indexChange: 0,
      indexChangeRate: 0,
      indexHistory: [],
      advancing: 0,
      declining: 0,
      unchanged: dataset.listings.length,
      tradedTicks: 0,
      updatedAt: Date.now(),
    };
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) this.connect();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.disconnect();
    };
  };

  getVersion = (): number => this.version;

  getQuote(code: string): Quote | undefined {
    return this.quotes.get(code);
  }

  getListing(code: string): Listing | undefined {
    return this.byCode.get(code);
  }

  getRow(code: string): Row | undefined {
    const listing = this.byCode.get(code);
    const quote = this.quotes.get(code);
    return listing && quote ? { ...listing, ...quote } : undefined;
  }

  getRows(): Row[] {
    return this.listings.map((l) => ({ ...l, ...this.quotes.get(l.code)! }));
  }

  getSectorRows() {
    return this.dataset.sectors.map((s) => {
      let sum = 0;
      let count = 0;
      for (const l of this.listings) {
        if (l.sector !== s.name) continue;
        sum += this.quotes.get(l.code)!.price;
        count += 1;
      }
      const avg = count ? sum / count : s.baseAvgPrice;
      const rate = ((avg - s.baseAvgPrice) / s.baseAvgPrice) * 100;
      return { ...s, avgPrice: avg, changeRate: rate };
    });
  }

  private async connect() {
    if (this.source) return;

    try {
      const res = await fetch('/api/quotes');
      if (res.ok) this.seed((await res.json()) as WireFull);
    } catch {}

    if (this.listeners.size === 0) return;

    this.source = new EventSource('/api/stream');
    this.source.onmessage = (e) => this.apply(JSON.parse(e.data) as WireTick);
  }

  private disconnect() {
    this.source?.close();
    this.source = null;
  }

  private seed(full: WireFull) {
    this.listings.forEach((l, i) => {
      const quote = this.quotes.get(l.code)!;
      const history = full.h[i];
      if (history) {
        quote.history = history.slice(-HISTORY_LENGTH);
        quote.high = Math.max(...history);
        quote.low = Math.min(...history);
      }
    });
    this.snapshot = {
      ...this.snapshot,
      indexHistory: full.ih.map(([t, value]) => ({ t, value })),
    };
    this.apply(full);
  }

  private apply(tick: WireTick) {
    this.listings.forEach((l, i) => {
      const price = tick.p[i];
      if (price === undefined) return;

      const quote = this.quotes.get(l.code)!;
      const change = price - quote.prevClose;

      quote.tick = price > quote.price ? 1 : price < quote.price ? -1 : 0;
      quote.price = price;
      quote.change = change;
      quote.changeRate = (change / quote.prevClose) * 100;
      quote.high = Math.max(quote.high, price);
      quote.low = Math.min(quote.low, price);

      quote.history = [...quote.history.slice(1), price];
    });

    const history: IndexPoint[] = this.snapshot.indexHistory.slice(
      this.snapshot.indexHistory.length >= INDEX_HISTORY ? 1 : 0,
    );
    history.push({ t: tick.t, value: tick.i });

    this.snapshot = {
      index: tick.i,
      indexChange: tick.i - this.dataset.indexBase,
      indexChangeRate:
        ((tick.i - this.dataset.indexBase) / this.dataset.indexBase) * 100,
      indexHistory: history,
      advancing: tick.a,
      declining: tick.d,
      unchanged: tick.u,
      tradedTicks: tick.n * this.listings.length,
      updatedAt: tick.t,
    };

    this.live = true;
    this.version += 1;
    for (const listener of this.listeners) listener();
  }
}
