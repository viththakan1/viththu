/**
 * Image Quality & Resolution Optimizer
 * Enhances product images by delivering high-DPI, retina-ready, next-gen WebP/AVIF formats
 * with lossless-grade sharpness and intelligent focal cropping.
 */

export const optimizeProductImage = (url, width = 1200, quality = 92) => {
  if (!url || typeof url !== 'string') {
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90';
  }

  // Base64 data URLs or local blob URLs
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Optimize Unsplash images to high-definition retina resolution with modern formats
  if (url.includes('images.unsplash.com')) {
    try {
      const baseUrl = url.split('?')[0];
      const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');

      // Apply ultra-HD parameters
      params.set('auto', 'format'); // Automatically serves modern WebP / AVIF
      params.set('fit', 'crop');
      params.set('w', String(width));
      params.set('q', String(quality));

      // Use entropy/attention crop if not already specified to avoid cutting off garment edges
      if (!params.has('crop')) {
        params.set('crop', 'entropy');
      }

      return `${baseUrl}?${params.toString()}`;
    } catch {
      return url;
    }
  }

  return url;
};

/**
 * Generate responsive srcSet for crisp rendering across 1x, 2x, 3x Retina and 4K displays
 */
export const getProductSrcSet = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) {
    return undefined;
  }

  const w500 = optimizeProductImage(url, 600, 88);
  const w900 = optimizeProductImage(url, 1000, 90);
  const w1400 = optimizeProductImage(url, 1400, 92);
  const w1800 = optimizeProductImage(url, 1800, 95);

  return `${w500} 600w, ${w900} 1000w, ${w1400} 1400w, ${w1800} 1800w`;
};

/**
 * Automatically enhance all images in a product object
 */
export const enhanceProduct = (product) => {
  if (!product) return product;

  const enhancedMain = optimizeProductImage(product.image, 1400, 92);
  const enhancedGallery = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => optimizeProductImage(img, 1600, 92))
    : [enhancedMain];

  return {
    ...product,
    image: enhancedMain,
    images: enhancedGallery
  };
};

