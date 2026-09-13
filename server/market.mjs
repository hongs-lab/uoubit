import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataset = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../client/src/data/listings.json', import.meta.url)),
    'utf-8',
  ),
);

const MEAN_REVERSION = 0.04;
const BAND = 0.18;
const PRICE_CEIL = 100_000;
const PRICE_FLOOR = 1_000;
const HISTORY_LENGTH = 40;
const INDEX_HISTORY = 120;
export const TICK_MS = 1_000;

const WARMUP_TICKS = INDEX_HISTORY;

function gaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function tickSize(price) {
  if (price < 2_000) return 1;
  if (price < 5_000) return 5;
  if (price < 20_000) return 10;
  if (price < 50_000) return 50;
  return 100;
}

function hashQty(code, tick, level) {
  let h = tick * 2654435761;
  for (let i = 0; i < code.length; i += 1)
    h = (h * 31 + code.charCodeAt(i)) | 0;
  h = (h * 31 + level) | 0;
  return 10 + (Math.abs(h) % 240);
}

export class Market {
  constructor() {
    this.dataset = dataset;
    this.listings = dataset.listings;
    this.byCode = new Map(this.listings.map((l) => [l.code, l]));
    this.tickNo = 0;

    this.volume = new Map();
    this.value = new Map();

    this.quotes = new Map(
      this.listings.map((l) => [
        l.code,
        {
          code: l.code,
          price: l.basePrice,
          prevClose: l.basePrice,
          change: 0,
          changeRate: 0,
          high: l.basePrice,
          low: l.basePrice,
          tick: 0,
          history: Array.from({ length: HISTORY_LENGTH }, () => l.basePrice),
        },
      ]),
    );

    this.indexHistory = Array.from({ length: INDEX_HISTORY }, () => ({
      t: Date.now(),
      value: dataset.indexBase,
    }));
    this.snapshot = this.#snapshot();

    for (let i = 0; i < WARMUP_TICKS; i += 1) this.step();
  }

  step() {
    this.tickNo += 1;
    let advancing = 0;
    let declining = 0;
    let unchanged = 0;

    for (const l of this.listings) {
      const prev = this.quotes.get(l.code);
      const base = l.basePrice;

      const pull = (base - prev.price) * MEAN_REVERSION;
      const shock = gaussian() * l.volatility * base;
      let next = Math.round(prev.price + pull + shock);

      const upper = Math.min(Math.round(base * (1 + BAND)), PRICE_CEIL);
      const lower = Math.max(Math.round(base * (1 - BAND)), PRICE_FLOOR);
      next = Math.min(Math.max(next, lower), upper);

      const change = next - prev.prevClose;
      prev.history.shift();
      prev.history.push(next);

      prev.tick = next > prev.price ? 1 : next < prev.price ? -1 : 0;
      prev.price = next;
      prev.change = change;
      prev.changeRate = (change / prev.prevClose) * 100;
      prev.high = Math.max(prev.high, next);
      prev.low = Math.min(prev.low, next);

      if (change > 0) advancing += 1;
      else if (change < 0) declining += 1;
      else unchanged += 1;
    }

    let cap = 0;
    for (const l of this.listings) {
      cap += this.quotes.get(l.code).price * Math.max(l.reviewCount, 1);
    }
    const index = (cap / dataset.baseMarketCap) * dataset.indexBase;

    this.indexHistory.shift();
    this.indexHistory.push({ t: Date.now(), value: index });
    this.snapshot = this.#snapshot(index, advancing, declining, unchanged);
  }

  #snapshot(
    index = dataset.indexBase,
    advancing = 0,
    declining = 0,
    unchanged = 0,
  ) {
    return {
      index,
      indexChange: index - dataset.indexBase,
      indexChangeRate: ((index - dataset.indexBase) / dataset.indexBase) * 100,
      advancing,
      declining,
      unchanged,
      updatedAt: Date.now(),
    };
  }

  wireTick() {
    return {
      n: this.tickNo,
      p: this.listings.map((l) => this.quotes.get(l.code).price),
      i: Number(this.snapshot.index.toFixed(4)),
      a: this.snapshot.advancing,
      d: this.snapshot.declining,
      u: this.snapshot.unchanged,
      t: this.snapshot.updatedAt,
    };
  }

  fullState() {
    return {
      ...this.wireTick(),
      h: this.listings.map((l) => this.quotes.get(l.code).history),
      ih: this.indexHistory.map((p) => [p.t, Number(p.value.toFixed(4))]),
    };
  }

  price(code) {
    return this.quotes.get(code)?.price;
  }

  book(code, levels = 10) {
    const price = this.price(code);
    if (price === undefined) return null;
    const t = tickSize(price);
    const mid = Math.round(price / t) * t;

    const asks = [];
    const bids = [];
    for (let i = 0; i < levels; i += 1) {
      asks.push({
        price: mid + t * (i + 1),
        qty: hashQty(code, this.tickNo, i),
      });
      bids.push({
        price: mid - t * i,
        qty: hashQty(code, this.tickNo, -i - 1),
      });
    }
    return { code, price, tickSize: t, asks, bids };
  }

  fill(code, side, qty) {
    const book = this.book(code, 10);
    if (!book) return null;
    const levels = side === 'buy' ? book.asks : book.bids;

    let left = qty;
    let notional = 0;
    for (const lv of levels) {
      if (left <= 0) break;
      const take = Math.min(left, lv.qty);
      notional += take * lv.price;
      left -= take;
    }
    if (left > 0) notional += left * levels[levels.length - 1].price;

    return { avgPrice: notional / qty, notional: Math.round(notional) };
  }

  record(code, qty, notional) {
    this.volume.set(code, (this.volume.get(code) ?? 0) + qty);
    this.value.set(code, (this.value.get(code) ?? 0) + notional);
  }

  stats(code) {
    return {
      volume: this.volume.get(code) ?? 0,
      value: this.value.get(code) ?? 0,
    };
  }
}
