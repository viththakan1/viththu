import { toSlug, createSlug } from './slug.js';

/**
 * Generates a clean, canonical SEO-friendly product URL using the product's slug or name
 * e.g., /product/ceramide-barrier-hydrating-daily-cleanser
 */
export const getProductPath = (product) => {
  if (!product) return '/shop';
  const slug = product.slug || toSlug(product.title || product.name || String(product.id || ''));
  return slug ? `/product/${slug}` : '/shop';
};

/**
 * Generates a clean, canonical SEO-friendly brand URL
 * e.g., /brand/beauty-of-joseon
 */
export const getBrandPath = (brand) => {
  if (!brand) return '/brands';
  const rawName = typeof brand === 'string' ? brand : brand?.slug || brand?.name || '';
  const slug = toSlug(rawName);
  return slug ? `/brand/${slug}` : '/brands';
};

/**
 * Generates a clean, canonical SEO-friendly category URL
 * e.g., /category/sunscreens, /category/moisturizers
 */
export const getCategoryPath = (category) => {
  if (!category) return '/shop';
  const rawName = typeof category === 'string' ? category : category?.slug || category?.name || '';
  const slug = toSlug(rawName);
  return slug ? `/category/${slug}` : '/shop';
};

export { toSlug, createSlug };
export default getProductPath;
