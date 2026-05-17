/**
 * Proxies /api/* from the Vercel frontend to the Express API (Render, etc.).
 * Set BACKEND_URL on Vercel, e.g. https://clinicsync-api.onrender.com (no /api suffix).
 */
export default async function handler(req, res) {
  const backend = process.env.BACKEND_URL?.replace(/\/$/, '');
  if (!backend) {
    return res.status(503).json({
      message:
        'API proxy not configured. In Vercel → Settings → Environment Variables, set BACKEND_URL to your API host (e.g. https://clinicsync-api.onrender.com), then redeploy.',
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
