import * as s from './SectorBoard.css';
import { delta } from '@/components/common/Delta.css';
import Panel from '@/components/common/Panel';
import { useMarketStore, useTick } from '@/hooks/useMarket';
import { direction, formatRate, formatRating } from '@/market/format';

interface Props {
  selected: string;
  onSelect: (sector: string) => void;
  size?: number;
}

export default function SectorBoard({ selected, onSelect, size = 12 }: Props) {
  const store = useMarketStore();
  useTick();

  const sectors = store.getSectorRows().slice(0, size);

  return (
    <Panel title="학과 지수" note={`상위 ${size}개 · 평균 평점`} flush>
      <div className={s.list}>
        {sectors.map((sector) => {
          const active = selected === sector.name;
          return (
            <button
              key={sector.name}
              type="button"
              aria-pressed={active}
              className={active ? s.rowActive : s.row}
              onClick={() => onSelect(active ? '' : sector.name)}
            >
              <span className={s.name}>
                {sector.name}
                <span className={s.count}> {sector.count}</span>
              </span>
              <span className={s.avg}>
                {formatRating(sector.avgPrice / 10000)}
              </span>
              <span
                className={`${s.rate} ${delta[direction(sector.changeRate)]}`}
              >
                {formatRate(sector.changeRate)}
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
