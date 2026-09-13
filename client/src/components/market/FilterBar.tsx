import * as s from './FilterBar.css';
import type { SortKey } from '@/types/market';

export interface Filters {
  keyword: string;
  sector: string;
  sort: SortKey;
  trustedOnly: boolean;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'marketCap', label: '시총' },
  { key: 'changeRate', label: '등락률' },
  { key: 'price', label: '평점' },
  { key: 'reviewCount', label: '리뷰' },
  { key: 'name', label: '이름' },
];

interface Props {
  filters: Filters;
  sectors: string[];
  resultCount: number;
  onChange: (next: Filters) => void;
}

export default function FilterBar({
  filters,
  sectors,
  resultCount,
  onChange,
}: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className={s.bar}>
      <input
        className={s.search}
        type="search"
        value={filters.keyword}
        placeholder="교수명 · 학과 검색"
        aria-label="교수명 또는 학과 검색"
        onChange={(e) => set('keyword', e.target.value)}
      />

      <select
        className={s.select}
        value={filters.sector}
        aria-label="학과 선택"
        onChange={(e) => set('sector', e.target.value)}
      >
        <option value="">전체 학과</option>
        {sectors.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <span className={s.divider} aria-hidden="true" />

      <div className={s.group} role="group" aria-label="정렬 기준">
        {SORTS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={filters.sort === key}
            className={filters.sort === key ? s.tab.active : s.tab.idle}
            onClick={() => set('sort', key)}
          >
            {label}
          </button>
        ))}
      </div>

      <span className={s.divider} aria-hidden="true" />

      <button
        type="button"
        aria-pressed={filters.trustedOnly}
        className={filters.trustedOnly ? s.tab.active : s.tab.idle}
        onClick={() => set('trustedOnly', !filters.trustedOnly)}
      >
        리뷰 4건+
      </button>

      <output className={s.count}>{resultCount}종목</output>
    </div>
  );
}
