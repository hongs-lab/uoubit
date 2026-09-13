import { createContext, useContext } from 'react';
import type { Account } from '@/api';

export interface AccountValue {
  account: Account | null;
  loading: boolean;
  setAccount: (account: Account | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AccountContext = createContext<AccountValue | null>(null);

export function useAccount(): AccountValue {
  const value = useContext(AccountContext);
  if (!value) throw new Error('AccountProvider 안에서만 쓸 수 있습니다.');
  return value;
}
