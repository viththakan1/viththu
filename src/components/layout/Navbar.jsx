import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { LiveSearchBar } from '../common/LiveSearchBar';
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Store,
  Truck
} from 'lucide-react';

export const Navbar = () => {
  const {
    cartCount,
    wishlist,
    setIsCartOpen,
    settings,
    brands = []
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandsDropdownOpen, setBrandsDropdownOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Brands', path: '/brands' },
    { name: 'Collections', path: '/collections' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
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
                if (link.name === 'Brands') {
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

                      {/* Brands Dropdown Mega Panel: 6-7 brands per row, full curved, round logo left + name right */}
                      {brandsDropdownOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="w-[85vw] max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                Featured Brands
                              </span>
                              <Link
                                to="/brands"
                                onClick={() => setBrandsDropdownOpen(false)}
                                className="text-xs font-semibold text-slate-500 hover:text-cyan-700 flex items-center gap-1"
                              >
                                <span>All Brands Directory</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-2.5">
                              {brands.map((brand) => (
                                <Link
                                  key={brand.id || brand.name}
                                  to={`/brand/${encodeURIComponent(brand.name)}`}
                                  onClick={() => setBrandsDropdownOpen(false)}
                                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 pr-2 sm:pr-3 bg-slate-50/80 hover:bg-cyan-50/80 border border-slate-200/90 hover:border-cyan-400 rounded-full shadow-2xs hover:shadow-xs transition-all duration-150 group min-w-0"
                                  title={`Visit ${brand.name} section`}
                                >
                                  {/* Round Logo on Leftside */}
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                                    {brand.logo ? (
                                      <img
                                        src={brand.logo}
                                        alt={brand.name}
                                        className="w-full h-full object-cover rounded-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-cyan-600 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center rounded-full">
                                        {brand.name.slice(0, 1)}
                                      </div>
                                    )}
                                  </div>

                                  {/* Brand Name on Writeside */}
                                  <span className="font-heading font-bold text-[10px] sm:text-xs text-slate-800 group-hover:text-cyan-800 truncate leading-tight">
                                    {brand.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
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
              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-colors relative"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

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
              if (link.name === 'Brands') {
                return (
                  <div key={link.path} className="space-y-1.5 py-1">
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm font-semibold ${
                        isActive(link.path)
                          ? 'text-cyan-700 bg-cyan-50 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <span className="text-[10px] text-cyan-700 font-bold bg-cyan-100/70 px-2 py-0.5 rounded-full">
                        {brands.length} Brands
                      </span>
                    </Link>

                    {/* Mobile Brand Pills: 3 brands in a row on mobile phone */}
                    <div className="grid grid-cols-3 gap-1.5 px-1 py-1">
                      {brands.map((brand) => (
                        <Link
                          key={brand.id || brand.name}
                          to={`/brand/${encodeURIComponent(brand.name)}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-1.5 p-1 pr-1.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 rounded-full shadow-2xs min-w-0"
                        >
                          <div className="w-6 h-6 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                            {brand.logo ? (
                              <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <div className="w-full h-full bg-cyan-600 text-white font-bold text-[9px] flex items-center justify-center rounded-full">
                                {brand.name.slice(0, 1)}
                              </div>
                            )}
                          </div>
                          <span className="font-bold text-[10px] text-slate-800 truncate leading-tight">
                            {brand.name}
                          </span>
                        </Link>
                      ))}
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

            <div className="pt-3 border-t border-slate-100 space-y-2">
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
