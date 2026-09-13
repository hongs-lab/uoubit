import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const SRC = join(root, 'data', 'professors.json');
const OUT = join(root, 'client', 'src', 'data', 'listings.json');

const INDEX_BASE = 1000;

function volatilityOf(reviewCount) {
  return Number((0.012 / Math.sqrt(Math.max(reviewCount, 1))).toFixed(5));
}

function confidenceOf(reviewCount) {
  if (reviewCount >= 10) return 'high';
  if (reviewCount >= 4) return 'mid';
  return 'low';
}

function marketCapOf(price, reviewCount) {
  return price * Math.max(reviewCount, 1);
}

function main() {
  const raw = JSON.parse(readFileSync(SRC, 'utf-8'));

  const listed = raw.professors
    .filter((p) => p.rating > 0 && p.reviewCount > 0)
    .map((p) => {
      const price = Math.round(p.rating * 10000);
      return {
        code: String(p.id).padStart(6, '0'),
        name: p.name,
        sector: p.department,
        basePrice: price,
        rating: p.rating,
        reviewCount: p.reviewCount,
        volatility: volatilityOf(p.reviewCount),
        confidence: confidenceOf(p.reviewCount),
        marketCap: marketCapOf(price, p.reviewCount),
        sourceUrl: p.sourceUrl,
      };
    })
    .sort((a, b) => b.marketCap - a.marketCap);

  const baseMarketCap = listed.reduce((sum, l) => sum + l.marketCap, 0);

  const sectors = [...new Set(listed.map((l) => l.sector))]
    .map((name) => {
      const members = listed.filter((l) => l.sector === name);
      return {
        name,
        count: members.length,
        baseMarketCap: members.reduce((s, m) => s + m.marketCap, 0),
        baseAvgPrice: Math.round(
          members.reduce((s, m) => s + m.basePrice, 0) / members.length,
        ),
      };
    })
    .sort((a, b) => b.baseMarketCap - a.baseMarketCap);

  const payload = {
    university: raw.university,
    source: raw.source,
    fetchedAt: raw.fetchedAt,
    indexBase: INDEX_BASE,
    baseMarketCap,
    stats: {
      surveyed: raw.total,
      listed: listed.length,
      unlisted: raw.total - listed.length,
      totalReviews: listed.reduce((s, l) => s + l.reviewCount, 0),
      sectors: sectors.length,
    },
    sectors,
    listings: listed,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload), 'utf-8');

  console.log(
    `상장 ${listed.length}종목 / 미상장 ${payload.stats.unlisted}명 / 섹터 ${sectors.length}개 -> ${OUT}`,
  );
}

main();
