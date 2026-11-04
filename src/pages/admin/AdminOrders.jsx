import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingWaybill } from '../../components/common/ShippingWaybill';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  X,
  CreditCard,
  MessageSquare,
  Printer,
  Tag,
  FileText,
  Barcode,
  Hash,
  Save,
  Plus,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Layers
} from 'lucide-react';

export const AdminOrders = () => {
  const {
    orders,
    updateOrderStatus,
    formatPrice,
    settings,
    waybillSettings,
    updateWaybillSettings,
    incrementWaybillNumber,
    assignWaybillToOrder,
    syncUnassignedOrdersWithWaybills
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [waybillOrder, setWaybillOrder] = useState(null);

  // Waybill barcode sticker sequence state
  const [startNo, setStartNo] = useState(waybillSettings?.startNumber || 18666200);
  const [endNo, setEndNo] = useState(waybillSettings?.endNumber || 18667000);
  const [currentNo, setCurrentNo] = useState(waybillSettings?.currentNumber || 18666233);
  const [autoInc, setAutoInc] = useState(waybillSettings?.autoIncrement ?? true);

  useEffect(() => {
    if (waybillSettings) {
      setStartNo(waybillSettings.startNumber || 18666200);
      setEndNo(waybillSettings.endNumber || 18667000);
      setCurrentNo(waybillSettings.currentNumber || 18666233);
      setAutoInc(waybillSettings.autoIncrement ?? true);
    }
  }, [waybillSettings]);

  const totalStickers = Math.max(0, Number(endNo) - Number(startNo) + 1);
  const usedStickers = Math.max(0, Number(currentNo) - Number(startNo));
  const remainingStickers = Math.max(0, Number(endNo) - Number(currentNo) + 1);
  const percentageUsed = totalStickers > 0 ? Math.min(100, Math.round((usedStickers / totalStickers) * 100)) : 0;

  const handleSaveWaybillSettings = (e) => {
    e.preventDefault();
    updateWaybillSettings({
      startNumber: Number(startNo),
      endNumber: Number(endNo),
      currentNumber: Number(currentNo),
      autoIncrement: autoInc
    });
  };

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

  const filtered = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.phone && o.phone.includes(searchTerm));
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
            Orders & Shipments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer deliveries, confirm bank transfer payments & update status ({orders.length} orders).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, customer, phone..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Status:</label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Payment Review">Payment Review</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Waybill Barcode</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-mono font-bold text-slate-900">{order.id}</p>
                    <p className="text-[11px] text-slate-400">{order.date}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200/60 font-mono text-cyan-950 font-bold text-[11px] shadow-2xs">
                      <Barcode className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span>{order.waybillNumber || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{order.customer}</p>
                    <p className="text-[11px] text-slate-400">{order.phone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700">{order.paymentMethod}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`text-[11px] font-bold border rounded-lg px-2.5 py-1 focus:outline-none ${getStatusBadge(order.status)}`}
                    >
                      <option value="Payment Review">Payment Review</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setWaybillOrder(order)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="View & Print Courier Shipping Label (Waybill)"
                      >
                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Waybill</span>
                      </button>
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        title="View Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WAYBILL BARCODE STICKER SEQUENCE & SERIAL COUNTER MANAGER                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl shadow-md">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Waybill Barcode Sticker Sequence & Roll Sync
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 text-[10px] font-black uppercase tracking-wider">
                  Auto +1 Per Order
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sync with your physical Fardar Express Domestic (FED) sticker roll or barcode booklet. Every completed customer order automatically increments the waybill number by <strong>+1</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => incrementWaybillNumber(1)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              title="Skip +1 if physical sticker was spoiled or damaged"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-700" />
              <span>Skip +1 (Damaged Sticker)</span>
            </button>
            <button
              type="button"
              onClick={syncUnassignedOrdersWithWaybills}
              className="px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              title="Auto-assign consecutive waybill numbers to existing orders without one"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-700" />
              <span>Assign to Existing Orders</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWaybillOrder({
                  id: `NEXT-ORD`,
                  waybillNumber: String(currentNo),
                  customer: 'Next Customer Preview',
                  phone: '770000000',
                  address: 'Sri Lanka Delivery Destination',
                  total: 10500,
                  paymentMethod: 'Cash on Delivery',
                  status: 'Processing'
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Preview and test print next waybill label"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preview Next Label (#{currentNo})</span>
            </button>
          </div>
        </div>

        {/* Live Inventory & Sequence Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Start Number
            </span>
            <span className="font-mono text-lg font-bold text-slate-800 mt-1 block">
              {startNo}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">First sticker in roll</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              End Number
            </span>
            <span className="font-mono text-lg font-bold text-slate-800 mt-1 block">
              {endNo}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Last sticker in roll</span>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider block">
                Next Order Waybill
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-600 text-white text-[9px] font-extrabold uppercase">
                Active +1
              </span>
            </div>
            <span className="font-mono text-lg font-black text-cyan-950 mt-1 block">
              {currentNo}
            </span>
            <span className="text-[10px] text-cyan-700 mt-0.5 block">Assigned to next checkout</span>
          </div>

          <div className={`p-4 rounded-2xl border ${remainingStickers < 25 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200/70'}`}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Stickers Remaining
            </span>
            <span className={`font-mono text-lg font-bold mt-1 block ${remainingStickers < 25 ? 'text-amber-700' : 'text-slate-800'}`}>
              {remainingStickers} / {totalStickers}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              {usedStickers} stickers dispatched
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sticker Roll Utilization: <strong>{percentageUsed}% used</strong></span>
            <span><strong>{remainingStickers} stickers left</strong> until #{endNo}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-500 ${percentageUsed > 90 ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600'}`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
        </div>

        {remainingStickers < 25 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Low Waybill Sticker Warning:</strong> Only {remainingStickers} stickers remaining in this sequence batch. Please collect a new sticker roll from your courier partner and update the Start & End numbers.
            </span>
          </div>
        )}

        {/* Edit Configuration Form */}
        <form onSubmit={handleSaveWaybillSettings} className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Roll Start Number:
            </label>
            <input
              type="number"
              value={startNo}
              onChange={e => setStartNo(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-slate-50/50"
              placeholder="e.g. 18666200"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Roll End Number:
            </label>
            <input
              type="number"
              value={endNo}
              onChange={e => setEndNo(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-slate-50/50"
              placeholder="e.g. 18667000"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Current / Next Barcode Number:
            </label>
            <input
              type="number"
              value={currentNo}
              onChange={e => setCurrentNo(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-cyan-300 rounded-xl focus:outline-none focus:border-cyan-600 bg-cyan-50/30 text-cyan-950"
              placeholder="e.g. 18666233"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Sequence</span>
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
          <input
            type="checkbox"
            id="autoIncCheckbox"
            checked={autoInc}
            onChange={e => setAutoInc(e.target.checked)}
            className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500 cursor-pointer"
          />
          <label htmlFor="autoIncCheckbox" className="cursor-pointer select-none">
            <strong>Auto-Increment +1:</strong> Automatically advance the next waybill barcode number (+1) whenever a customer completes an order.
          </label>
        </div>
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Order Details: {viewingOrder.id}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-1 inline-block ${getStatusBadge(viewingOrder.status)}`}>
                  {viewingOrder.status}
                </span>
              </div>
              <button onClick={() => setViewingOrder(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs text-slate-600">
              <p><strong>Customer:</strong> {viewingOrder.customer}</p>
              <p><strong>Phone:</strong> {viewingOrder.phone}</p>
              <p><strong>Email:</strong> {viewingOrder.email || 'N/A'}</p>
              <p><strong>Delivery Destination:</strong> {viewingOrder.address}</p>
              <p><strong>Payment Option:</strong> {viewingOrder.paymentMethod}</p>
              {viewingOrder.notes && <p><strong>Notes:</strong> {viewingOrder.notes}</p>}
            </div>

            {/* Products Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ordered Items</h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                {viewingOrder.products && viewingOrder.products.map((item, i) => (
                  <div key={i} className="p-3 flex justify-between items-center bg-white">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.qty} × {formatPrice(item.price)}</p>
                    </div>
                    <span className="font-bold text-slate-900">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-cyan-700">{formatPrice(viewingOrder.total)}</span>
              </div>
            </div>

            {/* Quick Waybill Button inside Details */}
            <button
              type="button"
              onClick={() => {
                const target = viewingOrder;
                setViewingOrder(null);
                setWaybillOrder(target);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Open & Print Official Shipping Label (Waybill)</span>
            </button>

            {/* WhatsApp Contact Action */}
            <div className="flex gap-2 pt-1 border-t border-slate-100">
              <a
                href={`https://wa.me/${viewingOrder.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(viewingOrder.customer)},%20this%20is%20HAVEITALL%20regarding%20your%20order%20${viewingOrder.id}.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Customer</span>
              </a>
              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Shipping Waybill Modal */}
      {waybillOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-3xl my-6">
            <ShippingWaybill
              order={waybillOrder}
              onClose={() => setWaybillOrder(null)}
              showAdminControls={true}
              onUpdateStatus={(orderId, status) => {
                updateOrderStatus(orderId, status);
                setWaybillOrder(prev => (prev ? { ...prev, status } : null));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
