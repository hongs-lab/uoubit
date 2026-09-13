import { useEffect, useRef, useState } from 'react';
import * as s from './Auth.css';
import { api, ApiError } from '@/api';
import { useAccount } from '@/hooks/useAccount';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/market/format';

type Mode = 'login' | 'signup';

function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { setAccount } = useAccount();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const username = String(data.get('username') ?? '');
    const password = String(data.get('password') ?? '');

    setBusy(true);
    setError('');
    try {
      const account =
        mode === 'signup'
          ? await api.signup(username, password)
          : await api.login(username, password);
      setAccount(account);
      onClose();
      toast(
        mode === 'signup'
          ? `가입을 환영합니다. 시드머니 ${formatPrice(account.cash)}원이 지급되었습니다.`
          : `${account.username}님, 로그인되었습니다.`,
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : '요청이 실패했습니다.';
      setError(message);
      toast(message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog ref={ref} className={s.dialog} onClose={onClose}>
      <div className={s.head}>
        {(['login', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? s.tab.active : s.tab.idle}
            onClick={() => {
              setMode(m);
              setError('');
            }}
          >
            {m === 'login' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>

      <form className={s.form} onSubmit={submit}>
        <input
          className={s.input}
          name="username"
          autoComplete="username"
          placeholder="아이디"
          aria-label="아이디"
          required
        />
        <input
          className={s.input}
          name="password"
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          placeholder="비밀번호 (8자 이상)"
          aria-label="비밀번호"
          required
        />
        <p className={s.hint}>
          {mode === 'signup'
            ? '가입 시 가상 시드머니 1,000,000원이 지급됩니다.'
            : '가상 시드머니로 거래하는 서비스입니다.'}
        </p>
        <p className={s.error} role="alert">
          {error}
        </p>
        <button className={s.submit} type="submit" disabled={busy}>
          {busy
            ? '처리 중…'
            : mode === 'signup'
              ? '가입하고 시작하기'
              : '로그인'}
        </button>
      </form>
    </dialog>
  );
}

export default function Auth() {
  const { account, loading, logout } = useAccount();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function signOut() {
    setLeaving(true);
    try {
      await logout();
      toast('로그아웃되었습니다.');
    } catch {
      toast('로그아웃에 실패했습니다.', 'error');
    } finally {
      setLeaving(false);
    }
  }

  if (loading) return null;

  if (!account) {
    return (
      <div className={s.bar}>
        <button
          type="button"
          className={s.button.primary}
          data-tour="login"
          onClick={() => setOpen(true)}
        >
          로그인
        </button>
        <AuthDialog open={open} onClose={() => setOpen(false)} />
      </div>
    );
  }

  return (
    <div className={s.bar}>
      <span className={s.account}>
        <span className={s.accountName}>{account.username}</span>
        <span className={s.accountCash}>{formatPrice(account.equity)}원</span>
      </span>
      <button
        type="button"
        className={s.logout}
        onClick={() => void signOut()}
        disabled={leaving}
      >
        {leaving ? '로그아웃 중…' : '로그아웃'}
      </button>
    </div>
  );
}
