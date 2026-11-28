import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Store Administrator'
  },
  role: {
    type: String,
    default: 'superadmin'
  }
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

AdminSchema.pre('save', async function (next) {
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

export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
