import express from 'express';
import { Dropshipper } from '../models/Dropshipper.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const dropshippers = await Dropshipper.find().select('-password');
    res.json(dropshippers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const dropshipper = await Dropshipper.findOne({ email });
    if (!dropshipper || dropshipper.password !== password) {
      return res.status(401).json({ error: 'Invalid dropshipper credentials' });
    }
    if (dropshipper.status === 'Pending') {
      return res.status(403).json({ error: 'Your dropshipper registration is currently pending admin approval. You will gain access once approved.' });
    }
    if (dropshipper.status === 'Suspended' || dropshipper.status === 'Rejected') {
      return res.status(403).json({ error: 'Your dropshipper account has been deactivated or rejected. Please contact store administration.' });
    }
    const dropData = dropshipper.toObject();
    delete dropData.password;
    res.json({ success: true, dropshipper: dropData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `drop-${Date.now()}`;
    if (!data.status) data.status = 'Pending';
    const dropshipper = new Dropshipper(data);
    await dropshipper.save();
    const dropData = dropshipper.toObject();
    delete dropData.password;
    res.status(201).json(dropData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const dropshipper = await Dropshipper.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    ).select('-password');
    if (!dropshipper) return res.status(404).json({ error: 'Dropshipper not found' });
    res.json(dropshipper);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

