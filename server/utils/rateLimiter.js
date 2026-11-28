/**
 * Production-ready in-memory sliding-window rate limiter
 * Compatible with Node.js and serverless environments
 */

export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100,
  message = 'Too many requests from this IP. Please try again later.'
} = {}) => {
  const store = new Map();

  // Periodic cleanup of expired IP keys to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval so it doesn't hold the Node process open on shutdown
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const rawIp =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    const now = Date.now();
    let entry = store.get(rawIp);

    if (!entry || entry.resetAt <= now) {
      entry = {
        count: 1,
        resetAt: now + windowMs
      };
      store.set(rawIp, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, max - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.setHeader('Retry-After', String(resetSeconds));
      return res.status(429).json({
        error: message,
        retryAfterSeconds: resetSeconds
      });
    }

    next();
  };
};

/**
 * Strict rate limiter for authentication routes (prevents credential stuffing & brute-force)
 * 10 attempts per 15 minutes per IP
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. For your security, this IP has been temporarily restricted. Please try again in 15 minutes.'
});

/**
 * Rate limiter for contact inquiry submissions (prevents inbox flooding)
 * 10 submissions per 15 minutes per IP
 */
export const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many message inquiries submitted. Please wait a few minutes before submitting another inquiry.'
});

/**
 * Rate limiter for checkout / order creation
 * 30 orders per 15 minutes per IP
 */
export const checkoutLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many orders submitted in a short period. Please check your order history or wait a few minutes.'
});

/**
 * General API rate limiter
 * 300 requests per 15 minutes per IP
 */
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'API rate limit exceeded. Please throttle your requests.'
});
