import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check, MessageSquare, ChevronLeft } from 'lucide-react';
import { getProductPath } from '../utils/productUrl';

export const CartPage = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    formatPrice,
    settings,
    getWhatsAppCartLink
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'AXISX10' || code === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponApplied(true);
      setCouponError('');
    } else if (code === 'FESTIVE20') {
      setDiscountPercent(20);
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try AXISX10 or FESTIVE20');
    }
  };

  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const isFreeShipping = cartSubtotal >= (settings.freeShippingThreshold || 5000);
  const shippingAmount = isFreeShipping || cartSubtotal === 0 ? 0 : (settings.standardShippingRate || 450);
  const finalTotal = cartSubtotal - discountAmount + shippingAmount;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-600 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-slate-900">Your Bag is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Explore our collection of handwoven sarees, pure linen shirts, and fine textiles.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm shadow-md transition-all mt-4"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link to="/shop" className="inline-flex items-center gap-1 hover:text-cyan-700">
          <ChevronLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <h1 className="font-heading text-3xl font-bold text-slate-900 mb-8">
        Your Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {cart.map((item, index) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-24 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                    {item.product.category}
                  </span>
                  <Link to={getProductPath(item.product)}>
                    <h3 className="font-heading text-base font-bold text-slate-900 hover:text-cyan-700 transition-colors truncate">
                      {item.product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">Size: {item.size}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded">Color: {item.color}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 mt-2 sm:mt-0">
                  {/* Quantity */}
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateCartQuantity(index, item.quantity - 1)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(index, item.quantity + 1)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-24">
                    <p className="text-sm font-bold text-slate-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatPrice(item.product.price)} each</p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(index)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <h2 className="font-heading text-lg font-bold text-slate-900">Order Summary</h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="e.g. AXISX10"
                  disabled={couponApplied}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={couponApplied || !couponCode.trim()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {couponApplied && (
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Coupon code applied ({discountPercent}% off)!
                </p>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Islandwide Delivery</span>
                <span className="font-semibold text-slate-900">
                  {shippingAmount === 0 ? <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span> : formatPrice(shippingAmount)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-cyan-700">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-md hover:shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const url = getWhatsAppCartLink();
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="w-full py-3 rounded-xl border border-emerald-500/50 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Order via WhatsApp Direct</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
