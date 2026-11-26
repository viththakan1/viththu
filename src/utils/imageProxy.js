/**
 * Server-Side Image Proxy Helper
 * Rewrites any external image URL (Amazon, Unsplash, Google, etc.) to the first-party
 * haveitall.lk image proxy endpoint (/api/image-proxy?url=...) so that Safari Privacy Report
 * and browser network tabs show zero third-party requests.
 */

const SITE_ORIGIN = 'https://haveitall.lk';

/**
 * Check if a URL points to an external third-party host
 */
export const isExternalUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('/')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (host === 'haveitall.lk' || host === 'www.haveitall.lk' || host === 'localhost' || host === '127.0.0.1') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Proxy an image URL through haveitall.lk's server-side image proxy
 *
 * @param {string} url - Original image URL
 * @param {Object} [options]
 * @param {boolean} [options.absolute=false] - If true, returns an absolute URL (https://haveitall.lk/api/image-proxy?...)
 * @param {string} [options.fallback='/images/placeholder-product.webp'] - Fallback path if url is empty
 * @returns {string} Proxied first-party image URL
 */
export const proxyImageUrl = (url, options = {}) => {
  const { absolute = false, fallback = '/images/placeholder-product.webp' } = options;
  const base = absolute ? SITE_ORIGIN : '';

  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback ? `${base}${fallback.startsWith('/') ? fallback : `/${fallback}`}` : '';
  }

  const trimmed = url.trim();

  // Keep inline base64 and client-created blob URLs untouched
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Handle local relative paths (/images/..., /favicon..., etc.)
  if (trimmed.startsWith('/')) {
    // If it's already a proxied URL
    if (trimmed.startsWith('/api/image-proxy') || trimmed.startsWith('/image-proxy')) {
      return `${base}${trimmed}`;
    }
    return `${base}${trimmed}`;
  }

  // Handle haveitall.lk or localhost URLs
  if (trimmed.startsWith(SITE_ORIGIN) || trimmed.startsWith('http://localhost') || trimmed.startsWith('http://127.0.0.1')) {
    if (trimmed.includes('/api/image-proxy') || trimmed.includes('/image-proxy')) {
      return absolute ? (trimmed.startsWith('http://localhost') ? trimmed.replace(/^http:\/\/localhost:\d+/, SITE_ORIGIN) : trimmed) : trimmed.replace(/^(https?:\/\/[^/]+)/, '');
    }
    return absolute ? trimmed : trimmed.replace(/^(https?:\/\/[^/]+)/, '');
  }

  // External third-party URL (Amazon, Unsplash, Google, etc.) -> Route through proxy
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const encoded = encodeURIComponent(trimmed);
    return `${base}/api/image-proxy?url=${encoded}`;
  }

  return trimmed;
};

export default proxyImageUrl;
