import express from 'express';
import { Order } from '../models/Order.js';

const router = express.Router();

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE / UPSERT order
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = `ORD-${Date.now().toString().slice(-6)}`;
    if (!data.date) data.date = new Date().toISOString().split('T')[0];
    delete data._id;

    const order = await Order.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Order "${order.id}" for customer "${order.customer}" saved to MongoDB Atlas!`);
    res.status(201).json(order);
  } catch (err) {
    console.error('❌ Error saving order:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    console.log(`✅ Order ${order.id} status updated to "${status}" in MongoDB Atlas!`);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE order
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: data },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    console.log(`✅ Order ${order.id} updated in MongoDB Atlas!`);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    console.log(`✅ Order ${req.params.id} deleted from MongoDB Atlas!`);
    res.json({ message: 'Order deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
