import { Link } from 'react-router-dom';
import * as s from './RankList.css';
import { delta } from '@/components/common/Delta.css';
import Panel from '@/components/common/Panel';
import { useMarketStore, useTick } from '@/hooks/useMarket';
import { direction, formatRate } from '@/market/format';

interface Props {
  mode: 'rise' | 'fall';
  size?: number;
}

export default function RankList({ mode, size = 8 }: Props) {
  const store = useMarketStore();
  useTick();

  const rows = store
    .getRows()
    .sort((a, b) =>
      mode === 'rise'
        ? b.changeRate - a.changeRate
        : a.changeRate - b.changeRate,
    )
    .slice(0, size);

  return (
    <Panel title={mode === 'rise' ? '급등' : '급락'} note={`TOP ${size}`} flush>
      <div className={s.list}>
        {rows.map((row, i) => (
          <Link key={row.code} to={`/stocks/${row.code}`} className={s.item}>
            <span className={s.order}>{i + 1}</span>
            <span className={s.name}>
              {row.name}
              <span className={s.sector}>{row.sector}</span>
            </span>
            <span className={`${s.rate} ${delta[direction(row.changeRate)]}`}>
              {formatRate(row.changeRate)}
            </span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
