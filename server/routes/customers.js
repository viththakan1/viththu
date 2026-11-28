import express from 'express';
import { Customer } from '../models/Customer.js';
import { generateToken, comparePassword, hashPassword, authenticate, requireRole } from '../utils/auth.js';
import { authLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

// Get all customers (Admin overview only)
router.get('/', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const customers = await Customer.find().select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
});

// Register new Customer (Rate limited)
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone1, phone2, address, district, dob } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await Customer.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const customerId = `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const hashedPassword = await hashPassword(String(password));

    const customer = new Customer({
      id: customerId,
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone1: phone1 ? String(phone1).trim() : '',
      phone2: phone2 ? String(phone2).trim() : '',
      address: address ? String(address).trim() : '',
      district: district ? String(district).trim() : '',
      dob: dob || '',
      status: 'Active'
    });

    await customer.save();
    const customerObj = customer.toObject();
    delete customerObj.password;

    // Issue JWT token
    const token = generateToken({
      id: customer.id,
      email: customer.email,
      role: 'customer',
      name: customer.name
    }, '7d');

    res.status(201).json({
      success: true,
      token,
      message: 'Account created successfully!',
      customer: customerObj
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Customer Login (Rate limited)
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const customer = await Customer.findOne({ email: normalizedEmail });

    if (!customer) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(String(password), customer.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (customer.status === 'Suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact customer support.' });
    }

    // Transparently upgrade legacy plaintext password to bcrypt hash
    if (!/^\$2[aby]\$\d{2}\$/.test(customer.password)) {
      customer.password = await hashPassword(String(password));
      await customer.save();
      console.log(`🔒 Upgraded customer "${customer.email}" password to secure bcrypt hash`);
    }

    const customerObj = customer.toObject();
    delete customerObj.password;

    // Issue JWT token
    const token = generateToken({
      id: customer.id,
      email: customer.email,
      role: 'customer',
      name: customer.name
    }, '7d');

    res.json({
      success: true,
      token,
      message: 'Logged in successfully',
      customer: customerObj
    });
  } catch (err) {
    res.status(500).json({ error: 'Authentication service error' });
  }
});

// Get Single Customer (Self or Admin)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const isOwner = req.user.id === req.params.id;
    const isAdmin = ['admin', 'superadmin'].includes(String(req.user.role).toLowerCase());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only access your own profile.' });
    }

    const customer = await Customer.findOne({ id: req.params.id }).select('-password');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Service error' });
  }
});

// Update Customer Profile (Self or Admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const isOwner = req.user.id === req.params.id;
    const isAdmin = ['admin', 'superadmin'].includes(String(req.user.role).toLowerCase());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only modify your own profile.' });
    }

    const { name, phone1, phone2, address, district, dob, password, status } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = String(name).trim();
    if (phone1 !== undefined) updateData.phone1 = String(phone1).trim();
    if (phone2 !== undefined) updateData.phone2 = String(phone2).trim();
    if (address !== undefined) updateData.address = String(address).trim();
    if (district !== undefined) updateData.district = String(district).trim();
    if (dob !== undefined) updateData.dob = dob;

    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      updateData.password = await hashPassword(String(password));
    }

    // Only Admin can suspend or reactivate customer accounts
    if (status !== undefined && isAdmin) {
      updateData.status = status;
    }

    const customer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      customer
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Profile update failed' });
  }
});

// Delete Customer (Self or Admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const isOwner = req.user.id === req.params.id;
    const isAdmin = ['admin', 'superadmin'].includes(String(req.user.role).toLowerCase());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own account.' });
    }

    const customer = await Customer.findOneAndDelete({ id: req.params.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;

