import mongoose from 'mongoose';
import { toSlug } from '../utils/slug.js';

export const generateUniqueProductSlug = async (model, text, currentDocId = null) => {
  let baseSlug = toSlug(text);
  if (!baseSlug) baseSlug = `product-${Date.now()}`;

  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug: candidate };
    if (currentDocId) {
      if (mongoose.Types.ObjectId.isValid(currentDocId)) {
        query._id = { $ne: currentDocId };
      }
      if (typeof currentDocId === 'string') {
        query.id = { $ne: currentDocId };
      }
    }

    const existing = await model.findOne(query).select('_id').lean();
    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
};

const ProductSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, default: '' },
  subCategories: [{ type: String }],
  brand: { type: String, default: 'HAVEITALL' },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  rating: { type: Number, default: 5 },
  reviews: { type: Number, default: 0 },
  formulation: { type: String, default: '' },
  fabric: { type: String, default: '' }, // backwards-compatible alias
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    sparse: true
  },
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
  barcode: { type: String, default: '' },
  expiryDate: { type: String, default: '' },
  hasExpiryDate: { type: Boolean, default: false }
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

ProductSchema.pre('save', async function (next) {
  try {
    const titleOrName = this.name || this.title;
    if (titleOrName && (this.isModified('name') || this.isModified('title') || !this.slug)) {
      this.slug = await generateUniqueProductSlug(this.constructor, titleOrName, this._id);
    }
    // Synchronize formulation and fabric for backward compatibility
    if (this.formulation && !this.fabric) {
      this.fabric = this.formulation;
    } else if (this.fabric && !this.formulation) {
      this.formulation = this.fabric;
    }
    next();
  } catch (err) {
    next(err);
  }
});

export const Product = mongoose.model('Product', ProductSchema);

