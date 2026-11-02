import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  DollarSign,
  ShoppingBag,
  Package,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    orders,
    products,
    messages,
    vendors = [],
    dropshippers = [],
    banners = [],
    sliderSettings = { interval: 5, transitionDuration: 2 },
    formatPrice,
    updateOrderStatus
  } = useStore();

  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Payment Review' || o.status === 'Processing');
  const unreadMessages = messages.filter(m => !m.read);
  const pendingVendors = vendors.filter(v => v.status === 'Pending');
  const pendingDropshippers = dropshippers.filter(d => d.status === 'Pending');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Payment Review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
            Store Performance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics for AxisX Store operations, orders, and inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">{formatPrice(totalRevenue)}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% this month</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">{orders.length}</h3>
            <p className="text-[11px] text-cyan-700 font-medium mt-1">
              {pendingOrders.length} pending review / processing
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Inventory</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">{products.length} Designs</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Across 6 luxury categories
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">{messages.length}</h3>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              {unreadMessages.length} unread inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Pending Partner Approvals Alert Banner */}
      {(pendingVendors.length > 0 || pendingDropshippers.length > 0) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <span>Partner Applications Awaiting Admin Approval</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black">
                  {pendingVendors.length + pendingDropshippers.length} PENDING
                </span>
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {pendingVendors.length > 0 && `${pendingVendors.length} vendor(s) `}
                {pendingVendors.length > 0 && pendingDropshippers.length > 0 && 'and '}
                {pendingDropshippers.length > 0 && `${pendingDropshippers.length} dropshipper(s) `}
                cannot access their accounts until approved.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pendingVendors.length > 0 && (
              <Link
                to="/admin/vendors"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Review Vendors ({pendingVendors.length})
              </Link>
            )}
            {pendingDropshippers.length > 0 && (
              <Link
                to="/admin/dropshippers"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Review Dropshippers ({pendingDropshippers.length})
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Landing Page Scroll Images Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Landing Page Scroll Images
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-100">
                {sliderSettings.interval}s Interval • {sliderSettings.transitionDuration}s Transit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live banner slides rotating automatically on your storefront home page with 3-4 dots.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/banners"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Manage Images</span>
            </Link>
          </div>
        </div>

        {/* Live Scroll Images Grid Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {banners.map((slide, index) => (
            <div
              key={slide.id || index}
              className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group shadow-2xs"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-3 flex flex-col justify-end text-white">
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                  Slide {index + 1}
                </span>
                <p className="font-bold text-xs line-clamp-1">{slide.title}</p>
                <p className="text-[10px] text-slate-300 line-clamp-1">{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-slate-900">
            Recent Client Orders
          </h3>
          <Link to="/admin/orders" className="text-xs font-bold text-cyan-700 hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{order.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{order.customer}</p>
                    <p className="text-[11px] text-slate-400">{order.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    {order.products && order.products.map(p => p.name).join(', ')}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(order.total)}</td>
                  <td className="py-3 px-4">{order.paymentMethod}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-[11px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                    >
                      <option value="Payment Review">Payment Review</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
