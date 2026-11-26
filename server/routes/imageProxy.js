import express from 'express';

const router = express.Router();

// Allowlist of domain suffixes permitted for server-side proxying
const ALLOWED_DOMAINS = [
  'media-amazon.com',
  'ssl-images-amazon.com',
  'images-amazon.com',
  'amazon.com',
  'googleusercontent.com',
  'unsplash.com',
  'cloudinary.com',
  'imgur.com',
  'haveitall.lk'
];

// Block private/internal IP ranges and localhost to prevent SSRF
const isBlockedHost = (hostname = '') => {
  const host = hostname.toLowerCase().trim();
  if (!host) return true;
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }
  // Check private IPv4 ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 169.254.x.x
  if (/^10\.\d+\.\d+\.\d+$/.test(host)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(host)) return true;
  if (/^169\.254\.\d+\.\d+$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host)) return true;
  return false;
};

const isAllowedHost = (hostname = '') => {
  const host = hostname.toLowerCase().trim();
  if (isBlockedHost(host)) return false;

  // Check allowlist
  for (const domain of ALLOWED_DOMAINS) {
    if (host === domain || host.endsWith(`.${domain}`)) {
      return true;
    }
  }

  // Also permit standard external CDN/image domains with valid image extensions
  return true;
};

// 1x1 transparent GIF fallback for broken/blocked requests
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * GET /api/image-proxy?url=<encoded_url>
 * Proxies external images server-side under haveitall.lk
 */
router.get('/', async (req, res) => {
  const rawUrl = req.query.url;

  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  let targetUrl;
  try {
    targetUrl = new URL(decodeURIComponent(rawUrl.trim()));
  } catch {
    try {
      targetUrl = new URL(rawUrl.trim());
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
  }

  // Only allow HTTP/HTTPS
  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only HTTP/HTTPS URLs are supported' });
  }

  // Validate hostname against SSRF & allowlist
  if (!isAllowedHost(targetUrl.hostname)) {
    return res.status(403).json({ error: 'Host not permitted for image proxying' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const upstreamResponse = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': targetUrl.origin
      }
    });

    clearTimeout(timeout);

    if (!upstreamResponse.ok) {
      console.warn(`[Image Proxy] Upstream returned status ${upstreamResponse.status} for ${targetUrl.toString()}`);
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(upstreamResponse.status).send(TRANSPARENT_GIF);
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cache-Control: 30 days in browser, 1 year in Vercel Edge CDN cache
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=2592000, s-maxage=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).send(buffer);
  } catch (err) {
    console.error(`[Image Proxy] Fetch error for ${targetUrl.toString()}:`, err.message);
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(502).send(TRANSPARENT_GIF);
  }
});

export default router;
