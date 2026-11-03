import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { SRI_LANKA_DISTRICTS } from '../utils/sriLankaDistricts';
import {
  User,
  Package,
  MapPin,
  Phone,
  Calendar,
  Mail,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  Clock,
  Truck,
  Copy,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';

export const CustomerProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentCustomer,
    customerLogout,
    updateCustomerProfile,
    orders = [],
    formatPrice,
    showToast
  } = useStore();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'orders' ? 'orders' : 'profile');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedWaybill, setCopiedWaybill] = useState(null);

  // Form State initialized from currentCustomer
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone1: '',
    phone2: '',
    address: '',
    district: 'Colombo',
    dob: '',
    newPassword: ''
  });

  useEffect(() => {
    if (!currentCustomer) {
      navigate('/login', { replace: true });
      return;
    }
    setFormData({
      name: currentCustomer.name || '',
      email: currentCustomer.email || '',
      phone1: currentCustomer.phone1 || '',
      phone2: currentCustomer.phone2 || '',
      address: currentCustomer.address || '',
      district: currentCustomer.district || 'Colombo',
      dob: currentCustomer.dob || '',
      newPassword: ''
    });
  }, [currentCustomer, navigate]);

  useEffect(() => {
    if (tabParam === 'orders') {
      setActiveTab('orders');
    } else if (tabParam === 'profile') {
      setActiveTab('profile');
    }
  }, [tabParam]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (!currentCustomer) return null;

  // Filter orders for this customer (by customerId or email match)
  const customerOrders = orders.filter((order) => {
    const byId = order.customerId && currentCustomer.id && String(order.customerId) === String(currentCustomer.id);
    const byEmail =
      order.email &&
      currentCustomer.email &&
      order.email.trim().toLowerCase() === currentCustomer.email.trim().toLowerCase();
    const byCustomerEmail =
      order.customerEmail &&
      currentCustomer.email &&
      order.customerEmail.trim().toLowerCase() === currentCustomer.email.trim().toLowerCase();
    return byId || byEmail || byCustomerEmail;
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!formData.phone1.trim()) {
      showToast('Please enter at least one telephone number', 'error');
      return;
    }

    setIsSaving(true);
    const updates = {
      name: formData.name.trim(),
      phone1: formData.phone1.trim(),
      phone2: formData.phone2.trim(),
      address: formData.address.trim(),
      district: formData.district,
      dob: formData.dob
    };

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        showToast('New password must be at least 6 characters long', 'error');
        setIsSaving(false);
        return;
      }
      updates.password = formData.newPassword;
    }

    const res = await updateCustomerProfile(updates);
    setIsSaving(false);
    if (res.success && formData.newPassword) {
      setFormData(prev => ({ ...prev, newPassword: '' }));
    }
  };

  const handleCopyWaybill = (trackingNo) => {
    if (!trackingNo) return;
    navigator.clipboard?.writeText(trackingNo);
    setCopiedWaybill(trackingNo);
    showToast(`Tracking number ${trackingNo} copied!`, 'info');
    setTimeout(() => setCopiedWaybill(null), 2500);
  };

  // Tracking Stages Logic
  const getStageIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel')) return -1;
    if (s.includes('deliver')) return 4;
    if (s.includes('transit') || s.includes('courier') || s.includes('shipped') || s.includes('dispatch')) return 3;
    if (s.includes('process') || s.includes('pack')) return 1;
    return 0; // Default Pending / Placed
  };

  const trackingSteps = [
    { label: 'Order Placed', desc: 'Received & verified' },
    { label: 'Processing', desc: 'Packed at warehouse' },
    { label: 'Handed to Courier', desc: 'Waybill scanned' },
    { label: 'In Transit', desc: 'Out for delivery' },
    { label: 'Delivered', desc: 'Handed to customer' }
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-linear-to-b from-cyan-50/30 via-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Profile Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-100/40 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-cyan-500 to-teal-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              {currentCustomer.name ? currentCustomer.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                  {currentCustomer.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                  Verified Shopper
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentCustomer.email}</span>
                {currentCustomer.phone1 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentCustomer.phone1}</span>
                  </>
                )}
                {currentCustomer.district && (
                  <>
                    <span className="text-slate-300">•</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentCustomer.district}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 shrink-0">
            <Link
              to="/shop"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>Browse Shop</span>
            </Link>
            <button
              type="button"
              onClick={customerLogout}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-700 hover:text-rose-600 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 gap-2 sm:gap-4 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => switchTab('profile')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-cyan-600 text-cyan-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details & Addresses</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('orders')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-cyan-600 text-cyan-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders & Live Tracking</span>
            {customerOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">
                {customerOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 space-y-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Personal & Delivery Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep your contact details up to date so your orders and delivery parcels arrive smoothly.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kasun Perera"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-500 bg-slate-100 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Account email cannot be modified directly.
                  </span>
                </div>
              </div>

              {/* Telephone No 1 & Telephone No 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Telephone No 1 (Primary Contact) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={formData.phone1}
                      onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                      placeholder="077 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Telephone No 2 (Secondary / WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={formData.phone2}
                      onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                      placeholder="071 987 6543 (optional)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Default Delivery Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. No. 45/2, Temple Road, Mount Lavinia"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* District & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    District (Sri Lanka)
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-white cursor-pointer"
                  >
                    {SRI_LANKA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password (Optional) */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Change Password (leave empty to keep current password)
                </label>
                <div className="relative max-w-sm">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: MY ORDERS & LIVE TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Order History & Live Courier Tracking
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track every order status in real-time, view waybills, and review purchased items.
              </p>
            </div>

            {customerOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-800">
                    No orders placed yet
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You haven't placed any orders with this account yet. Browse our beauty and lifestyle catalogue to get started!
                  </p>
                </div>
                <div>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Start Shopping</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {customerOrders.map((order) => {
                  const currentStage = getStageIndex(order.status);
                  const isCancelled = (order.status || '').toLowerCase().includes('cancel');
                  const waybill = order.waybillNumber || order.trackingNumber || '';

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden"
                    >
                      {/* Order Header Summary */}
                      <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900">
                              #{order.id}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">
                              {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent')}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isCancelled
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : currentStage >= 4
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                              }`}
                            >
                              {order.status || 'Processing'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Payment: <span className="font-bold text-slate-700">{order.paymentMethod || 'Cash On Delivery'}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 block">Total Amount</span>
                            <span className="font-heading font-extrabold text-lg text-slate-900 text-cyan-800">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Live Courier Tracking Stepper */}
                      <div className="p-5 sm:p-6 border-b border-slate-100 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-cyan-600" />
                            <h4 className="font-heading text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Real-Time Courier Tracking ({order.courierPartner || 'Fardar Express Domestic'})
                            </h4>
                          </div>

                          {waybill && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                Tracking / Waybill No:
                              </span>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-800 border border-slate-200">
                                <span>{waybill}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyWaybill(waybill)}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                                  title="Copy Tracking #"
                                >
                                  {copiedWaybill === waybill ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Stepper Progress Bar */}
                        {isCancelled ? (
                          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>This order has been cancelled. If you have questions, please reach out to customer support.</span>
                          </div>
                        ) : (
                          <div className="relative pt-2 pb-1">
                            <div className="grid grid-cols-5 gap-1 sm:gap-2">
                              {trackingSteps.map((step, idx) => {
                                const isPassed = currentStage >= idx;
                                const isCurrent = currentStage === idx;

                                return (
                                  <div key={step.label} className="flex flex-col items-center text-center">
                                    <div
                                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs transition-all ${
                                        isPassed
                                          ? 'bg-cyan-600 text-white shadow-xs ring-4 ring-cyan-100'
                                          : 'bg-slate-100 text-slate-400'
                                      }`}
                                    >
                                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <span
                                      className={`text-[10px] sm:text-xs font-bold mt-2 leading-tight ${
                                        isCurrent
                                          ? 'text-cyan-800'
                                          : isPassed
                                          ? 'text-slate-800'
                                          : 'text-slate-400'
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                    <span className="hidden md:inline text-[9px] text-slate-400 mt-0.5">
                                      {step.desc}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Purchased Items List */}
                      <div className="p-5 sm:p-6 space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Items in this parcel ({order.products?.length || 0})
                        </h4>
                        <div className="divide-y divide-slate-100">
                          {(order.products || []).map((item, pIdx) => (
                            <div key={pIdx} className="py-3 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                                    {item.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    Qty: <span className="font-bold text-slate-700">{item.qty || 1}</span>
                                    {item.color && ` • Color: ${item.color}`}
                                    {item.size && ` • Size: ${item.size}`}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs sm:text-sm font-bold text-slate-800">
                                  {formatPrice((item.price || 0) * (item.qty || 1))}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Destination Footnote */}
                        {order.address && (
                          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>
                              Delivering to: <strong className="text-slate-700">{order.customer || currentCustomer.name}</strong> • {order.address} {order.phone && `(${order.phone})`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
