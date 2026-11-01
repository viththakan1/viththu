import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  description: { type: String, default: '' },
  origin: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  faqs: [{
    q: { type: String },
    a: { type: String }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

export const Brand = mongoose.model('Brand', BrandSchema);

