import mongoose from 'mongoose';

const DropshipperSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  storeName: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  tier: { type: String, default: 'Silver Partner (15% Off)' },
  discountPercentage: { type: Number, default: 15 },
  walletBalance: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  accountHolder: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

export const Dropshipper = mongoose.model('Dropshipper', DropshipperSchema);

