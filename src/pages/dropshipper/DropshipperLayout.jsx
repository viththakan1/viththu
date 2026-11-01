import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  Truck,
  Package,
  ShoppingBag,
  Wallet,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  Store
} from 'lucide-react';

export const DropshipperLayout = () => {
  const { currentDropshipper, dropshipperLogout, formatPrice } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentDropshipper) {
      navigate('/dropshipper/login', { replace: true });
    }
  }, [currentDropshipper, navigate]);

  if (!currentDropshipper) return null;

  const handleLogout = () => {
    dropshipperLogout();
    navigate('/dropshipper/login');
  };

  const navItems = [
    { name: 'Wholesale Catalog', path: '/dropshipper', icon: <Package className="w-4 h-4" /> },
    { name: 'My Dropship Orders', path: '/dropshipper/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Wallet & Payouts', path: '/dropshipper/wallet', icon: <Wallet className="w-4 h-4" /> },
    { name: 'Branding Settings', path: '/dropshipper/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const isActive = (path) => {
    if (path === '/dropshipper') return location.pathname === '/dropshipper';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="font-heading text-sm font-bold text-white block truncate leading-tight">
                {currentDropshipper.storeName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>{currentDropshipper.name}</span>
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Wallet Profit:</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatPrice(currentDropshipper.walletBalance || 0)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive(item.path)
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Customer Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Reseller Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">Dropshipper Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{location.pathname.replace('/dropshipper', '').replace('/', '') || 'Catalog'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
              <Percent className="w-3 h-3 text-emerald-600" />
              <span>{currentDropshipper.tier || `${currentDropshipper.discountPercentage || 20}% Wholesale Discount`}</span>
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

