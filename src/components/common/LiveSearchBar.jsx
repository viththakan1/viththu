import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { getProductPath } from '../../utils/productUrl';
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Award,
  ShoppingBag
} from 'lucide-react';

export const LiveSearchBar = ({ className = '', isMobile = false, onCloseMobile }) => {
  const { products = [], brands = [], formatPrice } = useStore();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Close search and reset state
  const handleCloseSearch = () => {
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
    onCloseMobile?.();
  };

  // Close dropdown on click / touch outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Keyboard shortcut Ctrl+K / ⌘K and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        handleCloseSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Matching brands only (exclusive to Brands)
  const matchingBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    const seen = new Set();
    const brandList = [];

    // Add registered brands from context
    (brands || []).forEach((b) => {
      if (b?.name && !seen.has(b.name.toLowerCase())) {
        seen.add(b.name.toLowerCase());
        brandList.push(b);
      }
    });

    // Also include any brands found in products that might not be registered
    (products || []).forEach((p) => {
      if (p?.brand && !seen.has(p.brand.toLowerCase())) {
        seen.add(p.brand.toLowerCase());
        brandList.push({
          id: `brand-${p.brand.toLowerCase().replace(/\s+/g, '-')}`,
          name: p.brand,
          logo: '',
          origin: '',
          description: ''
        });
      }
    });

    if (!q) {
      return brandList.slice(0, 6);
    }

    return brandList.filter((b) =>
      b.name.toLowerCase().includes(q) ||
      (b.origin && b.origin.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query, brands, products]);

  // Live filter products only (exclusive to Products)
  const liveResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Show featured / top products when query is empty
      return products.filter((p) => p.featured || p.badge).slice(0, 6);
    }
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.fabric && p.fabric.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query, products]);

  // Count products for each brand
  const getBrandCount = (brandName) => {
    if (!brandName) return 0;
    return products.filter((p) => p.brand?.toLowerCase() === brandName.toLowerCase()).length;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    onCloseMobile?.();
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  // Click brand -> navigate to that brand page section
  const handleSelectBrand = (brandName) => {
    setIsOpen(false);
    onCloseMobile?.();
    navigate(`/brand/${encodeURIComponent(brandName)}`);
  };

  // Click product -> navigate to specific product section / detail page using product name
  const handleSelectProduct = (product) => {
    setIsOpen(false);
    onCloseMobile?.();
    navigate(getProductPath(product));
  };

  return (
    <>
      {/* Backdrop overlay to exit live search on click / touch anywhere outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] transition-opacity"
          onClick={handleCloseSearch}
          aria-hidden="true"
        />
      )}

      <div ref={containerRef} className={`relative ${isOpen ? 'z-50' : 'z-20'} ${className}`}>
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none transition-colors" />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              placeholder="Search brands and products..."
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder:text-slate-400 pl-10 pr-10 py-2 sm:py-2.5 rounded-full border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 focus:outline-none text-base sm:text-sm font-medium transition-all shadow-2xs"
            />

            <div className="absolute right-2.5 flex items-center gap-1">
              {isOpen && (
                <button
                  type="button"
                  onClick={handleCloseSearch}
                  className="p-1 sm:p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200/80 transition-colors flex items-center justify-center cursor-pointer"
                  title="Close and exit search (Esc)"
                  aria-label="Close and exit search"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Exclusively Brands & Products Search Dropdown */}
        {isOpen && (
          <div className="absolute left-0 sm:left-auto right-0 sm:-right-8 lg:right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[580px] lg:w-[680px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header pill indicator with prominent Close Button */}
            <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 via-cyan-50/40 to-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                {query ? `Search results for "${query}"` : 'Explore Brands & Products'}
              </span>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[10px] text-slate-400">Click a brand or product to open</span>
                <button
                  type="button"
                  onClick={handleCloseSearch}
                  className="px-2 py-1 rounded-lg hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 font-bold text-xs cursor-pointer bg-white border border-slate-200/80 shadow-2xs"
                  title="Exit live search"
                  aria-label="Exit live search"
                >
                  <span>Close</span>
                  <X className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>

          {/* 2-Column Layout: Brands (Left) & Products (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[460px] overflow-y-auto">
            {/* Left Column: BRANDS ONLY */}
            <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/70 p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Brands ({matchingBrands.length})</span>
                </p>
                <span className="text-[10px] font-semibold text-cyan-700">Brand Page</span>
              </div>

              {matchingBrands.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No brands matching "{query}"
                </div>
              ) : (
                <div className="space-y-1.5">
                  {matchingBrands.map((brand) => {
                    const count = getBrandCount(brand.name);
                    return (
                      <button
                        key={brand.id || brand.name}
                        type="button"
                        onClick={() => handleSelectBrand(brand.name)}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-cyan-50/80 border border-slate-200/60 hover:border-cyan-200 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                            {brand.logo ? (
                              <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-cyan-100 text-cyan-800 text-[11px] font-bold">
                                {brand.name.slice(0, 1)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="truncate block font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
                              {brand.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal block leading-tight">
                              {count} {count === 1 ? 'product' : 'products'}
                              {brand.origin ? ` • ${brand.origin.split(',')[0]}` : ''}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: PRODUCTS ONLY */}
            <div className="md:col-span-7 p-3.5 bg-white">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{query ? `Products (${liveResults.length})` : 'Featured Products'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-[11px] text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-0.5"
                >
                  <span>See all in shop</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {liveResults.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">No products matching "{query}"</p>
                  <p className="text-[11px] text-slate-400">
                    Try searching by brand name, product name, or category.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {liveResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="group p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Thumbnail */}
                        <div className="relative w-12 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Product details */}
                        <div className="min-w-0">
                          {product.brand && (
                            <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block leading-tight">
                              {product.brand}
                            </span>
                          )}
                          <p className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors truncate leading-snug">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-slate-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.oldPrice && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatPrice(product.oldPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right tag / action */}
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {product.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {product.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-400 group-hover:text-cyan-600 flex items-center gap-0.5">
                          <span>View</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              100% authentic global skincare & beauty brands
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 group"
            >
              <span>Explore full catalog</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
