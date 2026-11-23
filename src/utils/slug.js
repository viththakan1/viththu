/**
 * Converts any string into a clean, high-SEO lowercase hyphenated URL slug:
 * - Converts to lowercase
 * - Trims leading and trailing whitespace
 * - Replaces '&' with '-and-'
 * - Strips '%' and special punctuation characters
 * - Replaces spaces or consecutive non-alphanumeric characters with a single hyphen (-)
 * - Strips any leading or trailing hyphens
 *
 * Examples:
 *   toSlug("Chemist at play") -> "chemist-at-play"
 *   toSlug("Chemist At Play 10% Vitamin C Serum") -> "chemist-at-play-10-vitamin-c-serum"
 *   toSlug("SkinCare") -> "skincare"
 *   toSlug("Beauty & Wellness") -> "beauty-and-wellness"
 */
export const toSlug = (text = '') => {
  if (!text && text !== 0) return '';
  return String(text)
    .trim()
    .replace(/&+/g, ' and ')
    .replace(/[%'’"“”`]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Backward-compatible alias for toSlug
 */
export const createSlug = toSlug;

/**
 * Validates whether a given string is a clean, canonical slug
 */
export const isCleanSlug = (slug = '') => {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

export default toSlug;
