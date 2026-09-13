import * as s from './MarketSummary.css';
import { delta } from '@/components/common/Delta.css';
import Panel from '@/components/common/Panel';
import PriceChart from '@/components/common/PriceChart';
import { useMarketStore, useTick } from '@/hooks/useMarket';
import {
  direction,
  formatIndex,
  formatRate,
  formatSigned,
} from '@/market/format';

export default function MarketSummary() {
  const store = useMarketStore();
  useTick();

  const {
    index,
    indexChange,
    indexChangeRate,
    indexHistory,
    advancing,
    declining,
    unchanged,
    updatedAt,
  } = store.snapshot;
  const dir = direction(indexChangeRate);
  const base = store.dataset.indexBase;

  return (
    <Panel
      title="UOU종합지수"
      note={`${store.dataset.stats.listed}종목 · 시가총액 가중`}
      flush
    >
      <div className={s.grid}>
        <div className={s.left}>
          <p className={s.name}>기준 {base.toLocaleString('ko-KR')}</p>
          <p className={`${s.value} ${delta[dir]}`}>{formatIndex(index)}</p>
          <p className={s.change}>
            <span className={delta[dir]}>{formatSigned(indexChange, 2)}</span>
            <span className={delta[dir]}>{formatRate(indexChangeRate)}</span>
          </p>

          <div className={s.breadth}>
            <div className={s.breadthCell}>
              <span className={s.breadthLabel}>상승</span>
              <span className={`${s.breadthValue} ${delta.rise}`}>
                {advancing}
              </span>
            </div>
            <div className={s.breadthCell}>
              <span className={s.breadthLabel}>보합</span>
              <span className={`${s.breadthValue} ${delta.flat}`}>
                {unchanged}
              </span>
            </div>
            <div className={s.breadthCell}>
              <span className={s.breadthLabel}>하락</span>
              <span className={`${s.breadthValue} ${delta.fall}`}>
                {declining}
              </span>
            </div>
          </div>
        </div>

        <div className={s.right}>
          <p className={s.chartHead}>
            <span>최근 2분 · 1초 체결</span>
            <span>
              {new Date(updatedAt).toLocaleTimeString('ko-KR', {
                hour12: false,
              })}
            </span>
          </p>
          <PriceChart
            values={indexHistory.map((p) => p.value)}
            baseline={base}
            height={168}
            format={formatIndex}
          />
        </div>
      </div>
    </Panel>
  );
}
