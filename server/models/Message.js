import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  read: { type: Boolean, default: false },
  type: { type: String, default: 'contact' }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

export const Message = mongoose.model('Message', MessageSchema);

