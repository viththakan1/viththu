import express from 'express';
import mongoose from 'mongoose';
import { Product, generateUniqueProductSlug } from '../models/Product.js';
import { toSlug, createSlug } from '../utils/slug.js';

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    const { category, brand, search, featured, inStock } = req.query;
    const query = {};

    if (featured === 'true') {
      query.featured = true;
    }
    if (inStock === 'true') {
      query.inStock = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { formulation: { $regex: search, $options: 'i' } },
        { fabric: { $regex: search, $options: 'i' } }
      ];
    }

    let products = await Product.find(query).sort({ createdAt: -1 }).lean();

    // Category filter with toSlug support
    if (category && category !== 'All') {
      const cleanCatSlug = toSlug(category);
      products = products.filter(p => {
        if (!p.category) return false;
        return (
          p.category.toLowerCase() === category.toLowerCase() ||
          toSlug(p.category) === cleanCatSlug
        );
      });
    }

    // Brand filter with toSlug support
    if (brand && brand !== 'All') {
      const cleanBrandSlug = toSlug(brand);
      products = products.filter(p => {
        if (!p.brand) return false;
        return (
          p.brand.toLowerCase() === brand.toLowerCase() ||
          toSlug(p.brand) === cleanBrandSlug
        );
      });
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product by slug or id (with backward-compatible fallback)
router.get('/:identifier', async (req, res) => {
  try {
    res.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    const rawParam = decodeURIComponent(req.params.identifier).trim();
    const cleanSlug = toSlug(rawParam);

    // 1. Query { slug: identifier } first
    let product = await Product.findOne({ slug: cleanSlug }).lean();

    // 2. Query exact slug or rawParam as slug
    if (!product && rawParam !== cleanSlug) {
      product = await Product.findOne({ slug: rawParam }).lean();
    }

    // 3. Fallback to legacy { id: identifier }
    if (!product) {
      product = await Product.findOne({ id: rawParam }).lean();
    }

    // 4. Fallback to MongoDB _id if valid ObjectId
    if (!product && mongoose.Types.ObjectId.isValid(rawParam)) {
      product = await Product.findById(rawParam).lean();
    }

    // 5. Fallback to in-memory slug check across all products
    if (!product) {
      const all = await Product.find().lean();
      product = all.find(p =>
        p.slug === cleanSlug ||
        toSlug(p.name || p.title) === cleanSlug ||
        p.name?.toLowerCase() === rawParam.toLowerCase() ||
        String(p.id) === rawParam
      );
    }

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE / UPSERT single product
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = `prod-${Date.now()}`;
    if (!data.barcode) data.barcode = `HAVEITALL-${Date.now().toString().slice(-6)}`;
    const titleOrName = data.name || data.title;
    if (titleOrName) {
      data.slug = await generateUniqueProductSlug(Product, titleOrName, data.id);
    }
    if (data.formulation && !data.fabric) data.fabric = data.formulation;
    if (data.fabric && !data.formulation) data.formulation = data.fabric;
    delete data._id;

    const product = await Product.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Product "${product.name}" (Slug: ${product.slug}) saved to MongoDB Atlas!`);
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Error saving product:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// BULK CREATE / UPSERT products
router.post('/bulk', async (req, res) => {
  try {
    const { products, replaceExisting } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products provided' });
    }

    if (replaceExisting) {
      await Product.deleteMany({});
    }

    const operations = products.map((p, idx) => {
      const pId = p.id ? String(p.id) : `prod-${Date.now()}-${idx}`;
      const barcode = p.barcode || `HAVEITALL-${Date.now().toString().slice(-6)}`;
      const slug = p.slug || toSlug(p.name || p.title || pId);
      const doc = { ...p, id: pId, barcode, slug };
      delete doc._id;
      return {
        updateOne: {
          filter: { id: pId },
          update: { $set: doc },
          upsert: true
        }
      };
    });

    await Product.bulkWrite(operations);
    console.log(`✅ Bulk synced ${products.length} products to MongoDB Atlas!`);
    res.json({ message: `Successfully synced ${products.length} products with MongoDB`, count: products.length });
  } catch (err) {
    console.error('❌ Bulk sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE product
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;

    const titleOrName = data.name || data.title;
    if (titleOrName) {
      data.slug = await generateUniqueProductSlug(Product, titleOrName, req.params.id);
    }
    if (data.formulation && !data.fabric) data.fabric = data.formulation;
    if (data.fabric && !data.formulation) data.formulation = data.fabric;

    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    console.log(`✅ Product "${product.name}" (Slug: ${product.slug}) updated in MongoDB Atlas!`);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    console.log(`✅ Product ID ${req.params.id} deleted from MongoDB Atlas!`);
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
