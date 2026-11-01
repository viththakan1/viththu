import express from 'express';
import { Setting } from '../models/Setting.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne({ key: 'main_settings' });
    if (!settings) {
      settings = await Setting.create({ key: 'main_settings' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      { key: 'main_settings' },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

