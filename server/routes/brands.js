import express from 'express';
import { Brand } from '../models/Brand.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: 1 });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findOne({ id: req.params.id });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = `brand-${Date.now()}`;
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
