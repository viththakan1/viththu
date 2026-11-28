import express from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { authenticate, requireRole, optionalAuth } from '../utils/auth.js';
import { checkoutLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

// GET all orders (Admin only)
router.get('/', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const orders = await Order.find().sort({ createdAt: -1, _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// GET my customer orders (Logged-in customer)
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const userEmail = req.user.email;
    const userId = req.user.id;

    const orders = await Order.find({
      $or: [
        { customerEmail: userEmail },
        { email: userEmail },
        { customerId: userId }
      ]
    }).sort({ createdAt: -1, _id: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve your orders' });
  }
});

// GET my dropship orders (Logged-in dropshipper)
router.get('/my-dropship-orders', authenticate, requireRole('dropshipper'), async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const dropshipperId = req.user.id;
    const dropshipperEmail = req.user.email;

    const orders = await Order.find({
      $or: [
        { dropshipperId },
        { dropshipperEmail },
        { resellerId: dropshipperId }
      ]
    }).sort({ createdAt: -1, _id: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve dropship orders' });
  }
});

// GET single order (Self, Dropshipper, or Admin)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // If request has auth credentials, verify access
    if (req.user) {
      const isAdmin = ['admin', 'superadmin'].includes(String(req.user.role).toLowerCase());
      const isOwner = order.customerEmail === req.user.email || order.customerId === req.user.id;
      const isDropshipper = order.dropshipperId === req.user.id || order.dropshipperEmail === req.user.email;

      if (!isAdmin && !isOwner && !isDropshipper) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view this order.' });
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Service error' });
  }
});

// CREATE / UPSERT order (Public customer checkout with rate limiting)
router.post('/', checkoutLimiter, async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = `ORD-${Date.now().toString().slice(-6)}`;
    if (!data.date) data.date = new Date().toISOString().split('T')[0];
    delete data._id;

    // Validate essential checkout fields
    if (!data.customer && !data.recipient_name && !data.name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!data.phone && !data.recipient_contact_1 && !data.contact) {
      return res.status(400).json({ error: 'Customer contact number is required' });
    }

    const order = await Order.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Order "${order.id}" for customer "${order.customer}" saved to MongoDB Atlas!`);
    res.status(201).json(order);
  } catch (err) {
    console.error('❌ Error saving order:', err.message);
    res.status(400).json({ error: err.message || 'Failed to place order' });
  }
});

// UPDATE order status (Admin only)
router.put('/:id/status', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { status } = req.body;
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const order = await Order.findOneAndUpdate(
      query,
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

// UPDATE order (Admin only)
router.put('/:id', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const order = await Order.findOneAndUpdate(
      query,
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

// DELETE order (Admin only)
router.delete('/:id', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const order = await Order.findOneAndDelete(query);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    console.log(`✅ Order ${req.params.id} deleted from MongoDB Atlas!`);
    res.json({ message: 'Order deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
