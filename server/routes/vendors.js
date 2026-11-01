import express from 'express';
import { Vendor } from '../models/Vendor.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().select('-password');
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email });
    if (!vendor || vendor.password !== password) {
      return res.status(401).json({ error: 'Invalid vendor credentials' });
    }
    const vendorData = vendor.toObject();
    delete vendorData.password;
    res.json({ success: true, vendor: vendorData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `ven-${Date.now()}`;
    const vendor = new Vendor(data);
    await vendor.save();
    const vendorData = vendor.toObject();
    delete vendorData.password;
    res.status(201).json(vendorData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    ).select('-password');
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

