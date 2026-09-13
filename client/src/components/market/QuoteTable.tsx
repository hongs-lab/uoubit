import { Link, useNavigate } from 'react-router-dom';
import * as s from './QuoteTable.css';
import { delta } from '@/components/common/Delta.css';
import Sparkline from '@/components/common/Sparkline';
import { direction, formatCap, formatPrice, formatRate } from '@/market/format';
import type { Row, SortDir, SortKey } from '@/types/market';

const COLUMNS: {
  key: SortKey | null;
  label: string;
  align?: 'left';
}[] = [
  { key: null, label: '순위' },
  { key: 'name', label: '종목 · 학과', align: 'left' },
  { key: 'price', label: '현재가' },
  { key: 'high', label: '고가' },
  { key: 'low', label: '저가' },
  { key: 'changeRate', label: '등락률' },
  { key: null, label: '차트' },
  { key: 'reviewCount', label: '리뷰' },
  { key: 'marketCap', label: '시총' },
];

interface Props {
  rows: Row[];
  visible: number;
  maxReviews: number;
  sort: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  onMore: () => void;
}

function QuoteRow({
  row,
  rank,
  maxReviews,
  onOpen,
}: {
  row: Row;
  rank: number;
  maxReviews: number;
  onOpen: (code: string) => void;
}) {
  const dir = direction(row.change);
  const tickDir = row.tick > 0 ? 'rise' : row.tick < 0 ? 'fall' : 'flat';

  return (
    <tr className={s.row} onClick={() => onOpen(row.code)}>
      <td className={s.rank}>{rank}</td>
      <td className={s.nameCell}>
        <span className={s.nameStack}>
          <Link className={s.name} to={`/stocks/${row.code}`}>
            {row.name}
          </Link>
          <span className={s.sector}>
            {row.sector} · {row.code}
          </span>
        </span>
      </td>
      <td key={row.price} className={s.priceCell[tickDir]}>
        <span data-tour={rank === 1 ? 'price' : undefined}>
          {formatPrice(row.price)}
        </span>
      </td>
      <td className={s.td}>{formatPrice(row.high)}</td>
      <td className={s.td}>{formatPrice(row.low)}</td>
      <td className={s.td}>
        <span className={delta[dir]}>{formatRate(row.changeRate)}</span>
      </td>
      <td className={s.chartCell}>
        <span className={s.chartInner}>
          <Sparkline values={row.history} baseline={row.prevClose} />
        </span>
      </td>
      <td className={s.volumeCell}>
        <span
          className={s.volumeBar}
          data-tour={rank === 1 ? 'reviews' : undefined}
        >
          <span>{row.reviewCount}</span>
          <span className={s.volumeTrack}>
            <span
              className={s.volumeFill}
              style={{
                width: `${Math.max((row.reviewCount / maxReviews) * 100, 4)}%`,
              }}
            />
          </span>
        </span>
      </td>
      <td className={s.capCell}>{formatCap(row.marketCap)}</td>
    </tr>
  );
}

export default function QuoteTable({
  rows,
  visible,
  maxReviews,
  sort,
  dir,
  onSort,
  onMore,
}: Props) {
  const navigate = useNavigate();
  const shown = rows.slice(0, visible);

  if (rows.length === 0) {
    return <p className={s.empty}>조건에 맞는 종목이 없습니다.</p>;
  }

  return (
    <>
      <div className={s.scroll}>
        <table className={s.table}>
          <caption className="sr-only">울산대학교 교수 평점 시세표</caption>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  scope="col"
                  className={col.align === 'left' ? s.thLeft : s.th}
                  aria-sort={
                    col.key && col.key === sort
                      ? dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {col.key ? (
                    <button
                      type="button"
                      className={s.sortButton}
                      onClick={() => onSort(col.key!)}
                    >
                      {col.label}
                      <span
                        className={col.key === sort ? s.arrow.on : s.arrow.off}
                        aria-hidden="true"
                      >
                        {col.key === sort && dir === 'asc' ? '▲' : '▼'}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <QuoteRow
                key={row.code}
                row={row}
                rank={i + 1}
                maxReviews={maxReviews}
                onOpen={(code) => navigate(`/stocks/${code}`)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {visible < rows.length && (
        <button type="button" className={s.more} onClick={onMore}>
          {rows.length - visible}종목 더 보기
        </button>
      )}
    </>
  );
}
