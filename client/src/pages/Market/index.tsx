import { useMemo, useState } from 'react';
import * as s from './Market.css';
import Panel from '@/components/common/Panel';
import Disclaimer from '@/components/common/Disclaimer';
import MarketSummary from '@/components/market/MarketSummary';
import SectorBoard from '@/components/market/SectorBoard';
import RankList from '@/components/market/RankList';
import FilterBar, { type Filters } from '@/components/market/FilterBar';
import QuoteTable from '@/components/market/QuoteTable';
import Guide, { type GuideStep } from '@/components/onboarding/Guide';
import { useFirstVisitGuide } from '@/hooks/useFirstVisitGuide';
import { useMarketStore, useTick } from '@/hooks/useMarket';
import type { Row, SortKey } from '@/types/market';

const PAGE_SIZE = 40;

const GUIDE_STEPS: GuideStep[] = [
  {
    target: 'price',
    title: '가격이 곧 평점',
    body: '평점 × 10,000 이 가격이에요. 73,000원이면 7.3점이죠.',
    filled: true,
  },
  {
    target: 'reviews',
    title: '리뷰 수를 보세요',
    body: '리뷰가 적을수록 크게 출렁여요. 믿기 어려운 평점이라는 뜻이에요.',
  },
  {
    target: 'login',
    title: '가입하면 100만원',
    body: '종목을 누르면 호가창이 열려요. 공매도도 됩니다.',
    filled: true,
  },
];

const SORTERS: Record<SortKey, (a: Row, b: Row) => number> = {
  marketCap: (a, b) => b.marketCap - a.marketCap,
  changeRate: (a, b) => b.changeRate - a.changeRate,
  price: (a, b) => b.basePrice - a.basePrice,
  reviewCount: (a, b) => b.reviewCount - a.reviewCount,
  name: (a, b) => a.name.localeCompare(b.name, 'ko'),
};

export default function Market() {
  const store = useMarketStore();
  useTick();

  const [filters, setFilters] = useState<Filters>({
    keyword: '',
    sector: '',
    sort: 'marketCap',
    trustedOnly: false,
  });
  const [visible, setVisible] = useState(PAGE_SIZE);
  const guide = useFirstVisitGuide('market');

  const sectors = useMemo(
    () => store.dataset.sectors.map((x) => x.name),
    [store],
  );
  const maxReviews = useMemo(
    () => Math.max(...store.listings.map((l) => l.reviewCount)),
    [store],
  );

  const rows = store
    .getRows()
    .filter((r) => {
      if (filters.sector && r.sector !== filters.sector) return false;
      if (filters.trustedOnly && r.reviewCount < 4) return false;
      if (filters.keyword) {
        const q = filters.keyword.trim();
        if (!r.name.includes(q) && !r.sector.includes(q)) return false;
      }
      return true;
    })
    .sort(SORTERS[filters.sort]);

  const apply = (next: Filters) => {
    setFilters(next);
    setVisible(PAGE_SIZE);
  };

  return (
    <main className={s.page}>
      <div className={s.main}>
        <MarketSummary />

        <Panel title="시세판" note={filters.sector || '전체 학과'} flush>
          <FilterBar
            filters={filters}
            sectors={sectors}
            resultCount={rows.length}
            onChange={apply}
          />
          <QuoteTable
            rows={rows}
            visible={visible}
            maxReviews={maxReviews}
            onMore={() => setVisible((v) => v + PAGE_SIZE)}
          />
        </Panel>

        <Disclaimer />
      </div>

      <aside className={s.rail}>
        <RankList mode="rise" />
        <RankList mode="fall" />
        <SectorBoard
          selected={filters.sector}
          onSelect={(sector) => apply({ ...filters, sector })}
        />
      </aside>

      {guide.open && (
        <Guide
          label="거래소 안내"
          steps={GUIDE_STEPS}
          greeting={
            <>
              안녕하세요, <b>올리니</b>예요! UOUbit에 오신걸 환영해요!
            </>
          }
          onClose={guide.close}
        />
      )}
    </main>
  );
}
