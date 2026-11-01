import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  count: { type: Number, default: 0 },
  description: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

export const Category = mongoose.model('Category', CategorySchema);

