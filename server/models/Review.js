import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  productId: { type: String, default: 'general', index: true },
  author: { type: String, required: true },
  rating: { type: Number, default: 5 },
  comment: { type: String, required: true },
  city: { type: String, default: 'Colombo' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  avatar: { type: String, default: '' },
  verifiedPurchase: { type: Boolean, default: true }
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

export const Review = mongoose.model('Review', ReviewSchema);

