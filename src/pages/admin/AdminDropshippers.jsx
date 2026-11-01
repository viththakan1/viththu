import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Truck,
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Percent,
  CheckCircle,
  ExternalLink,
  Wallet,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDropshippers = () => {
  const { dropshippers, setDropshippers, formatPrice, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDrop, setEditingDrop] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    email: '',
    phone: '',
    tier: 'Gold Partner (20% Off)',
    discountPercentage: 20,
    bankName: 'Sampath Bank',
    accountNumber: '',
    accountHolder: ''
  });

  const filtered = dropshippers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = (d = null) => {
    if (d) {
      setEditingDrop(d);
      setFormData({
        name: d.name,
        storeName: d.storeName,
        email: d.email,
        phone: d.phone || '',
        tier: d.tier || 'Gold Partner (20% Off)',
        discountPercentage: d.discountPercentage || 20,
        bankName: d.bankName || 'Sampath Bank',
        accountNumber: d.accountNumber || '',
        accountHolder: d.accountHolder || ''
      });
    } else {
      setEditingDrop(null);
      setFormData({
        name: '',
        storeName: '',
        email: '',
        phone: '',
        tier: 'Gold Partner (20% Off)',
        discountPercentage: 20,
        bankName: 'Sampath Bank',
        accountNumber: '',
        accountHolder: ''
      });
    }
    setIsAddOpen(true);
  };

  const handleSaveDropshipper = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.storeName) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (editingDrop) {
      setDropshippers(prev => prev.map(d => d.id === editingDrop.id ? {
        ...d,
        ...formData,
        discountPercentage: Number(formData.discountPercentage)
      } : d));
      showToast(`Dropshipper "${formData.storeName}" updated!`);
    } else {
      const newD = {
        id: `drop-${Date.now().toString().slice(-4)}`,
        ...formData,
        password: 'dropship123',
        status: 'Active',
        walletBalance: 0,
        totalOrders: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setDropshippers(prev => [newD, ...prev]);
      showToast(`New dropshipper "${newD.storeName}" added!`);
    }
    setIsAddOpen(false);
  };

  const toggleStatus = (id) => {
    setDropshippers(prev => prev.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === 'Active' ? 'Suspended' : 'Active';
        showToast(`Dropshipper ${d.storeName} status set to ${nextStatus}`);
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Dropshipper & Reseller Network Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              {dropshippers.length} Partners
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage authorized reseller partners, set tier discount percentages (15-25% Off) & inspect wallet balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dropshipper/login"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Open Dropshipper Login Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dropshipper</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search dropshippers by reseller brand, name, email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Dropshippers Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="py-3.5 px-4">Reseller Store & Contact</th>
                <th className="py-3.5 px-4">Wholesale Discount</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Wallet Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.map(drop => (
                <tr key={drop.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                        {drop.storeName ? drop.storeName.slice(0, 1) : 'D'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{drop.storeName}</p>
                        <p className="text-[11px] text-slate-500">{drop.name} • {drop.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs">
                      {drop.discountPercentage || 20}% OFF
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {drop.totalOrders || 0} Parcels
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                    {formatPrice(drop.walletBalance || 0)}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleStatus(drop.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        drop.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200'
                      }`}
                    >
                      {drop.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenAdd(drop)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingDrop ? 'Edit Dropshipper Details' : 'Register New Dropshipper'}
              </h3>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleSaveDropshipper} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reseller Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kasun Senanayake"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Online Store / Brand Name (Printed on parcels) *</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="e.g. Trendy Fashion LK"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="reseller@store.lk"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Wholesale Discount % *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="50"
                    value={formData.discountPercentage}
                    onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                    placeholder="20"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0770001234"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {editingDrop ? 'Save Changes' : 'Activate Dropshipper'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

