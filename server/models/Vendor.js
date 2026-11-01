import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  storeSlug: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  status: { type: String, default: 'Active' },
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
      delete ret.__v;
      return ret;
    }
  }
});

export const Vendor = mongoose.model('Vendor', VendorSchema);

