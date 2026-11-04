import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  ShoppingBag,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  Store,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Bell,
  Building,
  Truck
} from 'lucide-react';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { messages, orders, settings, vendors, dropshippers, backendConnected } = useStore();

  const isAuth = localStorage.getItem('admin-demo-auth') === 'ok';

  useEffect(() => {
    if (!isAuth) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuth, navigate]);

  if (!isAuth) return null;

  const handleLogout = () => {
    localStorage.removeItem('admin-demo-auth');
    localStorage.removeItem('admin-demo-gate');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Products', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { name: 'Categories', path: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
    { name: 'Brands', path: '/admin/brands', icon: <Award className="w-4 h-4" /> },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: orders.filter(o => o.status === 'Payment Review' || o.status === 'Processing').length
    },
    {
      name: 'Vendors',
      path: '/admin/vendors',
      icon: <Building className="w-4 h-4" />,
      badge: vendors.filter(v => v.status === 'Pending').length
    },
    {
      name: 'Dropshippers',
      path: '/admin/dropshippers',
      icon: <Truck className="w-4 h-4" />,
      badge: dropshippers.filter(d => d.status === 'Pending').length
    },
    { name: 'Scroll Images', path: '/admin/banners', icon: <ImageIcon className="w-4 h-4" /> },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: messages.filter(m => !m.read).length
    },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
              <img
                src="/haveitall-logo.png"
                alt="HAVEITALL"
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div>
              <span className="font-heading text-lg font-black text-white leading-none block uppercase">
                HAVE<span className="text-cyan-400">ITALL</span>
              </span>
              <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-semibold">
                Admin Control
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive(item.path)
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive(item.path) ? 'bg-white text-cyan-800' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Store className="w-4 h-4 text-cyan-400" />
            <span>Storefront Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Studio</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">HAVEITALL Management</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{location.pathname.replace('/admin', '').replace('/', '') || 'Overview'}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
              backendConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-medium">{backendConnected ? 'MongoDB Atlas Live' : 'Connecting to Atlas...'}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium">Store Live</span>
            </div>

            <Link
              to="/"
              className="text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>View Live Store</span>
            </Link>
          </div>
        </header>

        {/* Outlet for Admin Views */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
