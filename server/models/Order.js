import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  customer: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  products: [{
    id: { type: String },
    name: { type: String },
    qty: { type: Number, default: 1 },
    price: { type: Number },
    color: { type: String },
    size: { type: String },
    image: { type: String }
  }],
  total: { type: Number, required: true },
  subtotal: { type: Number },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  status: { 
    type: String, 
    default: 'Pending'
  },
  paymentMethod: { type: String, default: 'COD' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  notes: { type: String, default: '' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  waybillNumber: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  courierPartner: { type: String, default: 'Fardar Express Domestic (FED)' },
  paymentReceiptUrl: { type: String, default: '' },
  dropshipperId: { type: String, default: null },
  vendorId: { type: String, default: null }
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

export const Order = mongoose.model('Order', OrderSchema);
