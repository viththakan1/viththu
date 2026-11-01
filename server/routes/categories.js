import express from 'express';
import { Category } from '../models/Category.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ count: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
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

router.post('/bulk', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  try {
    const cat = await Category.findOneAndDelete({ id: req.params.id });
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    console.log(`✅ Category ID ${req.params.id} deleted from MongoDB Atlas!`);
    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
