import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  ChevronRight,
  Search,
  X,
  Award
} from 'lucide-react';

export const BrandsPage = () => {
  const { brands = [] } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter brands based on search
  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands;
    const q = searchTerm.toLowerCase();
    return brands.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        (b.origin && b.origin.toLowerCase().includes(q))
    );
  }, [brands, searchTerm]);

  return (
    <div className="min-h-screen bg-[#f8fcfe]">
      {/* Navigation Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">Brands</span>
          </nav>

          <span className="text-xs font-semibold text-slate-400">
            {brands.length} Brands Available
          </span>
        </div>
      </div>

      {/* Main Brands Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header & Quick Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Brands
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select any brand to explore its handcrafted product collection and studio heritage.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brand by name..."
              className="w-full pl-9 pr-8 py-2 text-base sm:text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-cyan-500 shadow-2xs transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Brands Row: 3 in a row on mobile phone, 6-7 on desktop */}
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-3 md:gap-3.5">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.id || brand.name}
                to={`/brand/${encodeURIComponent(brand.name)}`}
                className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 pr-2 sm:pr-3.5 bg-white hover:bg-cyan-50/80 border border-slate-200 hover:border-cyan-400 rounded-full shadow-2xs hover:shadow-xs transition-all duration-200 group min-w-0"
                title={`Visit ${brand.name} section`}
              >
                {/* Round Logo on Leftside */}
                <div className="w-6 h-6 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-cyan-600 text-white font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center rounded-full">
                      {brand?.name ? brand.name.slice(0, 1) : 'B'}
                    </div>
                  )}
                </div>

                {/* Brand Name on Rightside */}
                <span className="font-heading font-bold text-[10px] sm:text-xs md:text-sm text-slate-800 group-hover:text-cyan-700 truncate leading-tight">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3 max-w-md mx-auto shadow-xs">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No brands found</h3>
            <p className="text-xs text-slate-500">
              No brands matched "{searchTerm}". Try another search term.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
            >
              Show All Brands
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
