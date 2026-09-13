import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Market, TICK_MS } from './market.mjs';
import { serveClient } from './static.mjs';
import {
  applyFill,
  equityOf,
  MAX_QTY,
  SEED_CASH,
  TradeError,
} from './trade.mjs';

const PORT = Number(process.env.PORT ?? 5184);
const DB_PATH =
  process.env.DB_PATH ??
  fileURLToPath(new URL('../data/exchange.db', import.meta.url));

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY,
    username  TEXT NOT NULL UNIQUE,
    password  TEXT NOT NULL,
    cash      INTEGER NOT NULL,
    createdAt INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token     TEXT PRIMARY KEY,
    userId    INTEGER NOT NULL REFERENCES users(id),
    createdAt INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS positions (
    userId   INTEGER NOT NULL REFERENCES users(id),
    code     TEXT NOT NULL,
    qty      INTEGER NOT NULL,
    avgPrice REAL NOT NULL,
    PRIMARY KEY (userId, code)
  );
  CREATE TABLE IF NOT EXISTS trades (
    id     INTEGER PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id),
    code   TEXT NOT NULL,
    side   TEXT NOT NULL,
    qty    INTEGER NOT NULL,
    price  REAL NOT NULL,
    at     INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS tradesByCode ON trades(code);
  CREATE INDEX IF NOT EXISTS tradesByUser ON trades(userId, at DESC);
