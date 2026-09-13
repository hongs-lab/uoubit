import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as s from './Portfolio.css';
import { delta } from '@/components/common/Delta.css';
import Panel from '@/components/common/Panel';
import Badge from '@/components/common/Badge';
import { api, type RankRow, type Trade } from '@/api';
import { useAccount } from '@/hooks/useAccount';
import { useTick } from '@/hooks/useMarket';
import {
  direction,
  formatPrice,
  formatRate,
  formatSigned,
} from '@/market/format';

export default function Portfolio() {
  const { account, loading, refresh } = useAccount();
  const tick = useTick();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ranking, setRanking] = useState<RankRow[]>([]);

  const username = account?.username;

  useEffect(() => {
    if (!username) return;
    void api
      .trades()
      .then((r) => setTrades(r.trades))
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    void api
      .ranking()
      .then((r) => setRanking(r.ranking))
      .catch(() => {});
  }, []);

  const loggedIn = username !== undefined;
  useEffect(() => {
    if (loggedIn && tick % 10 === 0) void refresh();
  }, [tick, loggedIn, refresh]);

  if (loading) return <main className={s.page} />;

  if (!account) {
    return (
      <main className={s.page}>
        <Panel title="내 계좌">
          <p className={s.empty}>
            로그인하시면 잔고와 보유 종목을 볼 수 있습니다.{' '}
            <Link to="/" style={{ textDecoration: 'underline' }}>
              거래소로
            </Link>
          </p>
        </Panel>
      </main>
    );
  }

  const dir = direction(account.pnl);

  return (
    <main className={s.page}>
      <div className={s.main}>
        <Panel title={`${account.username} 계좌`} note="평가손익 실시간" flush>
          <div className={s.summary}>
            <div className={s.cell}>
              <span className={s.cellLabel}>총 평가금액</span>
              <span className={s.cellValue}>{formatPrice(account.equity)}</span>
            </div>
            <div className={s.cell}>
              <span className={s.cellLabel}>주문가능 현금</span>
              <span className={s.cellValue}>{formatPrice(account.cash)}</span>
            </div>
            <div className={s.cell}>
              <span className={s.cellLabel}>총 손익</span>
              <span className={`${s.cellValue} ${delta[dir]}`}>
                {formatSigned(account.pnl)}
              </span>
            </div>
            <div className={s.cell}>
              <span className={s.cellLabel}>수익률</span>
              <span className={`${s.cellValue} ${delta[dir]}`}>
                {formatRate(account.pnlRate)}
              </span>
            </div>
          </div>
        </Panel>

        <Panel title="보유 종목" note={`${account.positions.length}종목`} flush>
          {account.positions.length === 0 ? (
            <p className={s.empty}>
              보유 종목이 없습니다. 거래소에서 한 종목 사 보세요.
            </p>
          ) : (
            <div className={s.scroll}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.thLeft} scope="col">
                      종목
                    </th>
                    <th className={s.th} scope="col">
                      수량
                    </th>
                    <th className={s.th} scope="col">
                      평단
                    </th>
                    <th className={s.th} scope="col">
                      현재가
                    </th>
                    <th className={s.th} scope="col">
                      평가손익
                    </th>
                    <th className={s.th} scope="col">
                      수익률
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {account.positions.map((p) => {
                    const d = direction(p.pnl);
                    const cost = Math.abs(p.avgPrice * p.qty) || 1;
                    return (
                      <tr key={p.code} className={s.row}>
                        <td className={s.tdLeft}>
                          <Link className={s.name} to={`/stocks/${p.code}`}>
                            {p.name}
                          </Link>{' '}
                          <Badge tone={p.side === 'short' ? 'warn' : 'fill'}>
                            {p.side === 'short' ? '숏' : '롱'}
                          </Badge>
                        </td>
                        <td className={s.td}>{Math.abs(p.qty)}</td>
                        <td className={s.td}>{formatPrice(p.avgPrice)}</td>
                        <td className={s.td}>{formatPrice(p.price)}</td>
                        <td className={`${s.td} ${delta[d]}`}>
                          {formatSigned(p.pnl)}
                        </td>
                        <td className={`${s.td} ${delta[d]}`}>
                          {formatRate((p.pnl / cost) * 100)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="체결 내역" note="최근 50건" flush>
          {trades.length === 0 ? (
            <p className={s.empty}>체결 내역이 없습니다.</p>
          ) : (
            <div className={s.scroll}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.thLeft} scope="col">
                      시각
                    </th>
                    <th className={s.thLeft} scope="col">
                      종목
                    </th>
                    <th className={s.th} scope="col">
                      구분
                    </th>
                    <th className={s.th} scope="col">
                      수량
                    </th>
                    <th className={s.th} scope="col">
                      체결가
                    </th>
                    <th className={s.th} scope="col">
                      거래대금
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className={s.row}>
                      <td className={s.tdLeft}>
                        {new Date(t.at).toLocaleString('ko-KR', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </td>
                      <td className={s.tdLeft}>
                        <Link className={s.name} to={`/stocks/${t.code}`}>
                          {t.name}
                        </Link>
                      </td>
                      <td
                        className={`${s.td} ${t.side === 'buy' ? delta.rise : delta.fall}`}
                      >
                        {t.side === 'buy' ? '매수' : '매도'}
                      </td>
                      <td className={s.td}>{t.qty}</td>
                      <td className={s.td}>{formatPrice(t.price)}</td>
                      <td className={s.td}>{formatPrice(t.price * t.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <aside className={s.rail}>
        <Panel title="수익률 랭킹" note="전체 참가자" flush>
          <table className={s.table} style={{ minWidth: 0 }}>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.username} className={s.row}>
                  <td className={s.tdLeft} style={{ width: '28px' }}>
                    {i + 1}
                  </td>
                  <td className={s.tdLeft}>
                    <span
                      className={
                        r.username === account.username ? s.name : undefined
                      }
                    >
                      {r.username}
                    </span>
                  </td>
                  <td className={`${s.td} ${delta[direction(r.pnl)]}`}>
                    {formatRate(r.pnlRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </aside>
    </main>
  );
}
