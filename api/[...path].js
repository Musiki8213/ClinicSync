/**
 * Proxies /api/* to the Express API.
 * - All on Vercel: uses /_/backend on this deployment (no BACKEND_URL needed).
 * - External API: set BACKEND_URL e.g. https://your-api.example.com
 */
export default async function handler(req, res) {
  const explicit = process.env.BACKEND_URL?.replace(/\/$/, '');
  const vercelHost = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const backend = explicit || (vercelHost ? `${vercelHost}/_/backend` : null);
  if (!backend) {
    return res.status(503).json({
      message: 'API proxy not configured.',
    });
  }

  const pathParam = req.query.path;
  const pathStr = Array.isArray(pathParam) ? pathParam.join('/') : pathParam || '';
  const queryIndex = req.url?.indexOf('?') ?? -1;
  const query = queryIndex >= 0 ? req.url.slice(queryIndex) : '';
  const target = `${backend}/api/${pathStr}${query}`;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const lower = key.toLowerCase();
    if (lower === 'host' || lower === 'connection' || lower === 'content-length') continue;
    if (value !== undefined) headers[key] = Array.isArray(value) ? value.join(', ') : value;
  }

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!headers['content-type'] && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    return res.send(text);
  } catch {
    return res.status(502).json({
      message: `Could not reach API at ${backend}. Deploy the backend on Render and ensure it is running.`,
    });
  }
}
