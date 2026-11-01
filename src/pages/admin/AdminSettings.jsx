import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Settings,
  Save,
  Check,
  Building,
  Phone,
  Mail,
  MapPin,
  Download,
  Database,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const AdminSettings = () => {
  const {
    settings,
    setSettings,
    updateSettings,
    products,
    brands,
    categories,
    banners,
    orders,
    showToast
  } = useStore();
  const [formData, setFormData] = useState({ ...settings });

  const handleDownloadFullBackup = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      storeName: settings.name,
      products,
      brands,
      categories,
      banners,
      orders,
      settings
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `axisx_store_full_backup_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Full store backup downloaded successfully!');
  };

  const handleSyncAllData = () => {
    localStorage.setItem('axisx_products', JSON.stringify(products));
    localStorage.setItem('axisx_brands', JSON.stringify(brands));
    localStorage.setItem('axisx_categories', JSON.stringify(categories));
    localStorage.setItem('axisx_settings', JSON.stringify(settings));
    showToast('All products, brands, and settings permanently saved and synchronized!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleBankChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
          Store & Business Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure store contact info, WhatsApp ordering hotline, bank deposit details, and delivery thresholds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Store Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            General Store Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Support Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Ordering Number</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Hours</label>
              <input
                type="text"
                value={formData.hours}
                onChange={e => setFormData({ ...formData, hours: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Colombo Studio Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Currency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Shipping & Rates (LKR)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Free Islandwide Delivery Threshold (LKR)
              </label>
              <input
                type="number"
                value={formData.freeShippingThreshold}
                onChange={e => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Shipping Rate (LKR)
              </label>
              <input
                type="number"
                value={formData.standardShippingRate}
                onChange={e => setFormData({ ...formData, standardShippingRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Bank of Ceylon Transfer Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Bank Transfer Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankDetails?.bank}
                onChange={e => handleBankChange('bank', e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Name</label>
              <input
                type="text"
                value={formData.bankDetails?.accountName}
                onChange={e => handleBankChange('accountName', e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankDetails?.accountNumber}
                onChange={e => handleBankChange('accountNumber', e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
              <input
                type="text"
                value={formData.bankDetails?.branch}
                onChange={e => handleBankChange('branch', e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* System Data Backup & Permanent Storage Sync */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-50 rounded-xl text-cyan-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Data Backup & Persistence Sync
                </h3>
                <p className="text-[11px] text-slate-400">
                  Save all new updated products ({products.length}), brands ({brands.length}), and custom configurations
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Auto-Synced
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            All your products (with barcodes and image galleries), brands (with logos, banners, and custom Q&As), and store settings are automatically persisted to local storage. You can also explicitly synchronize them or download a complete JSON backup file.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSyncAllData}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
              <span>Save & Sync All Current Data</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadFullBackup}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download Full Store Backup (JSON)</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
