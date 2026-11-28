import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const VendorSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  storeSlug: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  commissionRate: { type: Number, default: 15 },
  totalSales: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  accountHolder: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  logo: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

VendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    if (!/^\$2[aby]\$\d{2}\$/.test(this.password)) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (err) {
    next(err);
  }
});

export const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

