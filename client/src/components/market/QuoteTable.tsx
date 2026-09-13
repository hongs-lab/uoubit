import { Link, useNavigate } from 'react-router-dom';
import * as s from './QuoteTable.css';
import { delta } from '@/components/common/Delta.css';
import Sparkline from '@/components/common/Sparkline';
import {
  direction,
  formatCap,
  formatPrice,
  formatRate,
  formatSigned,
} from '@/market/format';
import type { Row } from '@/types/market';

interface Props {
  rows: Row[];
  visible: number;
  maxReviews: number;
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
      <td className={s.td}>
        <span className={delta[dir]}>{formatRate(row.changeRate)}</span>
      </td>
      <td className={s.td}>
        <span className={delta[dir]}>{formatSigned(row.change)}</span>
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
              <th className={s.th} scope="col">
                순위
              </th>
              <th className={s.thLeft} scope="col">
                종목 · 학과
              </th>
              <th className={s.th} scope="col">
                현재가
              </th>
              <th className={s.th} scope="col">
                등락률
              </th>
              <th className={s.th} scope="col">
                전일비
              </th>
              <th className={s.th} scope="col">
                차트
              </th>
              <th className={s.th} scope="col">
                리뷰
              </th>
              <th className={s.th} scope="col">
                시총
              </th>
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
