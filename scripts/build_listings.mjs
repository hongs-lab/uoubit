import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const SRC = join(root, 'data', 'professors.json');
const OUT = join(root, 'client', 'src', 'data', 'listings.json');

const INDEX_BASE = 1000;

const ENGINEERING = new Set([
  'IT융합전공',
  '건설환경공학과',
  '건축공학과',
  '건축학',
  '기계자동차공학과',
  '물리학과',
  '산업경영공학',
  '생명과학과',
  '수학과',
  '전기전자공학과',
  '제품환경디자인학',
  '조선해양공학과',
  '주거환경학과',
  '첨단소재공학과',
  '항공우주공학과',
  '화학공학과',
  '화학과',
]);

const isEngineering = (sector) => ENGINEERING.has(sector);

const KO_SUFFIX = [
  '전자',
  '중공업',
  '건설',
  '화학',
  '산업',
  '정밀',
  '소재',
  '물산',
  '상사',
  '제강',
  '정공',
  '전선',
  '기연',
  '중공',
  '홀딩스',
  '금융지주',
  '캐피탈',
  '개발',
  '엔지니어링',
  '테크',
  '시스템',
  '에너지',
  '통상',
  '실업',
  '공업',
];

const EN_SUFFIX = [
  '테크놀로지',
  '랩스',
  '다이내믹스',
  '솔루션즈',
  '네트웍스',
  '시스템즈',
  '바이오',
  '헬스케어',
  '로보틱스',
  '모빌리티',
  '마이크로',
  '세미콘',
  '코퍼레이션',
  '파트너스',
  '인더스트리',
  '소재산업',
  '일렉트릭',
  '이노베이션',
  '인터내셔널',
  '글로벌',
  '파워',
  '미디어',
  '컨설팅',
  '애셋',
  '트러스트',
];

const LATIN_HEAD = [
  'NEX',
  'VEL',
  'ZEN',
  'ORB',
  'LUM',
  'KOR',
  'ARC',
  'TRI',
  'AXI',
  'QUA',
  'HEL',
  'VER',
];
const LATIN_TAIL = ['ORA', 'TEX', 'ION', 'IUM', 'AXIS', 'CORE', 'GEN', 'VIA'];

const STEM_OVERRIDE = {
  스페인중남미학: '스페인',
  글로벌경영학과: '글로벌',
  디지털콘텐츠디자인학과: '디지털',
  스포츠과학과: '스포츠',
};

function stem(sector) {
  if (STEM_OVERRIDE[sector]) return STEM_OVERRIDE[sector];
  const bare = sector.replace(/(학과|학부|전공)$/, '').replace(/[과부]$/, '');
  return (bare.length >= 2 ? bare : sector).slice(0, 2);
}

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
        sector: p.department,
        basePrice: price,
        rating: p.rating,
        reviewCount: p.reviewCount,
        volatility: volatilityOf(p.reviewCount),
        confidence: confidenceOf(p.reviewCount),
        marketCap: marketCapOf(price, p.reviewCount),
      };
    })
    .sort((a, b) => b.marketCap - a.marketCap);

  const sectorOrder = [...new Set(listed.map((l) => l.sector))];
  const seen = new Map();
  const taken = new Set();
  let latin = 0;
  for (const l of listed) {
    const n = (seen.get(l.sector) ?? 0) + 1;
    seen.set(l.sector, n);
    const si = sectorOrder.indexOf(l.sector) + 1;
    l.code = String(si * 1000 + n).padStart(6, '0');

    const head = stem(l.sector);
    const pool = isEngineering(l.sector) ? KO_SUFFIX : EN_SUFFIX;

    let name = '';
    if (n % 5 === 0) {
      for (
        let i = 0;
        i < LATIN_HEAD.length * LATIN_TAIL.length && !name;
        i += 1
      ) {
        const total = LATIN_HEAD.length * LATIN_TAIL.length;
        const j = latin + i;
        const k = (j * 37) % total;
        const candidate =
          LATIN_HEAD[k % LATIN_HEAD.length] +
          LATIN_TAIL[Math.floor(k / LATIN_HEAD.length)];
        if (!taken.has(candidate)) {
          name = candidate;
          latin = j + 1;
        }
      }
    }
    for (let i = 0; i < pool.length && !name; i += 1) {
      const candidate = head + pool[(n - 1 + si + i) % pool.length];
      if (!taken.has(candidate)) name = candidate;
    }
    if (!name) name = `${head}${pool[(n - 1 + si) % pool.length]}${n}`;
    taken.add(name);
    l.name = name;
  }

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
