import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  ChevronRight,
  Search,
  X,
  Award,
  Sparkles,
  Zap,
  Shirt
} from 'lucide-react';
import { groupBrandsByDepartment } from '../utils/brandCategories';

export const BrandsPage = () => {
  const { brands = [], products = [] } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('dept') || 'all');

  useEffect(() => {
    const dept = searchParams.get('dept');
    if (dept) {
      setSelectedDept(dept);
    } else {
      setSelectedDept('all');
    }
  }, [searchParams]);

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    const newParams = new URLSearchParams(searchParams);
    if (dept === 'all') {
      newParams.delete('dept');
    } else {
      newParams.set('dept', dept);
    }
    setSearchParams(newParams);
  };

  // Group brands into Cosmatics, Applieances, and Fashion
  const brandGroups = useMemo(() => {
    return groupBrandsByDepartment(brands, products);
  }, [brands, products]);

  // Filter helper for search query
  const filterBySearch = (list) => {
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase().trim();
    return list.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        (b.origin && b.origin.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  };

  const filteredAll = useMemo(() => filterBySearch(brands), [brands, searchTerm]);
  const filteredCosmatics = useMemo(() => filterBySearch(brandGroups.cosmatics), [brandGroups.cosmatics, searchTerm]);
  const filteredAppliances = useMemo(() => filterBySearch(brandGroups.appliances), [brandGroups.appliances, searchTerm]);
  const filteredFashion = useMemo(() => filterBySearch(brandGroups.fashion), [brandGroups.fashion, searchTerm]);

  // Reusable brand grid component
  const renderBrandGrid = (brandList, emptyMessage) => {
    if (brandList.length === 0) {
      return (
        <div className="py-6 px-4 bg-slate-50/70 rounded-2xl border border-slate-200/60 text-center text-xs text-slate-400 italic">
          {emptyMessage || 'No brands available in this section'}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-3 md:gap-3.5">
        {brandList.map((brand) => (
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
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fcfe]">
      {/* Navigation Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">Brands</span>
            {selectedDept !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-cyan-700 font-bold capitalize">{selectedDept}</span>
              </>
            )}
          </nav>

          <span className="text-xs font-semibold text-slate-400">
            {brands.length} Total Brands Available
          </span>
        </div>
      </div>

      {/* Main Brands Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header & Quick Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Official Brands
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore authentic brands across Cosmatics, Applieances, and Fashion with 100% genuine guarantee.
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => handleSelectDept('all')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedDept === 'all'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            }`}
          >
            All Brands ({filteredAll.length})
          </button>

          <button
            type="button"
            onClick={() => handleSelectDept('cosmatics')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedDept === 'cosmatics'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/80 shadow-2xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Cosmatics</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedDept === 'cosmatics' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'}`}>
              {filteredCosmatics.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDept('appliances')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedDept === 'appliances'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 shadow-2xs'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Applieances</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedDept === 'appliances' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
              {filteredAppliances.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDept('fashion')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedDept === 'fashion'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/80 shadow-2xs'
            }`}
          >
            <Shirt className="w-3.5 h-3.5 text-amber-400" />
            <span>Fashion</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedDept === 'fashion' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
              {filteredFashion.length}
            </span>
          </button>
        </div>

        {/* Content Showcase */}
        {filteredAll.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3 max-w-md mx-auto shadow-xs">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No brands found</h3>
            <p className="text-xs text-slate-500">
              No brands matched "{searchTerm}". Try another search term.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                handleSelectDept('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
            >
              Show All Brands
            </button>
          </div>
        ) : selectedDept === 'all' && !searchTerm ? (
          /* Separate Sectioned Views when All is Active */
          <div className="space-y-12">
            {/* 1. Cosmatics Section */}
            <div className="space-y-4 bg-gradient-to-br from-rose-50/40 via-white to-white p-5 sm:p-7 rounded-3xl border border-rose-100/80 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                      Cosmatics Brands
                    </h2>
                    <p className="text-xs text-slate-500">
                      Verified skincare, cosmetics, beauty actives, and daily personal care
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectDept('cosmatics')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                >
                  View All ({filteredCosmatics.length}) &rarr;
                </button>
              </div>
              {renderBrandGrid(filteredCosmatics, 'No cosmetics brands available currently')}
            </div>

            {/* 2. Applieances Section */}
            <div className="space-y-4 bg-gradient-to-br from-indigo-50/40 via-white to-white p-5 sm:p-7 rounded-3xl border border-indigo-100/80 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                      Applieances Brands
                    </h2>
                    <p className="text-xs text-slate-500">
                      Smart beauty technology, electric styling tools, and electronic appliances
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectDept('appliances')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  View All ({filteredAppliances.length}) &rarr;
                </button>
              </div>
              {renderBrandGrid(filteredAppliances, 'No appliance brands available currently')}
            </div>

            {/* 3. Fashion Section */}
            <div className="space-y-4 bg-gradient-to-br from-amber-50/40 via-white to-white p-5 sm:p-7 rounded-3xl border border-amber-100/80 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                      Fashion Brands
                    </h2>
                    <p className="text-xs text-slate-500">
                      Jewelry, timepieces, lifestyle wear, bags & designer fashion
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectDept('fashion')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  View All ({filteredFashion.length}) &rarr;
                </button>
              </div>
              {renderBrandGrid(filteredFashion, 'No fashion brands available currently')}
            </div>
          </div>
        ) : selectedDept === 'cosmatics' ? (
          /* Single Cosmatics View */
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Showing {filteredCosmatics.length} Cosmatics Brands
              </span>
            </div>
            {renderBrandGrid(filteredCosmatics)}
          </div>
        ) : selectedDept === 'appliances' ? (
          /* Single Appliances View */
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Showing {filteredAppliances.length} Applieances Brands
              </span>
            </div>
            {renderBrandGrid(filteredAppliances)}
          </div>
        ) : selectedDept === 'fashion' ? (
          /* Single Fashion View */
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <Shirt className="w-4 h-4" />
                Showing {filteredFashion.length} Fashion Brands
              </span>
            </div>
            {renderBrandGrid(filteredFashion)}
          </div>
        ) : (
          /* Filtered search across all */
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">
                Search Results ({filteredAll.length} brands)
              </span>
            </div>
            {renderBrandGrid(filteredAll)}
          </div>
        )}
      </main>
    </div>
  );
};
