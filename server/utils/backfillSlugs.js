import { Product, generateUniqueProductSlug } from '../models/Product.js';
import { Brand } from '../models/Brand.js';
import { toSlug } from './slug.js';

/**
 * Idempotent migration/backfill function to populate clean lowercase hyphenated
 * slugs for all existing products and brands in MongoDB that do not have one yet.
 */
export const backfillProductSlugs = async () => {
  try {
    const products = await Product.find().lean();
    let updatedProducts = 0;

    for (const prod of products) {
      if (!prod.slug || String(prod.slug).trim() === '') {
        const titleOrName = prod.name || prod.title || prod.id;
        const uniqueSlug = await generateUniqueProductSlug(Product, titleOrName, prod._id);

        await Product.updateOne(
          { _id: prod._id },
          { $set: { slug: uniqueSlug } }
        );
        updatedProducts++;
      }
    }

    // Also ensure all brands have a clean slug
    const brands = await Brand.find().lean();
    let updatedBrands = 0;

    for (const brand of brands) {
      if (!brand.slug || String(brand.slug).trim() === '') {
        const cleanSlug = toSlug(brand.name);
        await Brand.updateOne(
          { _id: brand._id },
          { $set: { slug: cleanSlug } }
        );
        updatedBrands++;
      }
    }

    if (updatedProducts > 0 || updatedBrands > 0) {
      console.log(`🚀 [Slug Migration] Successfully backfilled ${updatedProducts} product slugs and ${updatedBrands} brand slugs in MongoDB.`);
    }

    return {
      success: true,
      totalProducts: products.length,
      updatedProducts,
      totalBrands: brands.length,
      updatedBrands
    };
  } catch (err) {
    console.error('❌ [Slug Migration Error]:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
};
