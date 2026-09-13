import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { applyFill, equityOf, SEED_CASH } from './trade.mjs';
import { Market, tickSize } from './market.mjs';

let s = applyFill({ cash: 100_000, qty: 0, avgPrice: 0 }, 'buy', 1, 70_000);
assert.deepEqual(s, {
  cash: 30_000,
  qty: 1,
  avgPrice: 70_000,
  notional: 70_000,
});

s = applyFill({ cash: 100_000, qty: 1, avgPrice: 70_000 }, 'buy', 1, 50_000);
assert.equal(s.qty, 2);
assert.equal(s.avgPrice, 60_000);

s = applyFill({ cash: 0, qty: 2, avgPrice: 60_000 }, 'sell', 1, 80_000);
assert.equal(s.qty, 1);
assert.equal(s.avgPrice, 60_000);
assert.equal(s.cash, 80_000);

s = applyFill({ cash: 100_000, qty: 0, avgPrice: 0 }, 'sell', 1, 70_000);
assert.equal(s.qty, -1);
assert.equal(s.cash, 170_000);
assert.equal(s.avgPrice, 70_000);

s = applyFill({ cash: 500_000, qty: -1, avgPrice: 70_000 }, 'buy', 3, 60_000);
assert.equal(s.qty, 2);
assert.equal(s.avgPrice, 60_000);

assert.throws(
  () => applyFill({ cash: 1_000, qty: 0, avgPrice: 0 }, 'buy', 1, 70_000),
  /현금이 부족/,
);

assert.throws(
  () => applyFill({ cash: 10_000, qty: 0, avgPrice: 0 }, 'sell', 5, 70_000),
  /증거금/,
);

const short = [{ code: 'X', qty: -2, avgPrice: 70_000 }];
assert.equal(
  equityOf(240_000, short, () => 70_000),
  100_000,
);
assert.equal(
  equityOf(240_000, short, () => 80_000),
  80_000,
);
assert.equal(
  equityOf(240_000, short, () => 60_000),
  120_000,
);

assert.equal(tickSize(70_000), 100);
assert.equal(tickSize(30_000), 50);

const market = new Market();
const code = market.listings[0].code;
const book = market.book(code);
assert.equal(book.asks.length, 10);
assert.ok(
  book.asks[0].price > book.bids[0].price,
  '매도호가가 매수호가보다 높다',
);
assert.ok(
  book.asks.every((a, i) => i === 0 || a.price > book.asks[i - 1].price),
  '매도호가는 오름차순',
);
assert.deepEqual(market.book(code), book, '같은 틱에서는 호가창이 그대로다');

const small = market.fill(code, 'buy', 1);
const large = market.fill(code, 'buy', 2_000);
assert.ok(large.avgPrice > small.avgPrice, '많이 사면 평균 체결가가 밀린다');

const dir = mkdtempSync(join(tmpdir(), 'exchange-'));
const entry = fileURLToPath(new URL('./index.mjs', import.meta.url));
const proc = spawn(process.execPath, ['--no-warnings', entry], {
  env: { ...process.env, PORT: '5199', DB_PATH: join(dir, 'test.db') },
  stdio: ['ignore', 'pipe', 'inherit'],
});

const base = 'http://localhost:5199';
let cookie = '';

async function api(path, init = {}) {
  const res = await fetch(base + path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
      ...init.headers,
    },
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  return { status: res.status, body: await res.json() };
}

async function waitForBoot() {
  for (let i = 0; i < 60; i += 1) {
    try {
      await fetch(base + '/api/quotes');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error('서버가 안 뜬다');
}

try {
  await waitForBoot();

  assert.equal((await api('/api/me')).status, 401);

  assert.equal(
    (
      await api('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username: 'tester', password: 'short' }),
      })
    ).status,
    400,
  );

  const signup = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username: 'tester', password: 'password1234' }),
  });
  assert.equal(signup.status, 201);
  assert.equal(signup.body.cash, SEED_CASH);
  assert.equal(signup.body.equity, SEED_CASH);

  assert.equal(
    (
      await api('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username: 'tester', password: 'password1234' }),
      })
    ).status,
    409,
  );

  const buy = await api('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ code, side: 'buy', qty: 3 }),
  });
  assert.equal(buy.status, 201, JSON.stringify(buy.body));
  assert.equal(buy.body.position.qty, 3);
  assert.equal(buy.body.account.cash, SEED_CASH - buy.body.notional);

  const stats = await api(`/api/stats/${code}`);
  assert.equal(stats.body.volume, 3);
  assert.equal(stats.body.value, buy.body.notional);

  const sell = await api('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ code, side: 'sell', qty: 5 }),
  });
  assert.equal(sell.status, 201, JSON.stringify(sell.body));
  assert.equal(sell.body.position.qty, -2);
  assert.equal(sell.body.account.positions[0].side, 'short');

  assert.equal(
    (
      await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ code, side: 'buy', qty: 0 }),
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ code: '000000', side: 'buy', qty: 1 }),
      })
    ).status,
    404,
  );

  assert.equal((await api('/api/trades')).body.trades.length, 2);
  assert.equal((await api('/api/ranking')).body.ranking[0].username, 'tester');

  await api('/api/auth/logout', { method: 'POST' });
  cookie = '';
  assert.equal((await api('/api/me')).status, 401);

  console.log('셀프체크 통과');
} finally {
  proc.kill();
  rmSync(dir, { recursive: true, force: true });
}
