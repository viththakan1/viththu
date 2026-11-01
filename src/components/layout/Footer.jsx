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
  RotateCcw,
  Store
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
              <p className="text-xs text-slate-400">Pure silk, linen & artisan handloom</p>
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
              Discover elegant outfits, festive bridal designs, and luxury textiles curated for modern Sri Lankan fashion. Handcrafted with precision and delivered with utmost care.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/${(settings?.whatsapp || '+94771354761').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
              <Link
                to="/vendor/login"
                className="px-3 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 text-xs font-semibold transition-colors"
              >
                Vendor Portal
              </Link>
              <Link
                to="/dropshipper/login"
                className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-xs font-semibold transition-colors"
              >
                Dropshipper
              </Link>
              <Link
                to="/admin"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-colors"
              >
                Admin
              </Link>
            </div>
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
                <Link to="/shop?category=Sarees" className="hover:text-cyan-400 transition-colors">Silk Sarees</Link>
              </li>
              <li>
                <Link to="/shop?category=Men's Wear" className="hover:text-cyan-400 transition-colors">Men's Wear</Link>
              </li>
              <li>
                <Link to="/shop?category=Fabrics" className="hover:text-cyan-400 transition-colors">Artisanal Fabrics</Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-cyan-400 transition-colors">Curated Collections</Link>
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
                <Link to="/about" className="hover:text-cyan-400 transition-colors">About AxisX</Link>
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

        {/* Bank of Ceylon Payment Card Note */}
        <div className="mt-10 p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-200">Bank Transfer Details: </span>
              {settings.bankDetails.bank} | A/C: {settings.bankDetails.accountNumber} ({settings.bankDetails.branch})
            </div>
          </div>
          <span className="text-[11px] bg-slate-800 text-cyan-300 px-3 py-1 rounded-full font-mono">
            HAVEITALL (Pvt) Ltd
          </span>
        </div>
      </div>

      {/* Copyright & Partner Access Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} HAVEITALL. All rights reserved. Handcrafted with passion in Sri Lanka.</p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/vendor/login"
            className="px-3 py-1.5 rounded-xl bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            <span>Vendor</span>
          </Link>
          <Link
            to="/dropshipper/login"
            className="px-3 py-1.5 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dropship</span>
          </Link>
          <Link
            to="/admin"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
