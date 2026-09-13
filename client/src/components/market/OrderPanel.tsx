import { useEffect, useState } from 'react';
import * as s from './OrderPanel.css';
import { delta } from '@/components/common/Delta.css';
import Panel from '@/components/common/Panel';
import { api, ApiError, type OrderBook } from '@/api';
import { useAccount } from '@/hooks/useAccount';
import { theme } from '@/styles';
import { direction, formatCap, formatPrice, formatRate } from '@/market/format';

const POLL_MS = 1_000;

export default function OrderPanel({ code }: { code: string }) {
  const { account, setAccount } = useAccount();
  const [book, setBook] = useState<OrderBook | null>(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    tone: 'ok' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .book(code)
        .then((b) => alive && setBook(b))
        .catch(() => {});
    void load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [code]);

  const held = account?.positions.find((p) => p.code === code);
  const price = book?.price ?? 0;
  const estimate = price * qty;
  const maxDepth = book
    ? Math.max(...book.asks.map((a) => a.qty), ...book.bids.map((b) => b.qty))
    : 1;

  async function submit(side: 'buy' | 'sell') {
    setBusy(true);
    setMessage(null);
    try {
      const result = await api.order(code, side, qty);
      setAccount(result.account);
      setMessage({
        tone: 'ok',
        text: `${side === 'buy' ? '매수' : '매도'} ${qty}주 체결 · 평균 ${formatPrice(
          result.price,
        )}원`,
      });
    } catch (err) {
      setMessage({
        tone: 'error',
        text: err instanceof ApiError ? err.message : '주문이 실패했습니다.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      title="호가"
      note={book ? `${book.tickSize}원 단위` : '불러오는 중'}
      flush
    >
      {book && (
        <div className={s.book}>
          {[...book.asks].reverse().map((lv) => (
            <div key={`a${lv.price}`} className={s.level}>
              <span className={s.levelPrice.ask}>{formatPrice(lv.price)}</span>
              <span className={s.levelQty}>
                <span
                  className={s.depth}
                  style={{
                    width: `${(lv.qty / maxDepth) * 100}%`,
                    backgroundColor: theme.rise,
                  }}
                />
                {lv.qty}
              </span>
            </div>
          ))}

          <div className={s.spread}>
            <span className={delta[direction(book.price - book.bids[0].price)]}>
              {formatPrice(book.price)}
            </span>
            <span>현재가</span>
          </div>

          {book.bids.map((lv) => (
            <div key={`b${lv.price}`} className={s.level}>
              <span className={s.levelPrice.bid}>{formatPrice(lv.price)}</span>
              <span className={s.levelQty}>
                <span
                  className={s.depth}
                  style={{
                    width: `${(lv.qty / maxDepth) * 100}%`,
                    backgroundColor: theme.fall,
                  }}
                />
                {lv.qty}
              </span>
            </div>
          ))}

          <div className={s.stats}>
            <div className={s.stat}>
              <span className={s.statLabel}>거래량</span>
              <span className={s.statValue}>
                {book.volume.toLocaleString('ko-KR')}주
              </span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>거래대금</span>
              <span className={s.statValue}>{formatCap(book.value)}원</span>
            </div>
          </div>
        </div>
      )}

      {!account ? (
        <p className={s.guest}>
          로그인하시면 매수·매도·공매도를 할 수 있습니다.
        </p>
      ) : (
        <div className={s.form}>
          {held && (
            <p className={s.position}>
              <span>
                보유 {held.qty > 0 ? '롱' : '숏'} {Math.abs(held.qty)}주 · 평단{' '}
                {formatPrice(held.avgPrice)}
              </span>
              <span className={delta[direction(held.pnl)]}>
                {formatRate(
                  (held.pnl / (Math.abs(held.avgPrice * held.qty) || 1)) * 100,
                )}
              </span>
            </p>
          )}

          <div className={s.row}>
            <label className={s.label} htmlFor="qty">
              수량
            </label>
            <input
              id="qty"
              className={s.qtyInput}
              type="number"
              min={1}
              max={1_000_000}
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, Math.floor(+e.target.value || 1)))
              }
            />
          </div>

          <div className={s.quickRow}>
            {[1, 10, 100].map((n) => (
              <button
                key={n}
                type="button"
                className={s.quick}
                onClick={() => setQty(n)}
              >
                {n}주
              </button>
            ))}
            <button
              type="button"
              className={s.quick}
              onClick={() =>
                setQty(Math.max(1, Math.floor(account.cash / (price || 1))))
              }
            >
              최대
            </button>
            {held && (
              <button
                type="button"
                className={s.quick}
                onClick={() => setQty(Math.abs(held.qty))}
              >
                청산
              </button>
            )}
          </div>

          <p className={s.estimate}>
            <span>주문금액</span>
            <span>{formatPrice(estimate)}원</span>
          </p>
          <p className={s.estimate}>
            <span>주문가능</span>
            <span>{formatPrice(account.cash)}원</span>
          </p>

          <p className={s.message[message?.tone ?? 'ok']} role="status">
            {message?.text ?? ''}
          </p>

          <div className={s.actions}>
            <button
              type="button"
              className={s.action.buy}
              disabled={busy || !book}
              onClick={() => void submit('buy')}
            >
              매수 · 롱
            </button>
            <button
              type="button"
              className={s.action.sell}
              disabled={busy || !book}
              onClick={() => void submit('sell')}
            >
              매도 · 숏
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
