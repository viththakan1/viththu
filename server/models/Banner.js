import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  title: { type: String, default: 'Scroll Image' },
  subtitle: { type: String, default: '' },
  tag: { type: String, default: '' },
  discount: { type: String, default: '' },
  buttonText: { type: String, default: 'Shop Now' },
  link: { type: String, default: '/shop' },
  bgGradient: { type: String, default: 'from-slate-900 to-slate-800' },
  image: { type: String, default: '' },
  pages: { type: [String], default: ['Home'] }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

export const Banner = mongoose.model('Banner', BannerSchema);

