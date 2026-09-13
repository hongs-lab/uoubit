import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { api, type Account } from '@/api';
import { AccountContext } from '@/hooks/useAccount';

export default function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setAccount(await api.me());
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setAccount(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AccountContext value={{ account, loading, setAccount, refresh, logout }}>
      {children}
    </AccountContext>
  );
}
