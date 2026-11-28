import express from 'express';
import { Vendor } from '../models/Vendor.js';
import { generateToken, comparePassword, hashPassword, authenticate, requireRole } from '../utils/auth.js';
import { authLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

// GET all vendors (Admin only)
router.get('/', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const vendors = await Vendor.find().select('-password');
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve vendors' });
  }
});

// Vendor Login (Rate limited)
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const vendor = await Vendor.findOne({ email: normalizedEmail });

    if (!vendor) {
      return res.status(401).json({ error: 'Invalid vendor credentials' });
    }

    const isMatch = await comparePassword(String(password), vendor.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid vendor credentials' });
    }

    if (vendor.status === 'Pending') {
      return res.status(403).json({ error: 'Your vendor registration is currently pending admin approval. You will gain access once approved.' });
    }
    if (vendor.status === 'Suspended' || vendor.status === 'Rejected') {
      return res.status(403).json({ error: 'Your vendor account has been deactivated or rejected. Please contact store administration.' });
    }

    // Transparently upgrade legacy plaintext password to bcrypt hash
    if (!/^\$2[aby]\$\d{2}\$/.test(vendor.password)) {
      vendor.password = await hashPassword(String(password));
      await vendor.save();
      console.log(`🔒 Upgraded vendor "${vendor.email}" password to secure bcrypt hash`);
    }

    const vendorData = vendor.toObject();
    delete vendorData.password;

    // Issue JWT token
    const token = generateToken({
      id: vendor.id,
      email: vendor.email,
      role: 'vendor',
      name: vendor.name
    }, '7d');

    res.json({ success: true, token, vendor: vendorData });
  } catch (err) {
    res.status(500).json({ error: 'Authentication service error' });
  }
});

// Register Vendor (Rate limited)
router.post('/', authLimiter, async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.name || !data.email || !data.password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    data.email = String(data.email).trim().toLowerCase();
    const existing = await Vendor.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    if (!data.id) data.id = `ven-${Date.now()}`;
    data.status = 'Pending';
    data.password = await hashPassword(String(data.password));

    const vendor = new Vendor(data);
    await vendor.save();

    const vendorData = vendor.toObject();
    delete vendorData.password;
    res.status(201).json(vendorData);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Update Vendor (Self or Admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const isOwner = req.user.id === req.params.id;
    const isAdmin = ['admin', 'superadmin'].includes(String(req.user.role).toLowerCase());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own profile.' });
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;

    // Only admin can change commission, balance, status
    if (!isAdmin) {
      delete updateData.status;
      delete updateData.commissionRate;
      delete updateData.balance;
      delete updateData.totalSales;
    }

    if (updateData.password) {
      updateData.password = await hashPassword(String(updateData.password));
    }

    const vendor = await Vendor.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Update failed' });
  }
});

// Delete Vendor (Admin only)
router.delete('/:id', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndDelete({ id: req.params.id });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ success: true, message: 'Vendor account permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

export default router;

