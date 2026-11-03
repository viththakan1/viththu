import express from 'express';
import { Customer } from '../models/Customer.js';

const router = express.Router();

// Get all customers (Admin overview)
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register new Customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone1, phone2, address, district, dob } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Customer.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const customerId = `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const customer = new Customer({
      id: customerId,
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      phone1: phone1 || '',
      phone2: phone2 || '',
      address: address || '',
      district: district || '',
      dob: dob || '',
      status: 'Active'
    });

    await customer.save();
    const customerObj = customer.toObject();
    delete customerObj.password;

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      customer: customerObj
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Customer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const customer = await Customer.findOne({ email: normalizedEmail });

    if (!customer || customer.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (customer.status === 'Suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact customer support.' });
    }

    const customerObj = customer.toObject();
    delete customerObj.password;

    res.json({
      success: true,
      message: 'Logged in successfully',
      customer: customerObj
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ id: req.params.id }).select('-password');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Customer Profile
router.put('/:id', async (req, res) => {
  try {
    const { name, phone1, phone2, address, district, dob, password, status } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (phone1 !== undefined) updateData.phone1 = phone1.trim();
    if (phone2 !== undefined) updateData.phone2 = phone2.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (district !== undefined) updateData.district = district.trim();
    if (dob !== undefined) updateData.dob = dob;
    if (password) updateData.password = password;
    if (status !== undefined) updateData.status = status;

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
    res.status(400).json({ error: err.message });
  }
});

// Delete Customer (Admin or user request)
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ id: req.params.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

