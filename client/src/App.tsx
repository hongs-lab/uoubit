import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from '@/components/layout/Header';
import TickerTape from '@/components/market/TickerTape';
import Market from '@/pages/Market';
import Stock from '@/pages/Stock';
import Portfolio from '@/pages/Portfolio';
import { MarketContext } from '@/hooks/useMarket';
import AccountProvider from '@/components/account/AccountProvider';
import ToastProvider from '@/components/common/ToastProvider';
import { MarketStore } from '@/market/store';
import dataset from '@/data/listings.json';
import type { MarketDataset } from '@/types/market';

export default function App() {
  const [store] = useState(() => new MarketStore(dataset as MarketDataset));

  return (
    <MarketContext value={store}>
      <ToastProvider>
        <AccountProvider>
          <Header />
          <TickerTape />
          <Routes>
            <Route path="/" element={<Market />} />
            <Route path="/stocks/:code" element={<Stock />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AccountProvider>
      </ToastProvider>
    </MarketContext>
  );
}
