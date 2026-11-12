import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { LiveSearchBar } from '../common/LiveSearchBar';
import { groupBrandsByDepartment } from '../../utils/brandCategories';
import {
  ShoppingBag,
  Menu,
  X,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Zap,
  Shirt,
  ChevronDown,
  ChevronRight,
  Store,
  Truck,
  User,
  Package,
  LogOut
} from 'lucide-react';

export const Navbar = () => {
  const {
    cartCount,
    setIsCartOpen,
    settings,
    brands = [],
    products = [],
    currentCustomer,
    customerLogout
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandsDropdownOpen, setBrandsDropdownOpen] = useState(false);
  const [activeBrandDept, setActiveBrandDept] = useState('all');
  const [mobileBrandDept, setMobileBrandDept] = useState('all');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const location = useLocation();

  const brandGroups = useMemo(() => {
    return groupBrandsByDepartment(brands, products);
  }, [brands, products]);

  const renderBrandPill = (brand) => (
    <Link
      key={brand.id || brand.name}
      to={`/brand/${encodeURIComponent(brand.name)}`}
      onClick={() => setBrandsDropdownOpen(false)}
      className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 pr-2 sm:pr-3 bg-slate-50/80 hover:bg-cyan-50/80 border border-slate-200/90 hover:border-cyan-400 rounded-full shadow-2xs hover:shadow-xs transition-all duration-150 group min-w-0"
      title={`Visit ${brand.name} section`}
    >
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-cyan-600 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center rounded-full">
            {brand.name ? brand.name.slice(0, 1) : 'B'}
          </div>
        )}
      </div>
      <span className="font-heading font-bold text-[10px] sm:text-xs text-slate-800 group-hover:text-cyan-800 truncate leading-tight">
        {brand.name}
      </span>
    </Link>
  );

  const renderMobileBrandPill = (brand) => (
    <Link
      key={brand.id || brand.name}
      to={`/brand/${encodeURIComponent(brand.name)}`}
      onClick={() => setMobileMenuOpen(false)}
      className="flex items-center gap-1.5 p-1 pr-1.5 bg-white hover:bg-cyan-50 border border-slate-200 rounded-full shadow-2xs min-w-0"
    >
      <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
        {brand.logo ? (
          <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <div className="w-full h-full bg-cyan-600 text-white font-bold text-[9px] flex items-center justify-center rounded-full">
            {brand.name ? brand.name.slice(0, 1) : 'B'}
          </div>
        )}
      </div>
      <span className="font-bold text-[10px] text-slate-800 truncate leading-tight">
        {brand.name}
      </span>
    </Link>
  );

  const isCustomerLoggedIn = Boolean(currentCustomer && typeof currentCustomer === 'object' && currentCustomer.id);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Cosmatics', path: '/cosmatics' },
    { name: 'Applieances', path: '/appliances' },
    { name: 'Fashion', path: '/fashion' },
    { name: 'Brand', path: '/brands' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' && (!location.search || location.search === '');
    }
    const currentPath = location.pathname.toLowerCase();
    const targetPath = path.toLowerCase();

    if (targetPath === '/cosmatics' || targetPath === '/cosmetics') {
      if (currentPath === '/cosmatics' || currentPath === '/cosmetics') return true;
      if (currentPath === '/shop') {
        const cat = new URLSearchParams(location.search).get('category')?.toLowerCase();
        if (cat === 'cosmatics' || cat === 'cosmetics') return true;
      }
    }

    if (targetPath === '/appliances' || targetPath === '/applieances') {
      if (currentPath === '/appliances' || currentPath === '/applieances') return true;
      if (currentPath === '/shop') {
        const cat = new URLSearchParams(location.search).get('category')?.toLowerCase();
        if (cat === 'appliances' || cat === 'applieances') return true;
      }
    }

    if (targetPath === '/fashion') {
      if (currentPath === '/fashion') return true;
      if (currentPath === '/shop') {
        const cat = new URLSearchParams(location.search).get('category')?.toLowerCase();
        if (cat === 'fashion') return true;
      }
    }

    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-teal-900 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 text-cyan-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Islandwide Delivery Across Sri Lanka (3-5 Days)</span>
        </span>
        <span className="hidden md:inline text-cyan-400">|</span>
        <span className="hidden md:flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp Quick Orders: <a href={`https://wa.me/${(settings?.whatsapp || '+94771354761').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="underline hover:text-emerald-300">{settings?.whatsapp || '+94 77 135 4761'}</a></span>
        </span>
        <span className="hidden lg:inline text-cyan-400">|</span>
        <span className="hidden lg:inline text-amber-200">Free delivery on orders over LKR 5,000</span>
      </div>

      {/* Main Navigation Bar */}
      <nav className="glass-nav bg-white/95 backdrop-blur-md border-b border-cyan-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22 gap-2 sm:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              {/* Large Logo Symbol */}
              <img
                src="/haveitall-logo.png"
                alt="HAVEITALL Logo"
                className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Website Name */}
              <div className="flex flex-col">
                <span className="font-heading text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-cyan-700 transition-colors uppercase leading-tight">
                  HAVE<span className="text-cyan-600">ITALL</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">
                  Beauty and Lifestyle
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 shrink-0">
              {navLinks.map((link) => {
                if (link.name === 'Brand' || link.name === 'Brands') {
                  return (
                    <div
                      key={link.path}
                      className="relative"
                      onMouseEnter={() => setBrandsDropdownOpen(true)}
                      onMouseLeave={() => setBrandsDropdownOpen(false)}
                    >
                      <Link
                        to={link.path}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-1 ${
                          isActive(link.path)
                            ? 'text-cyan-700 bg-cyan-50/80 font-bold'
                            : 'text-slate-600 hover:text-cyan-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${brandsDropdownOpen ? 'rotate-180 text-cyan-600' : 'text-slate-400'}`} />
                      </Link>

                      {/* Brands Dropdown Mega Panel: Separately displays Cosmatics, Applieances, Fashion */}
                      {brandsDropdownOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="w-[88vw] max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-5 space-y-4 max-h-[82vh] overflow-y-auto">
                            {/* Header with Department Quick-Filters & Directory Link */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                                  Browse by:
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setActiveBrandDept('all');
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    activeBrandDept === 'all'
                                      ? 'bg-cyan-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
                                  }`}
                                >
                                  All Brands ({brands.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setActiveBrandDept('cosmatics');
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    activeBrandDept === 'cosmatics'
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  }`}
                                >
                                  <span>💄 Cosmatics</span>
                                  <span className="text-[10px] opacity-80">({brandGroups.cosmatics.length})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setActiveBrandDept('appliances');
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    activeBrandDept === 'appliances'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  }`}
                                >
                                  <span>⚡ Applieances</span>
                                  <span className="text-[10px] opacity-80">({brandGroups.appliances.length})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setActiveBrandDept('fashion');
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    activeBrandDept === 'fashion'
                                      ? 'bg-violet-600 text-white shadow-xs'
                                      : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                                  }`}
                                >
                                  <span>👗 Fashion</span>
                                  <span className="text-[10px] opacity-80">({brandGroups.fashion.length})</span>
                                </button>
                              </div>

                              <Link
                                to="/brands"
                                onClick={() => setBrandsDropdownOpen(false)}
                                className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 group"
                              >
                                <span>All Brands Directory</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>

                            {/* Sectioned Display */}
                            {activeBrandDept === 'all' ? (
                              <div className="space-y-4">
                                {/* 1. Cosmatics Brands */}
                                {brandGroups.cosmatics.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                                        <span>Cosmatics Brands</span>
                                        <span className="text-[11px] text-slate-400 font-normal">({brandGroups.cosmatics.length})</span>
                                      </h4>
                                      <Link
                                        to="/cosmatics"
                                        onClick={() => setBrandsDropdownOpen(false)}
                                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                                      >
                                        Explore Cosmatics &rarr;
                                      </Link>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                      {brandGroups.cosmatics.map(renderBrandPill)}
                                    </div>
                                  </div>
                                )}

                                {/* 2. Applieances Brands */}
                                {brandGroups.appliances.length > 0 && (
                                  <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Applieances Brands</span>
                                        <span className="text-[11px] text-slate-400 font-normal">({brandGroups.appliances.length})</span>
                                      </h4>
                                      <Link
                                        to="/appliances"
                                        onClick={() => setBrandsDropdownOpen(false)}
                                        className="text-[11px] font-semibold text-amber-600 hover:underline"
                                      >
                                        Explore Applieances &rarr;
                                      </Link>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                      {brandGroups.appliances.map(renderBrandPill)}
                                    </div>
                                  </div>
                                )}

                                {/* 3. Fashion Brands */}
                                {brandGroups.fashion.length > 0 && (
                                  <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Shirt className="w-3.5 h-3.5 text-violet-500" />
                                        <span>Fashion Brands</span>
                                        <span className="text-[11px] text-slate-400 font-normal">({brandGroups.fashion.length})</span>
                                      </h4>
                                      <Link
                                        to="/fashion"
                                        onClick={() => setBrandsDropdownOpen(false)}
                                        className="text-[11px] font-semibold text-violet-600 hover:underline"
                                      >
                                        Explore Fashion &rarr;
                                      </Link>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                      {brandGroups.fashion.map(renderBrandPill)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Filtered Department Grid */
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    {activeBrandDept === 'cosmatics' && '💄 Cosmatics Brands'}
                                    {activeBrandDept === 'appliances' && '⚡ Applieances Brands'}
                                    {activeBrandDept === 'fashion' && '👗 Fashion Brands'}
                                    <span className="text-[11px] text-slate-400 font-normal ml-1.5">
                                      ({(brandGroups[activeBrandDept] || []).length} brands)
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setActiveBrandDept('all')}
                                    className="text-[11px] font-semibold text-cyan-700 hover:underline cursor-pointer"
                                  >
                                    Show All Departments
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                  {(brandGroups[activeBrandDept] || []).map(renderBrandPill)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      isActive(link.path)
                        ? 'text-cyan-700 bg-cyan-50/80 font-bold'
                        : 'text-slate-600 hover:text-cyan-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Nykaa-style Live Search Bar (Desktop / Tablet) */}
            <div className="hidden sm:block flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-1 lg:mx-3">
              <LiveSearchBar />
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Customer Account Trigger */}
              {isCustomerLoggedIn ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                    className="p-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Customer Account"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-600 to-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      {currentCustomer?.name ? String(currentCustomer.name).charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:inline text-xs font-bold truncate max-w-[85px]">
                      {currentCustomer?.name ? String(currentCustomer.name).split(' ')[0] : 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:inline" />
                  </button>

                  {/* Account Dropdown */}
                  {customerDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                      onMouseLeave={() => setCustomerDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentCustomer?.name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentCustomer?.email || ''}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setCustomerDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-cyan-50/70 hover:text-cyan-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-cyan-600" />
                        <span>My Profile & Address</span>
                      </Link>

                      <Link
                        to="/profile?tab=orders"
                        onClick={() => setCustomerDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-cyan-50/70 hover:text-cyan-800 transition-colors"
                      >
                        <Package className="w-4 h-4 text-cyan-600" />
                        <span>My Orders & Tracking</span>
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerDropdownOpen(false);
                            customerLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-1.5 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:text-cyan-700 hover:bg-slate-100/90 transition-colors flex items-center gap-1.5"
                  title="Sign In / Register"
                >
                  <User className="w-5 h-5 text-slate-600" />
                  <span className="hidden md:inline text-xs font-bold">Sign In</span>
                </Link>
              )}

              {/* Cart / Bag Trigger: Navigates to dedicated /cart page on desktop */}
              <Link
                to="/cart"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    e.preventDefault();
                    setIsCartOpen(true);
                  }
                }}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 transition-colors flex items-center gap-2 relative shadow-xs"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 text-cyan-700" />
                {cartCount > 0 && (
                  <span className="bg-cyan-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none">
                    {cartCount}
                  </span>
                )}
                <span className="hidden sm:inline text-xs font-bold text-cyan-900">Bag</span>
              </Link>

              {/* Mobile menu toggle button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu with embedded Live Search Bar */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
            {/* Search bar inside mobile menu */}
            <div className="pb-2.5 pt-1 border-b border-slate-100">
              <LiveSearchBar isMobile={true} onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>

            {navLinks.map((link) => {
              if (link.name === 'Brand' || link.name === 'Brands') {
                const currentMobileList = mobileBrandDept === 'all'
                  ? brands
                  : (brandGroups[mobileBrandDept] || []);

                return (
                  <div key={link.path} className="space-y-2 py-1 bg-slate-50/60 p-2.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-sm font-bold flex items-center gap-1.5 ${
                          isActive(link.path) ? 'text-cyan-700' : 'text-slate-800'
                        }`}
                      >
                        <span>{link.name}</span>
                        <span className="text-[10px] text-cyan-700 font-bold bg-cyan-100/70 px-2 py-0.5 rounded-full">
                          {brands.length} Total
                        </span>
                      </Link>
                      <Link
                        to="/brands"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[11px] font-semibold text-cyan-600 flex items-center"
                      >
                        <span>View directory</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Department Switcher Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                      <button
                        type="button"
                        onClick={() => setMobileBrandDept('all')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors ${
                          mobileBrandDept === 'all'
                            ? 'bg-cyan-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        All ({brands.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileBrandDept('cosmatics')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 ${
                          mobileBrandDept === 'cosmatics'
                            ? 'bg-rose-500 text-white shadow-2xs'
                            : 'bg-white text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span>💄 Cosmatics</span>
                        <span className="opacity-80">({brandGroups.cosmatics.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileBrandDept('appliances')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 ${
                          mobileBrandDept === 'appliances'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-white text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span>⚡ Applieances</span>
                        <span className="opacity-80">({brandGroups.appliances.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileBrandDept('fashion')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 ${
                          mobileBrandDept === 'fashion'
                            ? 'bg-violet-600 text-white shadow-2xs'
                            : 'bg-white text-violet-700 border border-violet-200'
                        }`}
                      >
                        <span>👗 Fashion</span>
                        <span className="opacity-80">({brandGroups.fashion.length})</span>
                      </button>
                    </div>

                    {/* Mobile Brand Pills: 3 brands in a row */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {currentMobileList.map(renderMobileBrandPill)}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive(link.path)
                      ? 'text-cyan-700 bg-cyan-50 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile Customer Account Section */}
            <div className="pt-2 border-t border-slate-100">
              {isCustomerLoggedIn ? (
                <div className="p-3 bg-cyan-50/60 rounded-2xl border border-cyan-100/80 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {currentCustomer?.name ? String(currentCustomer.name).charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentCustomer?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentCustomer?.email || ''}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-1 border border-slate-200/60 shadow-2xs"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-1 border border-slate-200/60 shadow-2xs"
                    >
                      <Package className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Orders</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      customerLogout();
                    }}
                    className="w-full text-center text-xs font-bold text-rose-600 hover:text-rose-700 pt-1 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-xs"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Customer Sign In / Register</span>
                </Link>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <a
                href={`https://wa.me/${(settings?.whatsapp || '+94771354761').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