`);

const q = {
  userByName: db.prepare('SELECT * FROM users WHERE username = ?'),
  userById: db.prepare('SELECT * FROM users WHERE id = ?'),
  insertUser: db.prepare(
    'INSERT INTO users (username, password, cash, createdAt) VALUES (?, ?, ?, ?)',
  ),
  setCash: db.prepare('UPDATE users SET cash = ? WHERE id = ?'),
  allUsers: db.prepare('SELECT id, username, cash FROM users'),

  insertSession: db.prepare(
    'INSERT INTO sessions (token, userId, createdAt) VALUES (?, ?, ?)',
  ),
  session: db.prepare('SELECT userId FROM sessions WHERE token = ?'),
  dropSession: db.prepare('DELETE FROM sessions WHERE token = ?'),

  position: db.prepare('SELECT * FROM positions WHERE userId = ? AND code = ?'),
  positions: db.prepare('SELECT * FROM positions WHERE userId = ?'),
  allPositions: db.prepare('SELECT userId, code, qty, avgPrice FROM positions'),
  upsertPosition: db.prepare(`
    INSERT INTO positions (userId, code, qty, avgPrice) VALUES (?, ?, ?, ?)
    ON CONFLICT(userId, code) DO UPDATE SET qty = excluded.qty, avgPrice = excluded.avgPrice
  `),
  dropPosition: db.prepare(
    'DELETE FROM positions WHERE userId = ? AND code = ?',
  ),

  insertTrade: db.prepare(
    'INSERT INTO trades (userId, code, side, qty, price, at) VALUES (?, ?, ?, ?, ?, ?)',
  ),
  myTrades: db.prepare(
    'SELECT * FROM trades WHERE userId = ? ORDER BY at DESC LIMIT ?',
  ),
  volumeByCode: db.prepare(
    'SELECT code, SUM(qty) AS qty, SUM(qty * price) AS value FROM trades GROUP BY code',
  ),
};

const market = new Market();
for (const r of q.volumeByCode.all()) {
  market.record(r.code, Number(r.qty), Math.round(Number(r.value)));
}

const streams = new Set();
setInterval(() => {
  market.step();
  if (streams.size === 0) return;
  const frame = `data:${JSON.stringify(market.wireTick())}\n\n`;
  for (const res of streams) res.write(frame);
}, TICK_MS);

function hash(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function verify(password, stored) {
  const [salt, key] = stored.split(':');
  const a = Buffer.from(key, 'hex');
  const b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

function cookieToken(req) {
  const raw = req.headers.cookie ?? '';
  return raw.match(/(?:^|;\s*)sid=([^;]+)/)?.[1] ?? null;
}

function currentUser(req) {
  const token = cookieToken(req);
  if (!token) return null;
  const row = q.session.get(token);
  return row ? q.userById.get(row.userId) : null;
}

function validCredentials(body) {
  const username = String(body?.username ?? '').trim();
  const password = String(body?.password ?? '');
  if (!/^[a-zA-Z0-9가-힣_]{3,20}$/.test(username)) {
    throw new TradeError(
      'AUTH_001',
      '아이디는 3~20자의 한글·영문·숫자·_ 만 쓸 수 있습니다.',
    );
  }
  if (password.length < 8 || password.length > 200) {
    throw new TradeError('AUTH_002', '비밀번호는 8자 이상이어야 합니다.');
  }
  return { username, password };
}

function validOrder(body) {
  const code = String(body?.code ?? '');
  const side = String(body?.side ?? '');
  const qty = Number(body?.qty);
  if (!market.byCode.has(code)) {
    throw new TradeError('TRADE_003', '없는 종목입니다.', 404);
  }
  if (side !== 'buy' && side !== 'sell') {
    throw new TradeError('TRADE_004', 'side 는 buy 또는 sell 이어야 합니다.');
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    throw new TradeError(
      'TRADE_005',
      `수량은 1~${MAX_QTY} 사이 정수여야 합니다.`,
    );
  }
  return { code, side, qty };
}

const priceOf = (code) => market.price(code);

function portfolio(user) {
  const positions = q.positions.all(user.id).map((p) => {
    const price = priceOf(p.code) ?? p.avgPrice;
    const listing = market.byCode.get(p.code);
    return {
      code: p.code,
      name: listing?.name ?? p.code,
      sector: listing?.sector ?? '',
      qty: p.qty,
      avgPrice: p.avgPrice,
      price,
      pnl: Math.round((price - p.avgPrice) * p.qty),
      side: p.qty >= 0 ? 'long' : 'short',
    };
  });
  const equity = equityOf(user.cash, positions, priceOf);
  return {
    username: user.username,
    cash: user.cash,
    equity,
    seed: SEED_CASH,
    pnl: equity - SEED_CASH,
    pnlRate: ((equity - SEED_CASH) / SEED_CASH) * 100,
    positions,
  };
}

function placeOrder(user, { code, side, qty }) {
  const fill = market.fill(code, side, qty);
  if (!fill) throw new TradeError('TRADE_003', '없는 종목입니다.', 404);

  const held = q.position.get(user.id, code);
  const before = {
    cash: user.cash,
    qty: held?.qty ?? 0,
    avgPrice: held?.avgPrice ?? 0,
  };
  const after = applyFill(before, side, qty, fill.avgPrice);

  db.exec('BEGIN');
  try {
    q.setCash.run(after.cash, user.id);
    if (after.qty === 0) q.dropPosition.run(user.id, code);
    else q.upsertPosition.run(user.id, code, after.qty, after.avgPrice);
    q.insertTrade.run(user.id, code, side, qty, fill.avgPrice, Date.now());
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  market.record(code, qty, after.notional);
  return {
    code,
    side,
    qty,
    price: fill.avgPrice,
    notional: after.notional,
    position: { qty: after.qty, avgPrice: after.avgPrice },
    cash: after.cash,
  };
}

function send(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 10_000)
        reject(new TradeError('REQ_001', '요청이 너무 큽니다.'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new TradeError('REQ_002', 'JSON 형식이 아닙니다.'));
      }
    });
    req.on('error', reject);
  });
}

const isHttps = (req) => req.headers['x-forwarded-proto'] === 'https';

function login(req, res, userId) {
  const token = randomBytes(32).toString('hex');
  q.insertSession.run(token, userId, Date.now());
  res.setHeader(
    'set-cookie',
    `sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}` +
      (isHttps(req) ? '; Secure' : ''),
  );
}

function requireUser(req) {
  const user = currentUser(req);
  if (!user) throw new TradeError('AUTH_003', '로그인이 필요합니다.', 401);
  return user;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const route = `${req.method} ${path}`;

  try {
    if (route === 'GET /api/quotes') {
      return send(res, 200, market.fullState());
    }

    if (route === 'GET /api/stream') {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-store',
        connection: 'keep-alive',
      });
      res.write(`data:${JSON.stringify(market.wireTick())}\n\n`);
      streams.add(res);
      req.on('close', () => streams.delete(res));
      return undefined;
    }

    if (req.method === 'GET' && path.startsWith('/api/orderbook/')) {
      const book = market.book(path.slice('/api/orderbook/'.length));
      if (!book) return send(res, 404, { error: '없는 종목입니다.' });
      return send(res, 200, { ...book, ...market.stats(book.code) });
    }

    if (req.method === 'GET' && path.startsWith('/api/stats/')) {
      const code = path.slice('/api/stats/'.length);
      if (!market.byCode.has(code))
        return send(res, 404, { error: '없는 종목입니다.' });
      return send(res, 200, { code, ...market.stats(code) });
    }

    if (route === 'POST /api/auth/signup') {
      const { username, password } = validCredentials(await readBody(req));
      if (q.userByName.get(username)) {
        throw new TradeError('AUTH_004', '이미 사용 중인 아이디입니다.', 409);
      }
      const { lastInsertRowid } = q.insertUser.run(
        username,
        hash(password),
        SEED_CASH,
        Date.now(),
      );
      login(req, res, Number(lastInsertRowid));
      return send(res, 201, portfolio(q.userById.get(Number(lastInsertRowid))));
    }

    if (route === 'POST /api/auth/login') {
      const { username, password } = validCredentials(await readBody(req));
      const user = q.userByName.get(username);
      if (!user || !verify(password, user.password)) {
        throw new TradeError(
          'AUTH_005',
          '아이디 또는 비밀번호가 틀렸습니다.',
          401,
        );
      }
      login(req, res, user.id);
      return send(res, 200, portfolio(user));
    }

    if (route === 'POST /api/auth/logout') {
      const token = cookieToken(req);
      if (token) q.dropSession.run(token);
      res.setHeader('set-cookie', 'sid=; HttpOnly; Path=/; Max-Age=0');
      return send(res, 200, { ok: true });
    }

    if (route === 'GET /api/me') {
      return send(res, 200, portfolio(requireUser(req)));
    }

    if (route === 'GET /api/trades') {
      const user = requireUser(req);
      const rows = q.myTrades.all(user.id, 50).map((t) => ({
        ...t,
        name: market.byCode.get(t.code)?.name ?? t.code,
      }));
      return send(res, 200, { trades: rows });
    }

    if (route === 'POST /api/orders') {
      const user = requireUser(req);
      const order = validOrder(await readBody(req));
      const result = placeOrder(user, order);
      return send(res, 201, {
        ...result,
        account: portfolio(q.userById.get(user.id)),
      });
    }

    if (route === 'GET /api/ranking') {
      const byUser = new Map();
      for (const p of q.allPositions.all()) {
        if (!byUser.has(p.userId)) byUser.set(p.userId, []);
        byUser.get(p.userId).push(p);
      }
      const rows = q.allUsers
        .all()
        .map((u) => {
          const equity = equityOf(u.cash, byUser.get(u.id) ?? [], priceOf);
          return {
            username: u.username,
            equity,
            pnl: equity - SEED_CASH,
            pnlRate: ((equity - SEED_CASH) / SEED_CASH) * 100,
          };
        })
        .sort((a, b) => b.equity - a.equity)
        .slice(0, 20);
      return send(res, 200, { ranking: rows });
    }

    if (!path.startsWith('/api/') && (await serveClient(req, res)))
      return undefined;

    return send(res, 404, { error: '없는 경로입니다.' });
  } catch (err) {
    if (err instanceof TradeError) {
      return send(res, err.status, { code: err.code, error: err.message });
    }
    console.error(err);
    return send(res, 500, { error: '서버 오류' });
  }
});

server.listen(PORT, () => {
  console.log(`UOUbit  http://localhost:${PORT}  (${DB_PATH})`);
});
