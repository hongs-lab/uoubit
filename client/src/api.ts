export interface Position {
  code: string;
  name: string;
  sector: string;
  qty: number;
  avgPrice: number;
  price: number;
  pnl: number;
  side: 'long' | 'short';
}

export interface Account {
  username: string;
  cash: number;
  equity: number;
  seed: number;
  pnl: number;
  pnlRate: number;
  positions: Position[];
}

export interface BookLevel {
  price: number;
  qty: number;
}

export interface OrderBook {
  code: string;
  price: number;
  tickSize: number;
  asks: BookLevel[];
  bids: BookLevel[];
  volume: number;
  value: number;
}

export interface Trade {
  id: number;
  code: string;
  name: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  at: number;
}

export interface RankRow {
  username: string;
  equity: number;
  pnl: number;
  pnlRate: number;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      body.error ?? '요청이 실패했습니다.',
      res.status,
      body.code,
    );
  }
  return body as T;
}

const post = <T>(path: string, body?: unknown) =>
  call<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const api = {
  signup: (username: string, password: string) =>
    post<Account>('/auth/signup', { username, password }),
  login: (username: string, password: string) =>
    post<Account>('/auth/login', { username, password }),
  logout: () => post<{ ok: true }>('/auth/logout'),
  me: () => call<Account>('/me'),

  book: (code: string) => call<OrderBook>(`/orderbook/${code}`),
  order: (code: string, side: 'buy' | 'sell', qty: number) =>
    post<{ price: number; notional: number; account: Account }>('/orders', {
      code,
      side,
      qty,
    }),
  trades: () => call<{ trades: Trade[] }>('/trades'),
  ranking: () => call<{ ranking: RankRow[] }>('/ranking'),
};
