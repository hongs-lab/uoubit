import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../client/dist', import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const immutable = (path) =>
  /\-[A-Za-z0-9_-]{8,}\.(js|css|png|jpg|webp|woff2|svg)$/.test(path);

async function find(path) {
  const target = resolve(ROOT, '.' + decodeURIComponent(path));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;
  try {
    const info = await stat(target);
    if (info.isFile()) return target;
  } catch {}
  return null;
}

export async function serveClient(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;

  const index = join(ROOT, 'index.html');
  try {
    await stat(index);
  } catch {
    return false;
  }

  const file = (await find(req.url.split('?')[0])) ?? index;
  const type = MIME[extname(file)] ?? 'application/octet-stream';

  res.writeHead(200, {
    'content-type': type,
    'cache-control': immutable(file)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  });
  if (req.method === 'HEAD') return (res.end(), true);

  createReadStream(file).pipe(res);
  return true;
}
