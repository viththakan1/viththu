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
  XCircle,
  ExternalLink,
  Wallet,
  X,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDropshippers = () => {
  const { dropshippers, setDropshippers, updateDropshipper, approveDropshipper, rejectDropshipper, suspendDropshipper, deleteDropshipper, formatPrice, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'Active' | 'Suspended'
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDrop, setEditingDrop] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    email: '',
    phone: '',
    status: 'Active',
    tier: 'Gold Partner (20% Off)',
    discountPercentage: 20,
    bankName: 'Sampath Bank',
    accountNumber: '',
    accountHolder: ''
  });

  const pendingCount = dropshippers.filter(d => d.status === 'Pending').length;
  const activeCount = dropshippers.filter(d => d.status === 'Active').length;
  const suspendedCount = dropshippers.filter(d => d.status === 'Suspended' || d.status === 'Rejected').length;

  const filtered = dropshippers.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'Pending') return d.status === 'Pending';
    if (statusFilter === 'Active') return d.status === 'Active';
    if (statusFilter === 'Suspended') return d.status === 'Suspended' || d.status === 'Rejected';
    return true;
  });

  const handleOpenAdd = (d = null) => {
    if (d) {
      setEditingDrop(d);
      setFormData({
        name: d.name,
        storeName: d.storeName,
        email: d.email,
        phone: d.phone || '',
        status: d.status || 'Active',
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
        status: 'Active',
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
      updateDropshipper(editingDrop.id, {
        ...formData,
        discountPercentage: Number(formData.discountPercentage)
      });
      showToast(`Dropshipper "${formData.storeName}" updated!`);
    } else {
      const newD = {
        id: `drop-${Date.now().toString().slice(-4)}`,
        ...formData,
        password: 'dropship123',
        status: formData.status || 'Active',
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
    const d = dropshippers.find(x => x.id === id);
    if (!d) return;
    if (d.status === 'Pending') {
      approveDropshipper(id);
    } else {
      const nextStatus = d.status === 'Active' ? 'Suspended' : 'Active';
      updateDropshipper(id, { status: nextStatus });
    }
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
            Review and approve dropshipper reseller applications, assign discount percentages & manage accounts.
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

      {/* Pending Approval Notice Banner */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                {pendingCount} New Dropshipper Application{pendingCount > 1 ? 's' : ''} Awaiting Admin Approval
              </h4>
              <p className="text-[11px] text-amber-800">
                New reseller partners cannot sign in or place wholesale orders until you approve their application.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('Pending')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Filter Pending Dropshippers ({pendingCount})
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
            All Partners ({dropshippers.length})
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
            placeholder="Search dropshippers..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
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
                <th className="py-3.5 px-4 text-right">Approval & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-xs">No dropshipper partners found matching your filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map(drop => (
                  <tr key={drop.id} className={`transition-colors ${
                    drop.status === 'Pending' ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/50'
                  }`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          drop.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
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
                      {drop.status === 'Pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3" />
                          Pending Approval
                        </span>
                      ) : drop.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={() => toggleStatus(drop.id)}
                          title="Click to suspend reseller"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleStatus(drop.id)}
                          title="Click to reactivate reseller"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          {drop.status}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {drop.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveDropshipper(drop.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                              title="Approve this dropshipper"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectDropshipper(drop.id)}
                              className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Reject application"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {drop.status !== 'Pending' && (
                          <button
                            type="button"
                            onClick={() => suspendDropshipper(drop.id)}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              drop.status === 'Active'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                            title={drop.status === 'Active' ? 'Suspend dropshipper account' : 'Reactivate dropshipper account'}
                          >
                            {drop.status === 'Active' ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Reactivate</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenAdd(drop)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                          title="Edit dropshipper"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(drop)}
                          className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
                          title="Delete dropshipper account permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                {editingDrop ? 'Edit Dropshipper Details' : 'Register New Dropshipper'}
              </h3>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700 cursor-pointer" />
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

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="Active">Active (Approved)</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Permanently Delete Dropshipper?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteTarget.name}" ({deleteTarget.storeName})</span>? This will permanently erase their reseller account from the database.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDropshipper(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

