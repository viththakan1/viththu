import express from 'express';
import { Admin } from '../models/Admin.js';
import { backfillProductSlugs } from '../utils/backfillSlugs.js';
import { generateToken, comparePassword, hashPassword, authenticate, requireRole } from '../utils/auth.js';
import { authLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

// Migration endpoint to backfill missing product and brand slugs (Admin only)
router.all('/backfill-slugs', authenticate, requireRole('superadmin', 'admin'), async (req, res) => {
  try {
    const result = await backfillProductSlugs();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Migration service error' });
  }
});

// Helper to ensure the admin user is created in MongoDB Atlas
export const ensureAdminExists = async () => {
  try {
    const defaultEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'viththakan2001@gmail.com').trim().toLowerCase();
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin1234';

    const existing = await Admin.findOne({ email: defaultEmail });
    if (!existing) {
      const hashedPassword = await hashPassword(defaultPassword);
      await Admin.create({
        email: defaultEmail,
        password: hashedPassword,
        name: 'Store Administrator',
        role: 'superadmin'
      });
      console.log('✅ Default Admin account initialized in MongoDB Atlas with secure hash');
    }
  } catch (err) {
    console.warn('Admin account initialization check:', err.message);
  }
};

// POST /api/admin/login (Rate limited)
router.post('/login', authLimiter, async (req, res) => {
  try {
    await ensureAdminExists();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const admin = await Admin.findOne({ email: trimmedEmail });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Transparently upgrade legacy plaintext password to bcrypt hash
    if (!/^\$2[aby]\$\d{2}\$/.test(admin.password)) {
      admin.password = await hashPassword(password);
      await admin.save();
      console.log(`🔒 Upgraded admin "${admin.email}" password to secure bcrypt hash`);
    }

    const adminData = admin.toObject();
    delete adminData.password;

    // Issue signed JWT token
    const token = generateToken({
      id: String(admin._id),
      email: admin.email,
      role: admin.role || 'superadmin',
      name: admin.name
    }, '1d');

    res.json({
      success: true,
      token,
      admin: adminData
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Authentication service error' });
  }
});

// GET /api/admin/check (Protected admin check)
router.get('/check', authenticate, requireRole('superadmin', 'admin'), async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    res.json({ setup: adminCount > 0, count: adminCount });
  } catch (err) {
    res.status(500).json({ error: 'Service error' });
  }
});

export default router;
