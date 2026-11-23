import express from 'express';
import { Brand } from '../models/Brand.js';
import { Product } from '../models/Product.js';
import { toSlug, createSlug } from '../utils/slug.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    const brands = await Brand.find().sort({ createdAt: 1 }).lean();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET brand by slug or id, returning brand details & matched products
router.get('/:brandSlug', async (req, res) => {
  try {
    res.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    const rawParam = decodeURIComponent(req.params.brandSlug).trim();
    const cleanBrandSlug = toSlug(rawParam);

    let brand = await Brand.findOne({ slug: cleanBrandSlug }).lean();
    if (!brand && rawParam !== cleanBrandSlug) {
      brand = await Brand.findOne({ slug: rawParam }).lean();
    }
    if (!brand) {
      brand = await Brand.findOne({ id: rawParam }).lean();
    }
    if (!brand) {
      const allBrands = await Brand.find().lean();
      brand = allBrands.find(b =>
        b.slug === cleanBrandSlug ||
        toSlug(b.name) === cleanBrandSlug ||
        b.name?.toLowerCase() === rawParam.toLowerCase() ||
        String(b.id) === rawParam
      );
    }

    // Match all products where toSlug(product.brand) === cleanBrandSlug
    const allProducts = await Product.find().lean();
    const matchingProducts = allProducts.filter(p => {
      if (!p.brand) return false;
      return (
        toSlug(p.brand) === cleanBrandSlug ||
        (brand && p.brand.toLowerCase() === brand.name?.toLowerCase()) ||
        p.brand.toLowerCase() === rawParam.toLowerCase()
      );
    });

    if (!brand && matchingProducts.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const brandName = brand?.name || (matchingProducts[0]?.brand || rawParam);
    const finalBrandData = brand || {
      id: `brand-${cleanBrandSlug}`,
      slug: cleanBrandSlug,
      name: brandName,
      description: `Shop 100% authentic ${brandName} skincare, beauty & supplements at HaveItAll.lk with islandwide delivery in Sri Lanka.`,
      featured: true
    };

    res.json({
      ...finalBrandData,
      slug: cleanBrandSlug,
      products: matchingProducts,
      productCount: matchingProducts.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = `brand-${Date.now()}`;
    if (data.name) {
      if (data.name.toLowerCase() === 'chicnutrix') data.name = 'Chicnutrix';
      data.slug = createSlug(data.name);
    }
    if (data.category === 'Cosmatics') data.category = 'Cosmetics';
    if (data.category === 'Applieances') data.category = 'Appliances';
    delete data._id;

    const brand = await Brand.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Brand "${brand.name}" saved to MongoDB Atlas!`);
    res.status(201).json(brand);
  } catch (err) {
    console.error('❌ Error saving brand:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const { brands, replaceExisting } = req.body;
    if (!Array.isArray(brands) || brands.length === 0) {
      return res.status(400).json({ error: 'No brands provided' });
    }

    if (replaceExisting) {
      await Brand.deleteMany({});
    }

    const operations = brands.map((b, idx) => {
      const bId = b.id ? String(b.id) : `brand-${Date.now()}-${idx}`;
      const doc = { ...b, id: bId };
      delete doc._id;
      return {
        updateOne: {
          filter: { id: bId },
          update: { $set: doc },
          upsert: true
        }
      };
    });

    await Brand.bulkWrite(operations);
    console.log(`✅ Bulk synced ${brands.length} brands to MongoDB Atlas!`);
    res.json({ message: `Successfully synced ${brands.length} brands with MongoDB`, count: brands.length });
  } catch (err) {
    console.error('❌ Bulk brand sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;

    const brand = await Brand.findOneAndUpdate(
      { id: req.params.id },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    console.log(`✅ Brand "${brand.name}" updated in MongoDB Atlas!`);
    res.json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const brand = await Brand.findOneAndDelete({ id: req.params.id });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    console.log(`✅ Brand ID ${req.params.id} deleted from MongoDB Atlas!`);
    res.json({ message: 'Brand deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
