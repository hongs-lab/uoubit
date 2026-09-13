import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as s from './Toast.css';
import { ToastContext, type Toast, type ToastTone } from '@/hooks/useToast';

const LIFETIME_MS = 2_800;

const MAX = 1;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const layerRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  const toast = useCallback((text: string, tone: ToastTone = 'ok') => {
    seq.current += 1;
    const id = seq.current;
    setToasts((prev) => [...prev, { id, tone, text }].slice(-MAX));
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      LIFETIME_MS,
    );
  }, []);

  useEffect(() => {
    const el = layerRef.current;
    if (!el || typeof el.showPopover !== 'function') return;
    const open = el.matches(':popover-open');
    if (toasts.length > 0 && !open) el.showPopover();
    if (toasts.length === 0 && open) el.hidePopover();
  }, [toasts.length]);

  return (
    <ToastContext value={{ toast }}>
      {children}
      <div
        ref={layerRef}
        className={s.layer}
        popover="manual"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className={s.item[t.tone]}>
            <span className={s.textWrap}>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
