// Vite plugin: API giả lập chạy ngay trong dev server (không cần backend riêng).
//   GET /api/time              -> { now: <server epoch ms> }
//   GET /api/dossiers/:user    -> hồ sơ của himass | tanvuu
import { buildDossiers } from './dossiers.js';

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function createMiddleware() {
  const dossiers = buildDossiers(Date.now());

  return (req, res, next) => {
    const { pathname } = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && pathname === '/api/time') {
      return sendJson(res, 200, { now: Date.now() });
    }

    const match = pathname.match(/^\/api\/dossiers\/([a-z0-9_-]+)$/i);
    if (req.method === 'GET' && match) {
      const dossier = dossiers[match[1].toLowerCase()];
      return dossier ? sendJson(res, 200, dossier) : sendJson(res, 404, { error: 'Không tìm thấy hồ sơ' });
    }

    return next();
  };
}

export default function mockApi() {
  return {
    name: 'fairplay-mock-api',
    configureServer(server) {
      server.middlewares.use(createMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMiddleware());
    },
  };
}
