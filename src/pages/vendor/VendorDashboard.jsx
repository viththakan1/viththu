import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingWaybill } from '../../components/common/ShippingWaybill';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Search,
  Tag,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Building,
  CreditCard,
  Edit,
  Trash2,
  X,
  Printer,
  Barcode,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const VendorDashboard = () => {
  const {
    currentVendor,
    updateVendor,
    products,
    setProducts,
    orders,
    updateOrderStatus,
    formatPrice,
    categories,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'payouts' | 'settings'

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [waybillOrder, setWaybillOrder] = useState(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  // Search in products / orders
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Products belonging to THIS vendor (or products with vendorId matching currentVendor.id)
  const vendorProducts = products.filter(
    p => p.vendorId === currentVendor?.id || (!p.vendorId && currentVendor?.id === 'ven-1')
  );

  // Orders containing this vendor's products or all orders for demo vendor
  const vendorOrders = orders.filter(o => {
    if (!o.products) return true;
    return o.products.some(item => vendorProducts.some(vp => vp.name === item.name));
  });

  // New product form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sarees',
    price: '',
    stockQty: 10,
    fabric: 'Pure Silk',
    description: '',
    colors: 'Red, Gold',
    sizes: 'Free Size',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=92'
  });

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const sizesArr = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const colorsArr = formData.colors.split(',').map(c => c.trim()).filter(Boolean);

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        ...formData,
        price: Number(formData.price),
        stockQty: Number(formData.stockQty),
        sizes: sizesArr.length > 0 ? sizesArr : ['Free Size'],
        colors: colorsArr.length > 0 ? colorsArr : ['Default']
      } : p));
      showToast(`Product "${formData.name}" updated!`);
      setEditingProduct(null);
    } else {
      const newProd = {
        id: `vp-${Date.now().toString().slice(-6)}`,
        ...formData,
        price: Number(formData.price),
        stockQty: Number(formData.stockQty),
        sizes: sizesArr.length > 0 ? sizesArr : ['Free Size'],
        colors: colorsArr.length > 0 ? colorsArr : ['Default'],
        images: [formData.image],
        vendorId: currentVendor.id,
        vendorName: currentVendor.name,
        inStock: true,
        rating: 5.0,
        reviews: 0,
        barcode: `VEN-${String(Math.floor(100000 + Math.random() * 900000))}`
      };
      setProducts(prev => [newProd, ...prev]);
      showToast(`Product "${newProd.name}" listed under your store!`);
    }

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      category: 'Sarees',
      price: '',
      stockQty: 10,
      fabric: 'Pure Silk',
      description: '',
      colors: 'Red, Gold',
      sizes: 'Free Size',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=92'
    });
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category || 'Sarees',
      price: prod.price,
      stockQty: prod.stockQty || 10,
      fabric: prod.fabric || 'Cotton',
      description: prod.description || '',
      colors: Array.isArray(prod.colors) ? prod.colors.join(', ') : 'Red',
      sizes: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : 'Free Size',
      image: prod.image || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Are you sure you want to remove this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product removed from catalog', 'info');
    }
  };

  const handleRequestPayout = (e) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      showToast('Please enter a valid payout amount', 'error');
      return;
    }
    if (amountNum > (currentVendor?.balance || 0)) {
      showToast('Payout amount exceeds your current available balance', 'error');
      return;
    }

    const newBalance = (currentVendor.balance || 0) - amountNum;
    updateVendor(currentVendor.id, { balance: newBalance });
    setPayoutModalOpen(false);
    setPayoutAmount('');
    showToast(`Payout request for ${formatPrice(amountNum)} submitted to AxisX finance team!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-cyan-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-cyan-200 text-xs font-semibold">
              <Building className="w-3.5 h-3.5" />
              <span>Seller ID: {currentVendor.id}</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              {currentVendor.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Warehouse Pickup: {currentVendor.address} | Contact: {currentVendor.phone}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            <button
              type="button"
              onClick={() => setPayoutModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              Total Revenue
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-white mt-1 block">
              {formatPrice(currentVendor.totalSales || 185000)}
            </span>
            <span className="text-[10px] text-cyan-300 mt-0.5 block">Marketplace lifetime</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-300 block uppercase tracking-wider font-semibold">
              Available Balance
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-emerald-400 mt-1 block">
              {formatPrice(currentVendor.balance || 0)}
            </span>
            <span className="text-[10px] text-emerald-200 mt-0.5 block">Ready for bank transfer</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              My Listed Items
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-white mt-1 block">
              {vendorProducts.length} Products
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">Live in store catalog</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              Commission Fee
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-cyan-300 mt-1 block">
              {currentVendor.commissionRate || 15}%
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">Net vendor payout 85%</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex border-b border-slate-200 bg-white px-4 py-2 rounded-2xl shadow-xs gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview & Activity
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>My Products</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {vendorProducts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Orders & Waybills</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-100 text-cyan-900 font-bold">
            {vendorOrders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bank Payouts
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Store Settings
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Recent Customer Orders for Your Products
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {vendorOrders.slice(0, 4).map(o => (
                  <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{o.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {o.customer} • {o.address}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {formatPrice(o.total)}
                      </span>
                      <button
                        onClick={() => setWaybillOrder(o)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                        title="Print FED Courier Waybill"
                      >
                        <Tag className="w-3 h-3 text-cyan-400" />
                        <span>Waybill</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Bank Summary Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-heading text-sm font-bold text-slate-900">
                  Registered Payout Account
                </h4>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <p><strong>Bank:</strong> {currentVendor.bankName || 'Commercial Bank'}</p>
                <p><strong>Account No:</strong> {currentVendor.accountNumber || '8004561230'}</p>
                <p><strong>Account Name:</strong> {currentVendor.accountHolder || currentVendor.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPayoutModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Withdraw Balance ({formatPrice(currentVendor.balance || 0)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={prodSearch}
                onChange={e => setProdSearch(e.target.value)}
                placeholder="Search my products..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {vendorProducts
                    .filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
                    .map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image || (prod.images && prod.images[0])}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{prod.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{prod.barcode || prod.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{prod.category}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(prod.price)}</td>
                        <td className="py-3 px-4 font-mono">{prod.stockQty || 10}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & WAYBILLS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-slate-900">
              Orders for Dispatch ({vendorOrders.length})
            </h3>
            <span className="text-xs text-slate-500">
              Print official 100mm × 150mm Fardar Express Domestic labels for your warehouse pickup
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Waybill Barcode</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Waybill Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {vendorOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {order.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-800">
                        <Barcode className="w-3 h-3 text-cyan-700" />
                        <span>{order.waybillNumber || 'Pending'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{order.customer}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{order.address}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setWaybillOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Print 100mm × 150mm Shipping Waybill"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Print Waybill</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Vendor Payouts & Commission
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Earnings are credited upon parcel delivery. Market fee is automatically deducted.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPayoutModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>Request Payout ({formatPrice(currentVendor.balance || 0)})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Gross Sales</span>
              <span className="font-mono text-xl font-bold text-slate-900 mt-1 block">
                {formatPrice(currentVendor.totalSales || 185000)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Platform Commission (15%)</span>
              <span className="font-mono text-xl font-bold text-rose-600 mt-1 block">
                {formatPrice(Math.round((currentVendor.totalSales || 185000) * 0.15))}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block uppercase">Withdrawable Net Balance</span>
              <span className="font-mono text-xl font-bold text-emerald-700 mt-1 block">
                {formatPrice(currentVendor.balance || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs max-w-2xl space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Seller Profile & Warehouse Settings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This address will appear as the "Pickup Details" on the Fardar Express Domestic waybill labels.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast('Store profile details updated!');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store / Brand Name:</label>
              <input
                type="text"
                value={currentVendor.name}
                onChange={e => updateVendor(currentVendor.id, { name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pickup Contact Phone:</label>
              <input
                type="text"
                value={currentVendor.phone}
                onChange={e => updateVendor(currentVendor.id, { phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Warehouse Pickup Address (FED Shipping):</label>
              <textarea
                rows={3}
                value={currentVendor.address}
                onChange={e => updateVendor(currentVendor.id, { address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-3">Bank Payout Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Bank Name:</label>
                  <input
                    type="text"
                    value={currentVendor.bankName || ''}
                    onChange={e => updateVendor(currentVendor.id, { bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Account Number:</label>
                  <input
                    type="text"
                    value={currentVendor.accountNumber || ''}
                    onChange={e => updateVendor(currentVendor.id, { accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl p-6 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Vendor Product' : 'Add New Product to Your Store'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Handwoven Cotton Kurta"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Selling Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 7500"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQty}
                    onChange={e => setFormData({ ...formData, stockQty: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fabric / Material</label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={e => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="Pure Silk / Linen"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Sizes (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL or Free Size"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Colors (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={e => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Red, Blue, Gold"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Save Product' : 'Publish Product to Store'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST PAYOUT MODAL */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Request Vendor Payout
              </h3>
              <button onClick={() => setPayoutModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Current Available:</span>
                <span className="font-mono text-base font-bold text-emerald-900">
                  {formatPrice(currentVendor.balance || 0)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payout Amount (LKR) *
                </label>
                <input
                  type="number"
                  required
                  max={currentVendor.balance || 0}
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  placeholder={`Max: ${currentVendor.balance || 0}`}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-bold text-sm"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600 text-[11px]">
                <p>Transfer destination:</p>
                <p><strong>{currentVendor.bankName}</strong> - {currentVendor.accountNumber}</p>
                <p>{currentVendor.accountHolder}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Confirm Bank Transfer
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

      {/* WAYBILL PRINT MODAL */}
      {waybillOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl my-6">
            <ShippingWaybill
              order={{
                ...waybillOrder,
                // Provide vendor's pickup address and phone on the waybill!
                vendorPickupName: currentVendor.name,
                vendorPickupAddress: currentVendor.address,
                vendorPickupPhone: currentVendor.phone
              }}
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

