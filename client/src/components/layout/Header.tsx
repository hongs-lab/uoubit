import { Link, useLocation } from 'react-router-dom';
import * as s from './Header.css';
import logo from '@/assets/logo.svg';
import { delta } from '@/components/common/Delta.css';
import Auth from '@/components/account/Auth';
import { useMarketStore, useTick } from '@/hooks/useMarket';
import { direction, formatIndex, formatRate } from '@/market/format';

const NAV = [
  {
    to: '/',
    label: '거래소',
    isActive: (p: string) => p === '/' || p.startsWith('/stocks'),
  },
  {
    to: '/portfolio',
    label: '투자내역',
    isActive: (p: string) => p.startsWith('/portfolio'),
  },
];

export default function Header() {
  const { pathname } = useLocation();
  const store = useMarketStore();
  useTick();
  const { index, indexChangeRate, updatedAt } = store.snapshot;

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <Link to="/" className={s.brand}>
          <img
            className={s.logo}
            src={logo}
            alt="UoUbit"
            width={365}
            height={70}
          />
        </Link>

        <nav className={s.nav}>
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={
                item.isActive(pathname) ? s.navItem.active : s.navItem.idle
              }
              aria-current={item.isActive(pathname) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={s.live}>
          <span className={s.dot} aria-hidden="true" />
          <span className={s.liveLabel}>UOU종합</span>
          <span className={s.liveValue}>{formatIndex(index)}</span>
          <span
            className={`${s.liveRate} ${delta[direction(indexChangeRate)]}`}
          >
            {formatRate(indexChangeRate)}
          </span>
          <span className={s.clock}>
            {new Date(updatedAt).toLocaleTimeString('ko-KR', { hour12: false })}
          </span>
        </div>

        <Auth />
      </div>
    </header>
  );
}
