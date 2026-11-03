import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone1: { type: String, default: '', trim: true },
  phone2: { type: String, default: '', trim: true },
  address: { type: String, default: '', trim: true },
  district: { type: String, default: '', trim: true },
  dob: { type: String, default: '' },
  status: { type: String, default: 'Active', enum: ['Active', 'Suspended'] },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
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

export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

