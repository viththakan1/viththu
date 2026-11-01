import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export const VendorLayout = () => {
  const { currentVendor, vendorLogout, formatPrice } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentVendor) {
      navigate('/vendor/login', { replace: true });
    }
  }, [currentVendor, navigate]);

  if (!currentVendor) return null;

  const handleLogout = () => {
    vendorLogout();
    navigate('/vendor/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/vendor', icon: <TrendingUp className="w-4 h-4" /> },
    { name: 'My Products', path: '/vendor/products', icon: <Package className="w-4 h-4" /> },
    { name: 'Orders & Shipments', path: '/vendor/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Earnings & Payouts', path: '/vendor/payouts', icon: <DollarSign className="w-4 h-4" /> },
    { name: 'Store Profile', path: '/vendor/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const isActive = (path) => {
    if (path === '/vendor') return location.pathname === '/vendor';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        {/* Brand / Vendor Info Header */}
        <div className="p-6 border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              {currentVendor.logo ? (
                <img src={currentVendor.logo} alt={currentVendor.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                currentVendor.name.slice(0, 1)
              )}
            </div>
            <div className="min-w-0">
              <span className="font-heading text-sm font-bold text-white block truncate leading-tight">
                {currentVendor.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-medium">
                <UserCheck className="w-3 h-3" />
                <span>Verified Seller</span>
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Payable Balance:</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatPrice(currentVendor.balance || 0)}
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
                  ? 'bg-indigo-600 text-white shadow-md'
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
              <Store className="w-4 h-4 text-cyan-400" />
              <span>Visit Marketplace</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Seller Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">Vendor Studio</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{location.pathname.replace('/vendor', '').replace('/', '') || 'Overview'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[11px]">
              Commission: {currentVendor.commissionRate || 15}%
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

