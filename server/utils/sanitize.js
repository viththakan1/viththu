/**
 * Input sanitization & injection protection utilities
 */

/**
 * Escapes regex special characters to prevent ReDoS (Regular Expression Denial of Service)
 */
export const escapeRegex = (str = '') => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Strips HTML tags and dangerous schemes from user strings (prevents stored/reflected XSS)
 */
export const sanitizeString = (str = '') => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
};

/**
 * Recursively strips keys starting with '$' or containing '.' to prevent NoSQL query injection
 */
export const sanitizeNoSql = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeNoSql(item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Drop MongoDB operator injection keys ($where, $ne, $gt, etc.)
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[Security] Filtered potential NoSQL injection key: "${key}"`);
      continue;
    }
    clean[key] = sanitizeNoSql(value);
  }
  return clean;
};

/**
 * Express middleware to sanitize all incoming body, query, and params
 */
export const sanitizeInputs = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeNoSql(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeNoSql(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeNoSql(req.params);
  }
  next();
};
