import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: { type: String, default: 'main_settings', unique: true, index: true },
  name: { type: String, default: 'HAVEITALL' },
  storeName: { type: String, default: 'HAVEITALL' },
  tagline: { type: String, default: 'Beauty and Lifestyle' },
  phone: { type: String, default: '+94 77 135 4761' },
  whatsapp: { type: String, default: '+94771354761' },
  email: { type: String, default: 'info@axisxstudio.co' },
  address: { type: String, default: 'No. 42, Galle Road, Colombo 03, Sri Lanka' },
  hours: { type: String, default: 'Mon - Sat: 9:00 AM - 7:00 PM | Sun: 10:00 AM - 5:00 PM' },
  currency: { type: String, default: 'LKR' },
  currencySymbol: { type: String, default: 'Rs.' },
  freeShippingThreshold: { type: Number, default: 5000 },
  standardShippingRate: { type: Number, default: 450 },
  bankDetails: {
    accountName: { type: String, default: 'HAVEITALL (Pvt) Ltd' },
    bank: { type: String, default: 'Bank of Ceylon' },
    accountNumber: { type: String, default: '7745120098765432' },
    branch: { type: String, default: 'Fort Branch, Colombo' },
    swift: { type: String, default: 'BCEYLKLX' }
  },
  waybillSettings: {
    prefix: { type: String, default: 'AXISX-WAYBILL' },
    currentNumber: { type: Number, default: 18666233 },
    startNumber: { type: Number, default: 18666200 },
    endNumber: { type: Number, default: 18667000 },
    autoIncrement: { type: Boolean, default: true },
    senderName: { type: String, default: 'HAVEITALL Studio' },
    senderPhone: { type: String, default: '+94 77 135 4761' },
    senderAddress: { type: String, default: 'No. 42, Galle Road, Colombo 03, Sri Lanka' }
  },
  sliderSettings: {
    interval: { type: Number, default: 5 },
    transitionDuration: { type: Number, default: 2 }
  }
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

export const Setting = mongoose.model('Setting', SettingSchema);

