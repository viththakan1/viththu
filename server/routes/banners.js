import express from 'express';
import { Banner } from '../models/Banner.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = `ban-${Date.now()}`;
    delete data._id;

    const banner = await Banner.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Scroll Image/Banner "${banner.title}" saved to MongoDB Atlas!`);
    res.status(201).json(banner);
  } catch (err) {
    console.error('❌ Error saving banner:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const { banners, replaceExisting } = req.body;
    if (!Array.isArray(banners) || banners.length === 0) {
      return res.status(400).json({ error: 'No banners provided' });
    }

    if (replaceExisting) {
      await Banner.deleteMany({});
    }

    const operations = banners.map((b, idx) => {
      const bId = b.id ? String(b.id) : `banner-${Date.now()}-${idx}`;
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

    await Banner.bulkWrite(operations);
    console.log(`✅ Bulk synced ${banners.length} scroll images to MongoDB Atlas!`);
    res.json({ message: `Successfully synced ${banners.length} scroll images with MongoDB`, count: banners.length });
  } catch (err) {
    console.error('❌ Bulk banner sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;

    const banner = await Banner.findOneAndUpdate(
      { id: req.params.id },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    console.log(`✅ Scroll image "${banner.title}" updated in MongoDB Atlas!`);
    res.json(banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findOneAndDelete({ id: req.params.id });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    console.log(`✅ Scroll image ID ${req.params.id} deleted from MongoDB Atlas!`);
    res.json({ message: 'Banner deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
