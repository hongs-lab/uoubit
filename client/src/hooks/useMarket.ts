import { createContext, useContext, useSyncExternalStore } from 'react';
import type { MarketStore } from '@/market/store';

export const MarketContext = createContext<MarketStore | null>(null);

export function useMarketStore(): MarketStore {
  const store = useContext(MarketContext);
  if (!store) throw new Error('MarketProvider 안에서만 쓸 수 있습니다.');
  return store;
}

export function useTick(): number {
  const store = useMarketStore();
  return useSyncExternalStore(
    store.subscribe,
    store.getVersion,
    store.getVersion,
  );
}
