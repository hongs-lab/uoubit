import { Link, useParams } from 'react-router-dom';
import * as s from './Stock.css';
import { delta } from '@/components/common/Delta.css';
import Panel from '@/components/common/Panel';
import PriceChart from '@/components/common/PriceChart';
import Badge, { ConfidenceBadge } from '@/components/common/Badge';
import Disclaimer from '@/components/common/Disclaimer';
import RankList from '@/components/market/RankList';
import OrderPanel from '@/components/market/OrderPanel';
import { useMarketStore, useTick } from '@/hooks/useMarket';
import { theme } from '@/styles';
import {
  direction,
  formatCap,
  formatPrice,
  formatRate,
  formatRating,
  formatSigned,
} from '@/market/format';

export default function Stock() {
  const { code = '' } = useParams();
  const store = useMarketStore();
  useTick();

  const row = store.getRow(code);

  if (!row) {
    return (
      <main className={s.page}>
        <Panel title="없는 종목">
          <div className={s.notFound}>
            <p>종목코드 {code} 는 상장돼 있지 않습니다.</p>
            <Link to="/" className={s.cta}>
              거래소로
            </Link>
          </div>
        </Panel>
      </main>
    );
  }

  const dir = direction(row.change);
  const dirColor =
    dir === 'rise' ? theme.rise : dir === 'fall' ? theme.fall : theme.flat;

  const peers = store
    .getRows()
    .filter((r) => r.sector === row.sector)
    .sort((a, b) => b.basePrice - a.basePrice);
  const rankInSector = peers.findIndex((r) => r.code === row.code) + 1;

  const overall =
    store.listings
      .slice()
      .sort((a, b) => b.basePrice - a.basePrice)
      .findIndex((l) => l.code === row.code) + 1;

  const maxReviews = Math.max(...store.listings.map((l) => l.reviewCount));

  return (
    <main className={s.page}>
      <Link to="/" className={s.back}>
        ← 거래소
      </Link>

      <div className={s.main}>
        <Panel flush>
          <div className={s.identity}>
            <h1 className={s.name}>{row.name}</h1>
            <span className={s.code}>
              {row.sector} · {row.code}
            </span>
          </div>

          <div className={s.quoteRow}>
            <span className={`${s.price} ${delta[dir]}`}>
              {formatPrice(row.price)}
            </span>
            <span className={s.change}>
              <span className={delta[dir]}>{formatSigned(row.change)}</span>
              <span className={delta[dir]}>{formatRate(row.changeRate)}</span>
            </span>
          </div>
          <p className={s.basis}>
            기준가 {formatPrice(row.basePrice)}원 = 실제 평점{' '}
            {formatRating(row.rating)} / 10점 · 리뷰 {row.reviewCount}건
          </p>

          <div className={s.chartWrap}>
            <PriceChart
              values={row.history}
              baseline={row.basePrice}
              height={240}
              format={formatPrice}
              gridLines={5}
            />
          </div>

          <div className={s.badges}>
            <ConfidenceBadge
              confidence={row.confidence}
              reviewCount={row.reviewCount}
            />
            <Badge tone="fill">
              {row.sector} {rankInSector}위 / {peers.length}명
            </Badge>
            <Badge tone="fill">
              전체 {overall}위 / {store.listings.length}종목
            </Badge>
          </div>

          <div className={s.stats}>
            <div className={s.stat}>
              <span className={s.statLabel}>실제 평점</span>
              <span className={s.statValue}>{formatRating(row.rating)}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>리뷰 수</span>
              <span className={s.statValue}>{row.reviewCount}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>고가</span>
              <span className={`${s.statValue} ${delta.rise}`}>
                {formatPrice(row.high)}
              </span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>저가</span>
              <span className={`${s.statValue} ${delta.fall}`}>
                {formatPrice(row.low)}
              </span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>시가총액</span>
              <span className={s.statValue}>{formatCap(row.marketCap)}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>변동성</span>
              <span className={s.statValue}>
                {(row.volatility * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </Panel>

        <Disclaimer />
      </div>

      <aside className={s.rail}>
        <OrderPanel key={row.code} code={row.code} />

        <Panel title="종목 지표" note="상대 위치">
          <div className={s.gauge}>
            <div className={s.gaugeRow}>
              <p className={s.gaugeHead}>
                <span>평점</span>
                <span>{formatRating(row.rating)} / 10</span>
              </p>
              <span className={s.gaugeTrack}>
                <span
                  className={s.gaugeFill}
                  style={{
                    width: `${(row.rating / 10) * 100}%`,
                    backgroundColor: dirColor,
                  }}
                />
              </span>
            </div>
            <div className={s.gaugeRow}>
              <p className={s.gaugeHead}>
                <span>리뷰 표본</span>
                <span>
                  {row.reviewCount} / 최다 {maxReviews}
                </span>
              </p>
              <span className={s.gaugeTrack}>
                <span
                  className={s.gaugeFill}
                  style={{
                    width: `${Math.max(
                      (row.reviewCount / maxReviews) * 100,
                      2,
                    )}%`,
                    backgroundColor: theme.disabled,
                  }}
                />
              </span>
            </div>
          </div>
        </Panel>

        <a
          className={s.cta}
          href={row.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          별별선생에서 원문 리뷰 보기
        </a>

        <RankList mode="rise" size={6} />
      </aside>
    </main>
  );
}
