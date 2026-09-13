import { createContext, useContext } from 'react';

export type ToastTone = 'ok' | 'error';

export interface Toast {
  id: number;
  tone: ToastTone;
  text: string;
}

export interface ToastValue {
  toast: (text: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastValue | null>(null);

export function useToast(): ToastValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('ToastProvider 안에서만 쓸 수 있습니다.');
  return value;
}
