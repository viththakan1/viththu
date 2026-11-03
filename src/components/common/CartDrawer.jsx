import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check, MessageSquare } from 'lucide-react';
import { getProductPath } from '../../utils/productUrl';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
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

  if (!isCartOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) return null;

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

  const freeShippingThreshold = settings.freeShippingThreshold || 5000;
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const waUrl = getWhatsAppCartLink();
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-cyan-600" />
              <h2 className="font-heading text-lg font-bold text-slate-800">
                Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping banner */}
          <div className="bg-cyan-50/80 px-5 py-3 border-b border-cyan-100">
            {isFreeShipping ? (
              <p className="text-xs font-semibold text-cyan-900 flex items-center gap-1.5">
                🎉 Congratulations! You unlocked <span className="underline">FREE Islandwide Delivery</span>!
              </p>
            ) : (
              <p className="text-xs text-cyan-900">
                Add <span className="font-bold text-cyan-700">{formatPrice(remainingForFreeShipping)}</span> more for <span className="font-bold">Free Islandwide Delivery</span>!
              </p>
            )}
            <div className="w-full h-1.5 bg-cyan-200/60 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-cyan-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">Your bag is empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Discover our handcrafted sarees, pure linen wear, and fine textiles.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold shadow-md transition-all"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:border-cyan-100 bg-white hover:bg-slate-50/50 transition-all shadow-sm"
                >
                  <Link
                    to={getProductPath(item.product)}
                    onClick={() => setIsCartOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover rounded-lg hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <Link
                          to={getProductPath(item.product)}
                          onClick={() => setIsCartOpen(false)}
                          className="hover:text-cyan-700 transition-colors"
                        >
                          <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                            {item.product.name}
                          </h4>
                        </Link>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1 -mr-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">Size: {item.size}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded">Color: {item.color}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateCartQuantity(index, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(index, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-slate-200 p-5 bg-slate-50 space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. AXISX10)"
                    disabled={couponApplied}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    disabled={couponApplied || !couponCode.trim()}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-50 transition-colors"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Coupon applied ({discountPercent}% off)!
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>
                )}
              </form>

              {/* Cost breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
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
                  <span>Shipping (Islandwide)</span>
                  <span className="font-semibold text-slate-900">
                    {shippingAmount === 0 ? <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span> : formatPrice(shippingAmount)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-cyan-700 text-base">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm shadow-md hover:shadow-cyan-600/20 transition-all group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Direct Order via WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
