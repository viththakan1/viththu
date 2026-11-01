import express from 'express';
import { Product } from '../models/Product.js';

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const { category, brand, search, featured, inStock } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (brand && brand !== 'All') {
      query.brand = brand;
    }
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
        { fabric: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
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
    if (!data.barcode) data.barcode = `AXISX-${Date.now().toString().slice(-6)}`;
    delete data._id;

    const product = await Product.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Product "${product.name}" (ID: ${product.id}) saved to MongoDB Atlas!`);
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
      const barcode = p.barcode || `AXISX-${Date.now().toString().slice(-6)}`;
      const doc = { ...p, id: pId, barcode };
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

    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    console.log(`✅ Product "${product.name}" updated in MongoDB Atlas!`);
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
