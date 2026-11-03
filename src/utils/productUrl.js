/**
 * Generates an SEO-friendly product URL using the product's name
 * e.g., /product/Ceramide-Glow-Serum
 */
export const getProductPath = (product) => {
  if (!product) return '/shop';
  const raw = product.name ? product.name.trim() : String(product.id || '');
  const safeName = raw.replace(/\//g, '-');
  return `/product/${encodeURIComponent(safeName)}`;
};
