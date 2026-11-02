import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Store,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Building,
  Phone,
  Mail,
  ExternalLink,
  Percent,
  X,
  Clock,
  AlertTriangle,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminVendors = () => {
  const { vendors, setVendors, updateVendor, approveVendor, rejectVendor, formatPrice, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'Active' | 'Suspended'
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    commissionRate: 15,
    bankName: 'Commercial Bank',
    accountNumber: '',
    accountHolder: ''
  });

  const pendingCount = vendors.filter(v => v.status === 'Pending').length;
  const activeCount = vendors.filter(v => v.status === 'Active').length;
  const suspendedCount = vendors.filter(v => v.status === 'Suspended' || v.status === 'Rejected').length;

  const filtered = vendors.filter(v => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.phone && v.phone.includes(searchTerm));

    if (!matchesSearch) return false;

    if (statusFilter === 'Pending') return v.status === 'Pending';
    if (statusFilter === 'Active') return v.status === 'Active';
    if (statusFilter === 'Suspended') return v.status === 'Suspended' || v.status === 'Rejected';
    return true;
  });

  const handleOpenAdd = (v = null) => {
    if (v) {
      setEditingVendor(v);
      setFormData({
        name: v.name,
        email: v.email,
        phone: v.phone || '',
        address: v.address || '',
        status: v.status || 'Active',
        commissionRate: v.commissionRate || 15,
        bankName: v.bankName || 'Commercial Bank',
        accountNumber: v.accountNumber || '',
        accountHolder: v.accountHolder || ''
      });
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active',
        commissionRate: 15,
        bankName: 'Commercial Bank',
        accountNumber: '',
        accountHolder: ''
      });
    }
    setIsAddOpen(true);
  };

  const handleSaveVendor = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Please fill vendor name and email', 'error');
      return;
    }

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        ...formData,
        commissionRate: Number(formData.commissionRate)
      });
      showToast(`Vendor "${formData.name}" updated!`);
    } else {
      const newV = {
        id: `ven-${Date.now().toString().slice(-4)}`,
        ...formData,
        password: 'vendor123',
        status: formData.status || 'Active',
        totalSales: 0,
        balance: 0,
        createdAt: new Date().toISOString().split('T')[0],
        logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&h=120&fit=crop'
      };
      setVendors(prev => [newV, ...prev]);
      showToast(`New vendor "${newV.name}" created!`);
    }
    setIsAddOpen(false);
  };

  const toggleStatus = (id) => {
    const v = vendors.find(x => x.id === id);
    if (!v) return;
    if (v.status === 'Pending') {
      approveVendor(id);
    } else {
      const nextStatus = v.status === 'Active' ? 'Suspended' : 'Active';
      updateVendor(id, { status: nextStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Multi-Vendor Marketplace Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold">
              {vendors.length} Vendors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review and approve new vendor registrations, assign commission rates & manage seller accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/vendor/login"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Store className="w-4 h-4 text-cyan-400" />
            <span>Open Vendor Login Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vendor</span>
          </button>
        </div>
      </div>

      {/* Pending Approval Notice Banner */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                {pendingCount} New Vendor Application{pendingCount > 1 ? 's' : ''} Awaiting Admin Approval
              </h4>
              <p className="text-[11px] text-amber-800">
                New sellers cannot log in or upload products until you review and approve their account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('Pending')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Filter Pending Vendors ({pendingCount})
          </button>
        </div>
      )}

      {/* Status Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Vendors ({vendors.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'Pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approval ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'Active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Active ({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'Suspended'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            Suspended ({suspendedCount})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="py-3.5 px-4">Vendor Store</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Commission %</th>
                <th className="py-3.5 px-4">Gross Sales</th>
                <th className="py-3.5 px-4">Payable Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Approval & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Store className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-xs">No vendors found matching your filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map(vendor => (
                  <tr key={vendor.id} className={`transition-colors ${
                    vendor.status === 'Pending' ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/50'
                  }`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          vendor.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {vendor.name.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{vendor.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {vendor.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="text-slate-800 font-medium">{vendor.email}</p>
                      <p className="text-[11px] text-slate-400">{vendor.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs">
                        {vendor.commissionRate || 15}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatPrice(vendor.totalSales || 0)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {formatPrice(vendor.balance || 0)}
                    </td>
                    <td className="py-3.5 px-4">
                      {vendor.status === 'Pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3" />
                          Pending Approval
                        </span>
                      ) : vendor.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={() => toggleStatus(vendor.id)}
                          title="Click to suspend vendor"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleStatus(vendor.id)}
                          title="Click to reactivate vendor"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          {vendor.status}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {vendor.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveVendor(vendor.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                              title="Approve this vendor"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectVendor(vendor.id)}
                              className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Reject application"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenAdd(vendor)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                          title="Edit vendor"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
                {editingVendor ? 'Edit Vendor Details' : 'Register New Vendor Store'}
              </h3>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ceylon Silk House"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
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
                    placeholder="vendor@store.lk"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commission % *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pickup Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0771234567"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Active">Active (Approved)</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Pickup Address (FED Shipping) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="No, Street, City"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {editingVendor ? 'Save Changes' : 'Create Vendor Account'}
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

