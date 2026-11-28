import express from 'express';
import { Setting } from '../models/Setting.js';
import { authenticate, requireRole } from '../utils/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    let settings = await Setting.findOne({ key: 'main_settings' }).lean();
    if (!settings) {
      settings = await Setting.create({ key: 'main_settings' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// Update settings (Admin only)
router.put('/', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;

    const settings = await Setting.findOneAndUpdate(
      { key: 'main_settings' },
      { $set: updateData },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update settings' });
  }
});

export default router;

