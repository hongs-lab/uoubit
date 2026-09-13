import { useCallback, useState } from 'react';

const STORAGE_PREFIX = 'uoubit.guideSeen.';

const hasSeen = (storageKey: string): boolean => {
  try {
    return globalThis.localStorage?.getItem(storageKey) === '1';
  } catch {
    return false;
  }
};

export const useFirstVisitGuide = (key: string) => {
  const storageKey = STORAGE_PREFIX + key;
  const [open, setOpen] = useState(() => !hasSeen(storageKey));

  const close = useCallback(() => {
    setOpen(false);
    try {
      globalThis.localStorage?.setItem(storageKey, '1');
    } catch {}
  }, [storageKey]);

  const reopen = useCallback(() => setOpen(true), []);

  return { open, close, reopen };
};
