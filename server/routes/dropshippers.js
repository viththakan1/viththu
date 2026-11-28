import express from 'express';
import { Dropshipper } from '../models/Dropshipper.js';
import { generateToken, comparePassword, hashPassword, authenticate, requireRole } from '../utils/auth.js';
import { authLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

// GET all dropshippers (Admin only)
router.get('/', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const dropshippers = await Dropshipper.find().select('-password');
    res.json(dropshippers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve dropshippers' });
  }
});

// Dropshipper Login (Rate limited)
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const dropshipper = await Dropshipper.findOne({ email: normalizedEmail });

    if (!dropshipper) {
      return res.status(401).json({ error: 'Invalid dropshipper credentials' });
    }

    const isMatch = await comparePassword(String(password), dropshipper.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid dropshipper credentials' });
    }

    if (dropshipper.status === 'Pending') {
      return res.status(403).json({ error: 'Your dropshipper registration is currently pending admin approval. You will gain access once approved.' });
    }
    if (dropshipper.status === 'Suspended' || dropshipper.status === 'Rejected') {
      return res.status(403).json({ error: 'Your dropshipper account has been deactivated or rejected. Please contact store administration.' });
    }

    // Transparently upgrade legacy plaintext password to bcrypt hash
    if (!/^\$2[aby]\$\d{2}\$/.test(dropshipper.password)) {
      dropshipper.password = await hashPassword(String(password));
      await dropshipper.save();
      console.log(`🔒 Upgraded dropshipper "${dropshipper.email}" password to secure bcrypt hash`);
    }

    const dropData = dropshipper.toObject();
    delete dropData.password;

    // Issue JWT token
    const token = generateToken({
      id: dropshipper.id,
      email: dropshipper.email,
      role: 'dropshipper',
      name: dropshipper.name
    }, '7d');

    res.json({ success: true, token, dropshipper: dropData });
  } catch (err) {
    res.status(500).json({ error: 'Authentication service error' });
  }
});

// Register Dropshipper (Rate limited)
router.post('/', authLimiter, async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.name || !data.email || !data.password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    data.email = String(data.email).trim().toLowerCase();
    const existing = await Dropshipper.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    if (!data.id) data.id = `drop-${Date.now()}`;
    data.status = 'Pending';
    data.password = await hashPassword(String(data.password));

    const dropshipper = new Dropshipper(data);
    await dropshipper.save();

    const dropData = dropshipper.toObject();
    delete dropData.password;
    res.status(201).json(dropData);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Update Dropshipper (Self or Admin)
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

    // Only admin can change status, tier, or discount
    if (!isAdmin) {
      delete updateData.status;
      delete updateData.tier;
      delete updateData.discountPercentage;
      delete updateData.walletBalance;
    }

    if (updateData.password) {
      updateData.password = await hashPassword(String(updateData.password));
    }

    const dropshipper = await Dropshipper.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!dropshipper) return res.status(404).json({ error: 'Dropshipper not found' });
    res.json(dropshipper);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Update failed' });
  }
});

// Delete Dropshipper (Admin only)
router.delete('/:id', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const dropshipper = await Dropshipper.findOneAndDelete({ id: req.params.id });
    if (!dropshipper) return res.status(404).json({ error: 'Dropshipper not found' });
    res.json({ success: true, message: 'Dropshipper account permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete dropshipper' });
  }
});

export default router;

