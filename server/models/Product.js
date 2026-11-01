import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, default: 'HAVEITALL' },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  rating: { type: Number, default: 5 },
  reviews: { type: Number, default: 0 },
  fabric: { type: String, default: '' },
  image: { type: String, default: '' },
  images: [{ type: String }],
  description: { type: String, default: '' },
  colors: [{ type: String }],
  sizes: [{ type: String }],
  inStock: { type: Boolean, default: true },
  stockQty: { type: Number, default: 10 },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  badge: { type: String, default: '' },
  barcode: { type: String, default: '' }
}, {
  timestamps: true,
  strict: false,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

export const Product = mongoose.model('Product', ProductSchema);

