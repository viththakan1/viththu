import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ShippingWaybill } from '../../components/common/ShippingWaybill';
import { ALL_FARDAR_CITIES } from '../../utils/fardarCities';
import {
  Truck,
  Package,
  ShoppingBag,
  ShoppingCart,
  Wallet,
  DollarSign,
  Plus,
  Minus,
  Search,
  Tag,
  Eye,
  CheckCircle,
  Percent,
  Clock,
  Printer,
  Barcode,
  ArrowRight,
  ArrowLeft,
  X,
  CreditCard,
  Building,
  Sparkles,
  UserCheck,
  Trash2,
  MapPin,
  AlertCircle,
  Check
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
    showToast,
    dropshipCart = [],
    addToDropshipCart,
    updateDropshipCartItem,
    removeFromDropshipCart,
    clearDropshipCart
  } = useStore();

  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path or internal state
  const activeTabFromUrl = useMemo(() => {
    const p = location.pathname;
    if (p.endsWith('/cart')) return 'cart';
    if (p.endsWith('/orders')) return 'orders';
    if (p.endsWith('/wallet')) return 'wallet';
    if (p.endsWith('/settings')) return 'settings';
    return 'catalog';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(activeTabFromUrl);

  useEffect(() => {
    setActiveTab(activeTabFromUrl);
  }, [activeTabFromUrl]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'catalog') {
      navigate('/dropshipper');
    } else {
      navigate(`/dropshipper/${tab}`);
    }
  };

  // Item Configure Modal (to select variant/qty/selling price before adding to cart)
  const [configuringProduct, setConfiguringProduct] = useState(null);
  const [configSize, setConfigSize] = useState('Standard');
  const [configColor, setConfigColor] = useState('Default');
  const [configQuantity, setConfigQuantity] = useState(1);
  const [configSellingPrice, setConfigSellingPrice] = useState('');

  // Waybill view modal
  const [waybillOrder, setWaybillOrder] = useState(null);

  // Payout modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  // Filters & search
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Single Customer Checkout form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAltPhone, setCustomerAltPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [cityFilter, setCityFilter] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const discountPercent = currentDropshipper?.discountPercentage || 20;

  // Calculate wholesale price for a product based on dropshipper tier discount
  const getWholesalePrice = (retailPrice) => {
    return Math.round(Number(retailPrice) * (1 - discountPercent / 100));
  };

  // Orders placed by this dropshipper
  const myDropshipOrders = orders.filter(
    o => o.dropshipperId === currentDropshipper?.id || o.isDropship
  );

  // Quick Open Modal to Configure & Add to Cart
  const handleOpenConfigModal = (product) => {
    setConfiguringProduct(product);
    setConfigSize((product.sizes && product.sizes[0]) || 'Standard');
    setConfigColor((product.colors && product.colors[0]) || 'Default');
    setConfigQuantity(1);
    setConfigSellingPrice(String(product.price));
  };

  const handleAddConfiguredToCart = (goToCart = false) => {
    if (!configuringProduct) return;
    const sellPrice = Number(configSellingPrice) || configuringProduct.price;
    const wholesaleUnitPrice = getWholesalePrice(configuringProduct.price);

    if (sellPrice < wholesaleUnitPrice) {
      showToast(`Selling price cannot be less than wholesale cost (${formatPrice(wholesaleUnitPrice)})`, 'error');
      return;
    }

    addToDropshipCart(configuringProduct, {
      size: configSize,
      color: configColor,
      quantity: configQuantity,
      sellingPrice: sellPrice
    });

    setConfiguringProduct(null);

    if (goToCart) {
      handleTabChange('cart');
    }
  };

  // Quick one-click add to cart with default options
  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    addToDropshipCart(product, {
      size: (product.sizes && product.sizes[0]) || 'Standard',
      color: (product.colors && product.colors[0]) || 'Default',
      quantity: 1,
      sellingPrice: product.price
    });
  };

  // Calculate Cart Financial Totals
  const cartTotals = useMemo(() => {
    let totalQuantity = 0;
    let wholesaleTotal = 0;
    let sellingTotal = 0;

    dropshipCart.forEach(item => {
      const qty = Number(item.quantity) || 1;
      const wholesaleUnitPrice = Number(item.wholesalePrice) || getWholesalePrice(item.retailPrice);
      const sellUnitPrice = Number(item.sellingPrice) || item.retailPrice;

      totalQuantity += qty;
      wholesaleTotal += wholesaleUnitPrice * qty;
      sellingTotal += sellUnitPrice * qty;
    });

    const profit = Math.max(0, sellingTotal - wholesaleTotal);

    return {
      totalProducts: dropshipCart.length,
      totalQuantity,
      wholesaleTotal,
      sellingTotal,
      profit
    };
  }, [dropshipCart, discountPercent]);

  // Handle Multi-Product Order Placement for One Customer
  const handlePlaceCustomerOrder = (e) => {
    e.preventDefault();

    if (dropshipCart.length === 0) {
      showToast('Your dropship cart is empty! Please add products before placing an order.', 'error');
      return;
    }

    if (!customerName.trim()) {
      showToast('Please enter the customer name', 'error');
      return;
    }

    if (!customerPhone.trim()) {
      showToast('Please enter the customer mobile number', 'error');
      return;
    }

    if (!customerAddress.trim()) {
      showToast('Please enter the customer delivery address', 'error');
      return;
    }

    if (!customerCity.trim()) {
      showToast('Please select or specify the customer delivery city', 'error');
      return;
    }

    // Format all items for order
    const orderProducts = dropshipCart.map(item => ({
      id: item.id,
      name: item.name,
      qty: Number(item.quantity) || 1,
      price: Number(item.sellingPrice) || item.retailPrice,
      wholesalePrice: Number(item.wholesalePrice) || getWholesalePrice(item.retailPrice),
      size: item.size || 'Standard',
      color: item.color || 'Default',
      image: item.image
    }));

    const fullDeliveryAddress = customerAddress.toLowerCase().includes(customerCity.toLowerCase())
      ? customerAddress
      : `${customerAddress}, ${customerCity}`;

    const newOrder = createDropshipOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAltPhone: customerAltPhone.trim(),
      customerCity: customerCity.trim(),
      customerAddress: fullDeliveryAddress,
      paymentMethod,
      notes: deliveryNotes || `Dropshipped by ${currentDropshipper.storeName}`,
      wholesaleTotal: cartTotals.wholesaleTotal,
      sellingTotal: cartTotals.sellingTotal,
      profit: cartTotals.profit,
      products: orderProducts,
      clearCart: true
    });

    // Reset customer form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAltPhone('');
    setCustomerCity('');
    setCustomerAddress('');
    setDeliveryNotes('');

    // Open waybill print sticker immediately
    setWaybillOrder(newOrder);
    handleTabChange('orders');
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

  const filteredCities = useMemo(() => {
    if (!cityFilter.trim()) return ALL_FARDAR_CITIES.slice(0, 30);
    return ALL_FARDAR_CITIES.filter(c => c.toLowerCase().includes(cityFilter.toLowerCase())).slice(0, 30);
  }, [cityFilter]);

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
              Reseller: {currentDropshipper.name} • Contact: {currentDropshipper.phone} • Automated Fardar Express Domestic Fulfillment
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleTabChange('cart')}
              className="relative px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Dropship Cart</span>
              {dropshipCart.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950 text-white font-black">
                  {dropshipCart.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('catalog')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Wholesale Catalog</span>
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
              Cart Items Ready
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-amber-300 mt-1 block">
              {dropshipCart.length} Products
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">In your dropship cart</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex border-b border-slate-200 bg-white px-4 py-2 rounded-2xl shadow-xs gap-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('catalog')}
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
          onClick={() => handleTabChange('cart')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cart'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Dropship Cart & Checkout</span>
          {dropshipCart.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'cart' ? 'bg-white text-emerald-900' : 'bg-emerald-100 text-emerald-950'
            }`}>
              {dropshipCart.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Dropship Orders</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-800 font-bold">
            {myDropshipOrders.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('wallet')}
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
          onClick={() => handleTabChange('settings')}
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
              const cartItem = dropshipCart.find(i => i.id === prod.id);

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

                    {cartItem && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-xs text-emerald-400 text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>In Cart (x{cartItem.quantity})</span>
                      </div>
                    )}
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

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenConfigModal(prod)}
                        className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        title="Configure size, color, quantity and selling price"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(prod, e)}
                        className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Instantly add 1 unit with default options to cart"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Quick (+1)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DROPSHIP CART & ONE CUSTOMER CHECKOUT */}
      {activeTab === 'cart' && (
        <div className="space-y-6">
          {dropshipCart.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Your Dropship Cart is Empty
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Add multiple products to this cart and place a single combined fulfillment order for your customer. Each parcel includes your brand as the sender.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('catalog')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Package className="w-4 h-4" />
                <span>Browse Wholesale Catalog</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Cart Items (Multiple Products) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                        <span>Order Items ({dropshipCart.length} Products, {cartTotals.totalQuantity} Units)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Adjust quantities and set custom customer selling prices per product.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={clearDropshipCart}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Cart</span>
                      </button>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100">
                    {dropshipCart.map(item => {
                      const wholesaleUnit = Number(item.wholesalePrice) || getWholesalePrice(item.retailPrice);
                      const sellUnit = Number(item.sellingPrice) || item.retailPrice;
                      const lineQty = Number(item.quantity) || 1;
                      const lineWholesaleTotal = wholesaleUnit * lineQty;
                      const lineSellingTotal = sellUnit * lineQty;
                      const lineProfit = Math.max(0, lineSellingTotal - lineWholesaleTotal);

                      return (
                        <div key={item.cartItemId} className="py-4 first:pt-0 last:pb-0 space-y-3">
                          <div className="flex gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-slate-900 text-sm truncate">
                                  {item.name}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => removeFromDropshipCart(item.cartItemId)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                {item.category}
                              </span>

                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {(item.sizes && item.sizes.length > 1) ? (
                                  <select
                                    value={item.size}
                                    onChange={e => updateDropshipCartItem(item.cartItemId, { size: e.target.value })}
                                    className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700"
                                  >
                                    {item.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                ) : (
                                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                                    Size: {item.size}
                                  </span>
                                )}

                                {(item.colors && item.colors.length > 1) ? (
                                  <select
                                    value={item.color}
                                    onChange={e => updateDropshipCartItem(item.cartItemId, { color: e.target.value })}
                                    className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700"
                                  >
                                    {item.colors.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                ) : (
                                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                                    Color: {item.color}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Line Pricing & Quantity Stepper */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 items-center text-xs">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold text-[11px]">Qty:</span>
                              <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateDropshipCartItem(item.cartItemId, { quantity: Math.max(1, lineQty - 1) })}
                                  className="p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-mono font-bold text-slate-900 px-3 text-xs">
                                  {lineQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateDropshipCartItem(item.cartItemId, { quantity: Math.min(item.stockQty || 10, lineQty + 1) })}
                                  className="p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Custom Selling Price */}
                            <div>
                              <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">
                                Customer Unit Price:
                              </span>
                              <div className="relative">
                                <input
                                  type="number"
                                  min={wholesaleUnit}
                                  value={item.sellingPrice}
                                  onChange={e => updateDropshipCartItem(item.cartItemId, { sellingPrice: Math.max(0, Number(e.target.value)) })}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Wholesale: {formatPrice(wholesaleUnit)}
                              </span>
                            </div>

                            {/* Line Totals */}
                            <div className="sm:text-right">
                              <span className="text-[10px] text-slate-400 block">COD Collection:</span>
                              <span className="font-mono font-bold text-slate-900 text-sm block">
                                {formatPrice(lineSellingTotal)}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-emerald-600 block">
                                Profit: +{formatPrice(lineProfit)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleTabChange('catalog')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Add More Products to this Order</span>
                    </button>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium">Subtotal Wholesale: </span>
                      <span className="font-mono font-bold text-slate-700 text-xs">{formatPrice(cartTotals.wholesaleTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: One Customer Fulfillment & Waybill Form */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>One Parcel • Fardar Express Domestic</span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-slate-900 mt-2">
                      Customer Shipping Details (Recipient)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      All {cartTotals.totalQuantity} items above will be bundled into one parcel addressed to this customer.
                    </p>
                  </div>

                  <form onSubmit={handlePlaceCustomerOrder} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Customer Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="e.g. Kasun Fernando"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Primary Mobile (10-digits) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          placeholder="0771234567"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-medium text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Alternate Contact (Optional)
                        </label>
                        <input
                          type="tel"
                          value={customerAltPhone}
                          onChange={e => setCustomerAltPhone(e.target.value)}
                          placeholder="0719876543"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-medium text-xs"
                        />
                      </div>
                    </div>

                    {/* Delivery City with Searchable Dropdown */}
                    <div className="relative">
                      <label className="block font-bold text-slate-700 mb-1">
                        Delivery City / Town (Fardar Express) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={customerCity}
                          onFocus={() => setIsCityDropdownOpen(true)}
                          onChange={e => {
                            setCustomerCity(e.target.value);
                            setCityFilter(e.target.value);
                            setIsCityDropdownOpen(true);
                          }}
                          placeholder="Select or type city (e.g. Colombo 03, Kandy, Galle)..."
                          className="w-full px-3.5 py-2.5 pl-9 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-xs"
                        />
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>

                      {isCityDropdownOpen && (
                        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                          {filteredCities.map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                setCustomerCity(city);
                                setIsCityDropdownOpen(false);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center justify-between"
                            >
                              <span>{city}</span>
                              {customerCity === city && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Complete Delivery Address *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={customerAddress}
                        onChange={e => setCustomerAddress(e.target.value)}
                        placeholder="House / Apartment no, Street name, Landmark"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs resize-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Special Delivery Notes / Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={e => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Call before delivery, deliver after 2 PM"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>

                    {/* Sender Branding Confirmation */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-slate-600 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sender on 100×150mm Courier Waybill:</span>
                      </div>
                      <p className="font-semibold text-emerald-950">
                        {currentDropshipper.storeName} ({currentDropshipper.phone})
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Your customer will see your brand name, not HAVEITALL.
                      </p>
                    </div>

                    {/* Financial Summary & Total Profit Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-200 space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-600">
                        <span>Total Products / Units:</span>
                        <span className="font-bold text-slate-900">{dropshipCart.length} Products ({cartTotals.totalQuantity} Units)</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-600">
                        <span>Wholesale Cost (Your Cost):</span>
                        <span className="font-mono font-bold text-slate-800">{formatPrice(cartTotals.wholesaleTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-900 pt-1.5 border-t border-emerald-200">
                        <span>Customer COD Total (To Collect):</span>
                        <span className="font-mono text-base font-black text-slate-950">{formatPrice(cartTotals.sellingTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-300 font-bold text-emerald-800">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>Net Profit to Your Wallet:</span>
                        </span>
                        <span className="font-mono text-lg font-black text-emerald-700">
                          +{formatPrice(cartTotals.profit)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Order Button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Confirm & Place Customer Order (COD: {formatPrice(cartTotals.sellingTotal)})</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY DROPSHIP ORDERS */}
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
                  <th className="py-3 px-4">Products</th>
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
                  const orderItemsCount = order.products?.reduce((acc, p) => acc + (p.qty || 1), 0) || 1;

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
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {order.products?.length || 1} Prods ({orderItemsCount} pcs)
                        </span>
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

      {/* TAB 4: WALLET & PAYOUTS */}
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

      {/* TAB 5: STORE BRANDING & SETTINGS */}
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

      {/* FLOATING DROPSHIP CART BAR (When browsing catalog) */}
      {dropshipCart.length > 0 && activeTab === 'catalog' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-950/95 backdrop-blur-md text-white rounded-3xl p-4 shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white flex items-center gap-2">
                <span>Dropship Cart</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-black">
                  {dropshipCart.length} Products ({cartTotals.totalQuantity} Units)
                </span>
              </p>
              <p className="text-xs text-slate-300">
                Customer COD: <strong className="text-white font-mono">{formatPrice(cartTotals.sellingTotal)}</strong> • Profit: <strong className="text-emerald-400 font-mono">+{formatPrice(cartTotals.profit)}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTabChange('cart')}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Review & Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONFIGURE PRODUCT & ADD TO CART MODAL */}
      {configuringProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Add to Dropship Cart
                </h3>
              </div>
              <button onClick={() => setConfiguringProduct(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700 cursor-pointer" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Product Info Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={configuringProduct.image || (configuringProduct.images && configuringProduct.images[0])}
                    alt={configuringProduct.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900">{configuringProduct.name}</h5>
                    <p className="text-[11px] text-slate-500">
                      Wholesale Unit: <strong className="text-emerald-700">{formatPrice(getWholesalePrice(configuringProduct.price))}</strong> ({discountPercent}% Off)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Retail:</span>
                  <span className="font-mono text-xs line-through text-slate-500">{formatPrice(configuringProduct.price)}</span>
                </div>
              </div>

              {/* Variants & Quantity */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Size:</label>
                  <select
                    value={configSize}
                    onChange={e => setConfigSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {(configuringProduct.sizes || ['Standard']).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Color:</label>
                  <select
                    value={configColor}
                    onChange={e => setConfigColor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {(configuringProduct.colors || ['Default']).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={configuringProduct.stockQty || 10}
                    value={configQuantity}
                    onChange={e => setConfigQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Price & Profit Settings */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">
                      Customer Price / Unit (LKR):
                    </label>
                    <input
                      type="number"
                      required
                      min={getWholesalePrice(configuringProduct.price)}
                      value={configSellingPrice}
                      onChange={e => setConfigSellingPrice(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono font-bold text-sm bg-white"
                    />
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-emerald-800 block">Profit For This Item:</span>
                    <span className="font-mono text-lg font-black text-emerald-700 block">
                      +{formatPrice(Math.max(0, (Number(configSellingPrice || 0) - getWholesalePrice(configuringProduct.price)) * Number(configQuantity)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: Add & Continue vs Add & Go to Cart */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleAddConfiguredToCart(false)}
                  className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddConfiguredToCart(true)}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Add & Review Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
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
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700 cursor-pointer" />
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
                <p><strong>{currentDropshipper.bankName || 'Bank'}</strong> - {currentDropshipper.accountNumber || '1023456789'}</p>
                <p>{currentDropshipper.accountHolder || currentDropshipper.name}</p>
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
