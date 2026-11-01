import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShippingWaybill } from '../components/common/ShippingWaybill';
import {
  CheckCircle2,
  CreditCard,
  Truck,
  MessageSquare,
  ShieldCheck,
  Building,
  ArrowRight,
  ChevronLeft,
  Copy,
  Check
} from 'lucide-react';

export const CheckoutPage = () => {
  const {
    cart,
    cartSubtotal,
    formatPrice,
    settings,
    createOrder,
    getWhatsAppCartLink,
    showToast
  } = useStore();

  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Colombo',
    postalCode: '',
    notes: '',
    paymentMethod: 'Cash on Delivery'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [copiedBank, setCopiedBank] = useState(false);

  const isFreeShipping = cartSubtotal >= (settings.freeShippingThreshold || 5000);
  const shippingAmount = isFreeShipping || cartSubtotal === 0 ? 0 : (settings.standardShippingRate || 450);
  const grandTotal = cartSubtotal + shippingAmount;

  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-slate-800">Your bag is currently empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 rounded-xl bg-cyan-600 text-white font-semibold text-xs">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText(
      `${settings.bankDetails.bank}\nA/C: ${settings.bankDetails.accountNumber}\nName: ${settings.bankDetails.accountName}\nBranch: ${settings.bankDetails.branch}`
    );
    setCopiedBank(true);
    showToast('Bank details copied to clipboard!');
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address) {
      showToast('Please fill in your name, phone number, and delivery address.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const order = createOrder({
        customer: formData.fullName,
        phone: formData.phone,
        email: formData.email || 'customer@store.lk',
        address: `${formData.address}, ${formData.city} ${formData.postalCode}`,
        products: cart.map(item => ({
          name: `${item.product.name} (${item.size}, ${item.color})`,
          qty: item.quantity,
          price: item.product.price
        })),
        total: grandTotal,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });

      setConfirmedOrder(order);
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }, 600);
  };

  // Order Confirmation Success View with Official Waybill & Shipping Label
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Order Placed Successfully
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Thank You, {confirmedOrder.customer}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Your package has been booked. Your official dispatch waybill and courier tracking label is ready below:
          </p>
        </div>

        {/* Bank Transfer Alert Notice if Applicable */}
        {confirmedOrder.paymentMethod === 'Bank Transfer' && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1 text-left shadow-xs">
            <p className="font-bold flex items-center gap-1.5">
              <span>⚠️ Bank Transfer Required to Finalize Dispatch</span>
            </p>
            <p>
              Please transfer <strong>{formatPrice(confirmedOrder.total)}</strong> to Bank of Ceylon A/C <strong>{settings?.bankDetails?.accountNumber || '88392019'}</strong> and WhatsApp the deposit receipt quoting order <strong>{confirmedOrder.id}</strong>.
            </p>
          </div>
        )}

        {/* Customer Shipping Label & Waybill */}
        <div className="space-y-2">
          <ShippingWaybill order={confirmedOrder} />
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 print:hidden">
          <Link
            to="/shop"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors text-center"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors text-center"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link to="/cart" className="inline-flex items-center gap-1 hover:text-cyan-700">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Bag</span>
        </Link>
      </div>

      <h1 className="font-heading text-3xl font-bold text-slate-900 mb-8">
        Checkout & Delivery
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Customer Info & Payment Options */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Delivery Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Truck className="w-5 h-5 text-cyan-600" />
              <h2 className="font-heading text-lg font-bold text-slate-900">
                1. Delivery Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Priyantha Jayasuriya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (for Courier & WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. priyantha@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address & Apartment/House No. *
                </label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. No. 15, Station Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / District *
                </label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Colombo, Kandy, Galle"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="e.g. 00300"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Notes or Custom Instructions (Optional)
                </label>
                <textarea
                  rows="2"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Gift packing request, special delivery time, or color specifications..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-cyan-600" />
              <h2 className="font-heading text-lg font-bold text-slate-900">
                2. Select Payment Method
              </h2>
            </div>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'Cash on Delivery'
                    ? 'border-cyan-600 bg-cyan-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={formData.paymentMethod === 'Cash on Delivery'}
                  onChange={handleInputChange}
                  className="mt-1 accent-cyan-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</span>
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-bold">Islandwide</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pay securely in cash when the courier delivers the package to your doorstep.
                  </p>
                </div>
              </label>

              {/* Bank Transfer */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'Bank Transfer'
                    ? 'border-cyan-600 bg-cyan-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Bank Transfer"
                  checked={formData.paymentMethod === 'Bank Transfer'}
                  onChange={handleInputChange}
                  className="mt-1 accent-cyan-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Direct Bank Transfer (Bank of Ceylon)</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">Slip Upload</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Transfer directly into our Bank of Ceylon corporate account and send us the deposit slip via WhatsApp.
                  </p>

                  {formData.paymentMethod === 'Bank Transfer' && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-cyan-200 text-xs space-y-1.5">
                      <div className="flex justify-between items-center font-semibold text-slate-800">
                        <span>{settings.bankDetails.bank}</span>
                        <button
                          type="button"
                          onClick={handleCopyBank}
                          className="flex items-center gap-1 text-[11px] text-cyan-700 hover:underline"
                        >
                          {copiedBank ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedBank ? 'Copied' : 'Copy Info'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600">A/C Number: <strong className="font-mono text-slate-900">{settings.bankDetails.accountNumber}</strong></p>
                      <p className="text-[11px] text-slate-600">A/C Name: <strong>{settings.bankDetails.accountName}</strong></p>
                      <p className="text-[11px] text-slate-600">Branch: {settings.bankDetails.branch}</p>
                    </div>
                  )}
                </div>
              </label>

              {/* WhatsApp Checkout */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'WhatsApp Direct Pay'
                    ? 'border-cyan-600 bg-cyan-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="WhatsApp Direct Pay"
                  checked={formData.paymentMethod === 'WhatsApp Direct Pay'}
                  onChange={handleInputChange}
                  className="mt-1 accent-cyan-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Order & Pay via WhatsApp Concierge</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Fast Track</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Our studio team will contact you directly on WhatsApp to finalize payment & courier dispatch.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Bag Review ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h3>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-2 space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 pt-3 first:pt-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-16 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                    <p className="text-xs font-semibold text-slate-900 mt-1">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Islandwide Delivery</span>
                <span className="font-semibold text-slate-900">
                  {shippingAmount === 0 ? <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span> : formatPrice(shippingAmount)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Due</span>
                <span className="text-cyan-700">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-md hover:shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order ({formatPrice(grandTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Encrypted 256-bit Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
