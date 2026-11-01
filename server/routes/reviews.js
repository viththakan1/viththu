import express from 'express';
import { Review } from '../models/Review.js';

const router = express.Router();

// GET all reviews (or filtered by productId)
router.get('/', async (req, res) => {
  try {
    const { productId } = req.query;
    const query = productId ? { productId } : {};
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE / UPSERT review
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = `rev-${Date.now()}`;
    if (!data.date) data.date = new Date().toISOString().split('T')[0];
    delete data._id;

    const review = await Review.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Review by "${review.author}" saved to MongoDB Atlas!`);
    res.status(201).json(review);
  } catch (err) {
    console.error('❌ Error saving review:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE review
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ id: req.params.id });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

