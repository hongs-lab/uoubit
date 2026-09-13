import { useMemo } from 'react';
import * as s from './TickerTape.css';
import { delta } from '@/components/common/Delta.css';
import { useMarketStore, useTick } from '@/hooks/useMarket';
import { direction, formatPrice, formatRate } from '@/market/format';
import type { Row } from '@/types/market';

const SIZE = 30;

function Item({ row }: { row: Row }) {
  return (
    <span className={s.item}>
      <span className={s.itemName}>{row.name}</span>
      <span>{formatPrice(row.price)}</span>
      <span className={delta[direction(row.change)]}>
        {formatRate(row.changeRate)}
      </span>
    </span>
  );
}

export default function TickerTape() {
  const store = useMarketStore();
  useTick();

  const codes = useMemo(
    () => store.listings.slice(0, SIZE).map((l) => l.code),
    [store],
  );
  const rows = codes.map((code) => store.getRow(code)!);

  return (
    <div className={s.tape} aria-hidden="true">
      <div className={s.track}>
        {rows.map((r) => (
          <Item key={`a-${r.code}`} row={r} />
        ))}
        {rows.map((r) => (
          <Item key={`b-${r.code}`} row={r} />
        ))}
      </div>
    </div>
  );
}
