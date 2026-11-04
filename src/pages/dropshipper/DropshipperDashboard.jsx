import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingWaybill } from '../../components/common/ShippingWaybill';
import {
  Truck,
  Package,
  ShoppingBag,
  Wallet,
  DollarSign,
  Plus,
  Search,
  Tag,
  Eye,
  CheckCircle,
  Percent,
  Clock,
  Printer,
  Barcode,
  ArrowRight,
  X,
  CreditCard,
  Building,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const DropshipperDashboard = () => {
  const {
    currentDropshipper,
    updateDropshipper,
    products,
    orders,
    createDropshipOrder,
    formatPrice,
    categories,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'orders' | 'wallet' | 'settings'

  // Dropship order modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Waybill view modal
  const [waybillOrder, setWaybillOrder] = useState(null);

  // Payout modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  // Filters & search
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Dropship order creation form
  const [chosenSize, setChosenSize] = useState('Standard');
  const [chosenColor, setChosenColor] = useState('Default');
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const discountPercent = currentDropshipper?.discountPercentage || 20;

  // Calculate wholesale price for a product based on dropshipper tier discount
  const getWholesalePrice = (retailPrice) => {
    return Math.round(Number(retailPrice) * (1 - discountPercent / 100));
  };

  // Orders placed by this dropshipper
  const myDropshipOrders = orders.filter(
    o => o.dropshipperId === currentDropshipper?.id || o.isDropship
  );

  const handleOpenOrderModal = (product) => {
    setSelectedProduct(product);
    setChosenSize((product.sizes && product.sizes[0]) || 'Standard');
    setChosenColor((product.colors && product.colors[0]) || 'Default');
    setQuantity(1);
    const wholesaleUnitPrice = getWholesalePrice(product.price);
    // Default selling price set to suggested retail price
    setSellingPrice(String(product.price));
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDeliveryNotes('');
    setOrderModalOpen(true);
  };

  const handleDropshipOrderSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress || !sellingPrice) {
      showToast('Please fill all required customer and pricing details', 'error');
      return;
    }

    const wholesaleUnitPrice = getWholesalePrice(selectedProduct.price);
    const wholesaleTotal = wholesaleUnitPrice * Number(quantity);
    const sellingTotal = Number(sellingPrice) * Number(quantity);
    const profit = Math.max(0, sellingTotal - wholesaleTotal);

    const newOrder = createDropshipOrder({
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod: 'Cash on Delivery',
      notes: deliveryNotes || `Dropshipped by ${currentDropshipper.storeName}`,
      wholesaleTotal,
      sellingTotal,
      profit,
      products: [
        {
          name: selectedProduct.name,
          qty: Number(quantity),
          price: Number(sellingPrice),
          wholesalePrice: wholesaleUnitPrice,
          size: chosenSize,
          color: chosenColor,
          image: selectedProduct.image
        }
      ]
    });

    setOrderModalOpen(false);
    setSelectedProduct(null);
    setWaybillOrder(newOrder); // Automatically show waybill ready to print!
  };

  const handleRequestPayout = (e) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (amountNum > (currentDropshipper.walletBalance || 0)) {
      showToast('Amount exceeds your current wallet balance', 'error');
      return;
    }

    const newBalance = (currentDropshipper.walletBalance || 0) - amountNum;
    updateDropshipper(currentDropshipper.id, { walletBalance: newBalance });
    setPayoutModalOpen(false);
    setPayoutAmount('');
    showToast(`Payout request of ${formatPrice(amountNum)} submitted for bank deposit!`);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Reseller Overview */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Percent className="w-3.5 h-3.5" />
              <span>Reseller Tier: {currentDropshipper.tier || `${discountPercent}% Off`}</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              {currentDropshipper.storeName}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Reseller: {currentDropshipper.name} • Contact: {currentDropshipper.phone} • Automated Fardar Express Fulfillment
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Browse Wholesale Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => setPayoutModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Withdraw Profit</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-300 block uppercase tracking-wider font-semibold">
              Wallet Profit Balance
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-emerald-400 mt-1 block">
              {formatPrice(currentDropshipper.walletBalance || 0)}
            </span>
            <span className="text-[10px] text-emerald-200 mt-0.5 block">Withdrawable to bank</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              Total Dropship Orders
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-white mt-1 block">
              {myDropshipOrders.length} Orders
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">Dispatched to customers</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              Wholesale Discount
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-cyan-300 mt-1 block">
              {discountPercent}% OFF
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">Direct wholesale price</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              Courier Waybill
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-amber-300 mt-1 block">
              100×150mm FED
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">Your brand on parcel</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex border-b border-slate-200 bg-white px-4 py-2 rounded-2xl shadow-xs gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Wholesale Catalog ({filteredProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Dropship Orders</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-950 font-bold">
            {myDropshipOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'wallet'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Wallet & Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Store Branding & Profile</span>
        </button>
      </div>

      {/* TAB 1: WHOLESALE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Filter Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
                placeholder="Search products by title or category..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-semibold">Category:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Cards Grid with Wholesale Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(prod => {
              const wholesalePrice = getWholesalePrice(prod.price);
              const baseMargin = prod.price - wholesalePrice;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={prod.image || (prod.images && prod.images[0])}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {discountPercent}% Wholesale Off
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h4 className="font-heading text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Price Breakdown */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Suggested Retail:</span>
                        <span className="font-mono line-through">{formatPrice(prod.price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Your Wholesale Cost:</span>
                        <span className="font-mono font-bold text-slate-900">{formatPrice(wholesalePrice)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200 font-bold text-emerald-600">
                        <span>Your Min. Profit:</span>
                        <span className="font-mono">+{formatPrice(baseMargin)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenOrderModal(prod)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dropship / Sell This</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY DROPSHIP ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-slate-900">
              My Dispatched Dropship Orders ({myDropshipOrders.length})
            </h3>
            <span className="text-xs text-slate-500">
              Each order includes your brand name on the official Fardar Express Domestic sticker
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Waybill Barcode</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Customer COD Total</th>
                  <th className="py-3 px-4">Wholesale Cost</th>
                  <th className="py-3 px-4">Your Profit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Waybill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {myDropshipOrders.map(order => {
                  const profitVal = order.dropshipperProfit || Math.max(0, (order.total || 0) - (order.wholesaleCost || Math.round((order.total || 0) * 0.8)));

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {order.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-mono text-[11px] font-bold text-emerald-900">
                          <Barcode className="w-3 h-3 text-emerald-700" />
                          <span>{order.waybillNumber || 'Pending'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{order.customer}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{order.address}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(order.total)}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{formatPrice(order.wholesaleCost || Math.round((order.total || 0) * 0.8))}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                        +{formatPrice(profitVal)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setWaybillOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                          title="Print 100mm × 150mm Shipping Waybill"
                        >
                          <Printer className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Waybill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WALLET & PAYOUTS */}
      {activeTab === 'wallet' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Dropshipper Profit Wallet
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Profits earned between your reseller selling price and wholesale cost are credited directly to your wallet.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPayoutModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>Withdraw to Bank ({formatPrice(currentDropshipper.walletBalance || 0)})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block uppercase">Available Wallet Balance</span>
              <span className="font-mono text-2xl font-black text-emerald-900 mt-1 block">
                {formatPrice(currentDropshipper.walletBalance || 0)}
              </span>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">Ready for immediate bank payout</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Total Dispatched Parcels</span>
              <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block">
                {myDropshipOrders.length} Parcels
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Delivered via Fardar Express</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Registered Payout Account</span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                {currentDropshipper.bankName || 'Sampath Bank'}
              </span>
              <span className="text-[11px] font-mono text-slate-600 block">
                {currentDropshipper.accountNumber || '1023456789'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STORE BRANDING & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs max-w-2xl space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Dropshipper Brand & Sender Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details will appear in the "Pickup Details / Sender" section of the customer's 100mm × 150mm waybill sticker so your customer sees your brand name.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast('Reseller store settings saved!');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Store / Brand Name (Printed on Waybill):</label>
              <input
                type="text"
                value={currentDropshipper.storeName}
                onChange={e => updateDropshipper(currentDropshipper.id, { storeName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sender WhatsApp Phone Number:</label>
              <input
                type="text"
                value={currentDropshipper.phone}
                onChange={e => updateDropshipper(currentDropshipper.id, { phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Bank Account for Profit Withdrawals</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Bank Name:</label>
                  <input
                    type="text"
                    value={currentDropshipper.bankName || ''}
                    onChange={e => updateDropshipper(currentDropshipper.id, { bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Account Number:</label>
                  <input
                    type="text"
                    value={currentDropshipper.accountNumber || ''}
                    onChange={e => updateDropshipper(currentDropshipper.id, { accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Save Branding Profile
            </button>
          </form>
        </div>
      )}

      {/* PLACE DROPSHIP ORDER MODAL */}
      {orderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl p-6 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Place Dropship Order for Customer
                </h3>
              </div>
              <button onClick={() => setOrderModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleDropshipOrderSubmit} className="space-y-4 text-xs">
              {/* Product Info Summary */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProduct.image || (selectedProduct.images && selectedProduct.images[0])}
                    alt={selectedProduct.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900">{selectedProduct.name}</h5>
                    <p className="text-[11px] text-slate-500">
                      Wholesale Unit Cost: <strong className="text-emerald-700">{formatPrice(getWholesalePrice(selectedProduct.price))}</strong> ({discountPercent}% Off)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Retail Price:</span>
                  <span className="font-mono text-xs line-through text-slate-500">{formatPrice(selectedProduct.price)}</span>
                </div>
              </div>

              {/* Variant selections & quantity */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Size:</label>
                  <select
                    value={chosenSize}
                    onChange={e => setChosenSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {(selectedProduct.sizes || ['Standard']).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Color:</label>
                  <select
                    value={chosenColor}
                    onChange={e => setChosenColor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {(selectedProduct.colors || ['Default']).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stockQty || 10}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Price & Profit Calculator */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">
                      Your Selling Price / COD Amount (Per Unit):
                    </label>
                    <input
                      type="number"
                      required
                      min={getWholesalePrice(selectedProduct.price)}
                      value={sellingPrice}
                      onChange={e => setSellingPrice(e.target.value)}
                      placeholder="e.g. 12500"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono font-bold text-sm bg-white"
                    />
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-emerald-800 block">Total Profit Into Your Wallet:</span>
                    <span className="font-mono text-xl font-black text-emerald-700 block">
                      +{formatPrice(Math.max(0, (Number(sellingPrice || 0) - getWholesalePrice(selectedProduct.price)) * Number(quantity)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* End Customer Delivery Destination */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Customer Shipping Details (Recipient)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Lasith Ransiri"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="0771234567"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Delivery Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    placeholder="House no, Street, City, District"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parcel Notes / Special Instructions</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="Deliver during office hours"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Submit Dropship Order & Generate FED Waybill</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYOUT REQUEST MODAL */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Withdraw Reseller Profit
              </h3>
              <button onClick={() => setPayoutModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Available Profit:</span>
                <span className="font-mono text-base font-bold text-emerald-900">
                  {formatPrice(currentDropshipper.walletBalance || 0)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Withdrawal Amount (LKR) *
                </label>
                <input
                  type="number"
                  required
                  max={currentDropshipper.walletBalance || 0}
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  placeholder={`Max: ${currentDropshipper.walletBalance || 0}`}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-bold text-sm"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600 text-[11px]">
                <p>Deposit destination:</p>
                <p><strong>{currentDropshipper.bankName}</strong> - {currentDropshipper.accountNumber}</p>
                <p>{currentDropshipper.accountHolder}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Confirm Withdrawal
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WAYBILL MODAL */}
      {waybillOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl my-6">
            <ShippingWaybill
              order={{
                ...waybillOrder,
                // Shows the dropshipper's store name as the sender so the end customer sees the reseller's brand!
                dropshipperName: currentDropshipper.storeName,
                dropshipSenderPhone: currentDropshipper.phone
              }}
              onClose={() => setWaybillOrder(null)}
              showAdminControls={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

