import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  CreditCard,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';

export const Footer = () => {
  const { settings } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-10 border-t border-slate-800">
      {/* Trust Highlights Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Islandwide Delivery</h4>
              <p className="text-xs text-slate-400">Within 3-5 days across Sri Lanka</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Authentic Quality</h4>
              <p className="text-xs text-slate-400">Genuine global skincare & cosmetics</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">WhatsApp Ordering</h4>
              <p className="text-xs text-slate-400">Fast assistance & instant confirmation</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Flexible Payments</h4>
              <p className="text-xs text-slate-400">Cash on Delivery & Bank Transfer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {/* Large Logo Symbol */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
                <img
                  src="/haveitall-logo.png"
                  alt="HAVEITALL"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              {/* Website Name */}
              <div className="flex flex-col">
                <span className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none">
                  HAVE<span className="text-cyan-400">ITALL</span>
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                  Beauty and Lifestyle
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Looking for genuine global brands in Sri Lanka? At haveitall.lk, we buy directly from official brand websites across the globe—so you never have to worry about fakes. Enjoy 100% authentic products with reliable islandwide delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-heading text-base font-bold text-white uppercase tracking-wider text-xs">
              Explore
            </h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/shop" className="hover:text-cyan-400 transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/shop?category=Skincare" className="hover:text-cyan-400 transition-colors">Skincare</Link>
              </li>
              <li>
                <Link to="/shop?category=Cosmetics" className="hover:text-cyan-400 transition-colors">Cosmetics</Link>
              </li>
              <li>
                <Link to="/shop?category=Lifestyle" className="hover:text-cyan-400 transition-colors">Lifestyle Essentials</Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-cyan-400 transition-colors">Official Brands</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h5 className="font-heading text-base font-bold text-white uppercase tracking-wider text-xs">
              Customer Care
            </h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors">About HAVEITALL</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact & Support</Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-cyan-400 transition-colors">Shipping & Returns</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
              </li>
              <li className="pt-1 border-t border-slate-800">
                <Link to="/vendor/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sell as Vendor</Link>
              </li>
              <li>
                <Link to="/dropshipper/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">Join Dropshipper Network</Link>
              </li>
            </ul>
          </div>

          {/* Studio & Contact */}
          <div className="space-y-3">
            <h5 className="font-heading text-base font-bold text-white uppercase tracking-wider text-xs">
              Studio Location
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white">{settings.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{settings.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} HAVEITALL. All rights reserved. Handcrafted with passion in Sri Lanka.</p>
      </div>
    </footer>
  );
};
