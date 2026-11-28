import express from 'express';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { toSlug, createSlug } from '../utils/slug.js';
import { authenticate, requireRole } from '../utils/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    const categories = await Category.find().sort({ count: -1 }).lean();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET category by slug or id, returning category details & matched products
router.get('/:categorySlug', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    const rawParam = decodeURIComponent(req.params.categorySlug).trim();
    const cleanCategorySlug = toSlug(rawParam);

    let category = await Category.findOne({ slug: cleanCategorySlug }).lean();
    if (!category && rawParam !== cleanCategorySlug) {
      category = await Category.findOne({ slug: rawParam }).lean();
    }
    if (!category) {
      category = await Category.findOne({ id: rawParam }).lean();
    }
    if (!category) {
      const allCategories = await Category.find().lean();
      category = allCategories.find(c =>
        c.slug === cleanCategorySlug ||
        toSlug(c.name) === cleanCategorySlug ||
        c.name?.toLowerCase() === rawParam.toLowerCase() ||
        String(c.id) === rawParam
      );
    }

    // Match all products where toSlug(product.category) === cleanCategorySlug
    const allProducts = await Product.find().lean();
    const matchingProducts = allProducts.filter(p => {
      if (!p.category) return false;
      return (
        toSlug(p.category) === cleanCategorySlug ||
        (category && p.category.toLowerCase() === category.name?.toLowerCase()) ||
        p.category.toLowerCase() === rawParam.toLowerCase()
      );
    });

    if (!category && matchingProducts.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const catName = category?.name || (matchingProducts[0]?.category || rawParam);
    const finalCatData = category || {
      id: `cat-${cleanCategorySlug}`,
      slug: cleanCategorySlug,
      name: catName,
      description: `Browse 100% authentic ${catName} at HaveItAll.lk with islandwide delivery in Sri Lanka.`
    };

    res.json({
      ...finalCatData,
      slug: cleanCategorySlug,
      products: matchingProducts,
      productCount: matchingProducts.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE / UPSERT category (Admin only)
router.post('/', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = `cat-${Date.now()}`;
    delete data._id;

    const category = await Category.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Category "${category.name}" saved to MongoDB Atlas!`);
    res.status(201).json(category);
  } catch (err) {
    console.error('❌ Error saving category:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// BULK CREATE / UPSERT categories (Admin only)
router.post('/bulk', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { categories, replaceExisting } = req.body;
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'No categories provided' });
    }

    if (replaceExisting) {
      await Category.deleteMany({});
    }

    const operations = categories.map((c, idx) => {
      const cId = c.id ? String(c.id) : `cat-${Date.now()}-${idx}`;
      const doc = { ...c, id: cId };
      delete doc._id;
      return {
        updateOne: {
          filter: { id: cId },
          update: { $set: doc },
          upsert: true
        }
      };
    });

    await Category.bulkWrite(operations);
    console.log(`✅ Bulk synced ${categories.length} categories to MongoDB Atlas!`);
    res.json({ message: `Successfully synced ${categories.length} categories with MongoDB`, count: categories.length });
  } catch (err) {
    console.error('❌ Bulk category sync error:', err.message);
    res.status(500).json({ error: 'Failed to bulk sync categories' });
  }
});

// UPDATE category (Admin only)
router.put('/:id', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;

    const category = await Category.findOneAndUpdate(
      { id: req.params.id },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ error: 'Category not found' });
    console.log(`✅ Category "${category.name}" updated in MongoDB Atlas!`);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE category (Admin only)
router.delete('/:id', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const cat = await Category.findOneAndDelete({ id: req.params.id });
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    console.log(`✅ Category ID ${req.params.id} deleted from MongoDB Atlas!`);
    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
