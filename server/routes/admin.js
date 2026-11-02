import express from 'express';
import { Admin } from '../models/Admin.js';

const router = express.Router();

// Helper to ensure the admin user is created in MongoDB Atlas
export const ensureAdminExists = async () => {
  try {
    const defaultEmail = 'viththakan2001@gmail.com';
    const existing = await Admin.findOne({ email: defaultEmail });
    if (!existing) {
      await Admin.create({
        email: defaultEmail,
        password: 'admin1234',
        name: 'Store Administrator',
        role: 'superadmin'
      });
      console.log('✅ Default Admin account initialized in MongoDB Atlas');
    }
  } catch (err) {
    console.warn('Admin account initialization check:', err.message);
  }
};

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    await ensureAdminExists();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: trimmedEmail });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const adminData = admin.toObject();
    delete adminData.password;

    res.json({
      success: true,
      admin: adminData
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Authentication service error' });
  }
});

// GET /api/admin/check (optional endpoint to check admin setup)
router.get('/check', async (req, res) => {
  try {
    await ensureAdminExists();
    const adminCount = await Admin.countDocuments();
    res.json({ setup: adminCount > 0, count: adminCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
