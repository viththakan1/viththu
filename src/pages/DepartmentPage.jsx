import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { HeroSlider } from '../components/common/HeroSlider';
import { groupBrandsByDepartment } from '../utils/brandCategories';
import {
  Sparkles,
  Zap,
  Shirt,
  Truck,
  Banknote,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Award,
  ChevronRight
} from 'lucide-react';

const DEPARTMENT_CONFIG = {
  Cosmatics: {
    name: 'Cosmatics',
    canonical: 'Cosmatics',
    icon: Sparkles,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: 'text-rose-600',
    title: 'Cosmatics & Beauty Sanctuary',
    subtitle: 'Explore 100% authentic dermatologist-approved skincare, clean cosmetics, and glow-boosting essentials sourced directly from global brands.',
    subcategories: ['All', 'SkinCare', 'LipCare', 'BodyCare', 'HairCare', 'Suppliments']
  },
  Applieances: {
    name: 'Applieances',
    canonical: 'Applieances',
    icon: Zap,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: 'text-amber-600',
    title: 'Smart Beauty Appliances & Electric Care',
    subtitle: 'High-performance salon stylers, ionic hair dryers, sonic toothbrushes, and modern electric beauty tech built for everyday luxury.',
    subcategories: ['All', 'Applieances', 'Hair Styling', 'Oral Care', 'Personal Care']
  },
  Fashion: {
    name: 'Fashion',
    canonical: 'Fashion',
    icon: Shirt,
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    accentColor: 'text-violet-600',
    title: 'Curated Fashion & Lifestyle Elegance',
    subtitle: 'Signature lifestyle accessories, timepieces, luxury handbags, and handpicked fashion statements to elevate your everyday presence.',
    subcategories: ['All', 'Fashion', 'Sarees', 'Jewelleries', 'Watches', 'Lifestyle']
  }
};

const matchesDepartmentProduct = (product, deptKey) => {
  if (!product) return false;
  const pCat = String(product.category || '').toLowerCase().trim();
  const dKey = deptKey.toLowerCase();

  if (dKey === 'cosmatics' || dKey === 'cosmetics') {
    return (
      pCat === 'cosmatics' ||
      pCat === 'cosmetics' ||
      pCat === 'skincare' ||
      pCat === 'lipcare' ||
      pCat === 'bodycare' ||
      pCat === 'haircare' ||
      pCat === 'suppliments' ||
      pCat === 'fragrances'
    );
  }

  if (dKey === 'applieances' || dKey === 'appliances') {
    return (
      pCat === 'applieances' ||
      pCat === 'appliances' ||
      pCat.includes('appliance') ||
      pCat.includes('styler')
    );
  }

  if (dKey === 'fashion') {
    return (
      pCat === 'fashion' ||
      pCat === 'sarees' ||
      pCat === 'jewelleries' ||
      pCat === 'watches' ||
      pCat === 'lifestyle' ||
      pCat === 'clothing'
    );
  }

  return false;
};

export const DepartmentPage = ({ department = 'Cosmatics' }) => {
  const { products = [], brands = [], formatPrice } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Normalize department key: 'Cosmatics' | 'Applieances' | 'Fashion'
  const deptKey = useMemo(() => {
    const raw = String(department || 'Cosmatics').trim().toLowerCase();
    if (raw === 'cosmatics' || raw === 'cosmetics') return 'Cosmatics';
    if (raw === 'applieances' || raw === 'appliances') return 'Applieances';
    if (raw === 'fashion') return 'Fashion';
    return 'Cosmatics';
  }, [department]);

  const config = DEPARTMENT_CONFIG[deptKey] || DEPARTMENT_CONFIG.Cosmatics;
  const DeptIcon = config.icon;

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSubcat, setSelectedSubcat] = useState(searchParams.get('subcat') || 'All');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'All');
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(35000);

  // Sync query params when URL changes
  useEffect(() => {
    const b = searchParams.get('brand');
    setSelectedBrand(b || 'All');
    const s = searchParams.get('subcat');
    setSelectedSubcat(s || 'All');
  }, [searchParams]);

  // Group brands to extract brands specifically belonging to this department
  const brandGroups = useMemo(() => {
    return groupBrandsByDepartment(brands, products);
  }, [brands, products]);

  const deptBrands = useMemo(() => {
    if (deptKey === 'Cosmatics') return brandGroups.cosmatics || [];
    if (deptKey === 'Applieances') return brandGroups.appliances || [];
    if (deptKey === 'Fashion') return brandGroups.fashion || [];
    return [];
  }, [deptKey, brandGroups]);

  // All products belonging to this department
  const departmentProducts = useMemo(() => {
    return products.filter(p => matchesDepartmentProduct(p, deptKey));
  }, [products, deptKey]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return departmentProducts.filter(p => {
      // Search
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matches =
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Subcategory
      if (selectedSubcat !== 'All') {
        const sCat = selectedSubcat.toLowerCase();
        const pCat = String(p.category || '').toLowerCase();
        if (pCat !== sCat) return false;
      }

      // Brand filter
      if (selectedBrand !== 'All') {
        if (String(p.brand || '').toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
      }

      // In Stock
      if (inStockOnly && !p.inStock) {
        return false;
      }

      // Price
      if (p.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      return 0; // featured default
    });
  }, [departmentProducts, searchTerm, selectedSubcat, selectedBrand, inStockOnly, maxPrice, sortBy]);

  const handleBrandClick = (brandName) => {
    const nextBrand = selectedBrand.toLowerCase() === brandName.toLowerCase() ? 'All' : brandName;
    setSelectedBrand(nextBrand);
    const newParams = new URLSearchParams(searchParams);
    if (nextBrand === 'All') {
      newParams.delete('brand');
    } else {
      newParams.set('brand', nextBrand);
    }
    setSearchParams(newParams);
  };

  const handleSubcatClick = (catName) => {
    setSelectedSubcat(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      newParams.delete('subcat');
    } else {
      newParams.set('subcat', catName);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubcat('All');
    setSelectedBrand('All');
    setSortBy('featured');
    setInStockOnly(false);
    setMaxPrice(35000);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-20">
      {/* 1. Dedicated Scroll Image Carousel for This Page */}
      <div>
        <HeroSlider page={config.canonical} />

        {/* Highlights Bar */}
        <section className="w-full bg-white border-y border-slate-200/90 shadow-2xs mt-4 sm:mt-6 py-3.5 sm:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-slate-200">
              <div className="flex items-center justify-center gap-2 sm:gap-3 px-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Islandwide Delivery</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">3-5 days to your doorstep</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-3 px-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Cash on Delivery</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">Pay safely upon receipt</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-3 px-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">100% Authentic</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">Official batch verified</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Department Title & Description Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeColor}`}>
              <DeptIcon className="w-3.5 h-3.5" />
              <span>{config.canonical} Department</span>
            </span>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              {config.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {config.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-300">
              <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                {departmentProducts.length} Total Items Available
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                {deptBrands.length} Verified Brands
              </span>
            </div>
          </div>
        </div>

        {/* Department Brand Pills Carousel */}
        {deptBrands.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Featured {config.canonical} Brands ({deptBrands.length})</span>
              </span>
              <Link
                to={`/brands?dept=${config.canonical}`}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
              >
                <span>View Brand Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => handleBrandClick('All')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedBrand === 'All'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Brands
              </button>

              {deptBrands.map((brand) => {
                const isSelected = selectedBrand.toLowerCase() === brand.name?.toLowerCase();
                return (
                  <button
                    key={brand.id || brand.name}
                    type="button"
                    onClick={() => handleBrandClick(brand.name)}
                    className={`flex items-center gap-1.5 p-1 pr-3 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow-xs border border-cyan-600'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-cyan-700">
                          {brand.name ? brand.name.slice(0, 1) : 'B'}
                        </span>
                      )}
                    </div>
                    <span className="truncate max-w-[120px]">{brand.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Controls: Subcategories, Search, Sort & Stock Toggle */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
          {/* Subcategory Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {config.subcategories.map((subcat) => {
              const isActive = selectedSubcat.toLowerCase() === subcat.toLowerCase();
              return (
                <button
                  key={subcat}
                  type="button"
                  onClick={() => handleSubcatClick(subcat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {subcat}
                </button>
              );
            })}
          </div>

          {/* Search Bar + Sort Dropdown + In-Stock Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
            {/* Search Input */}
            <div className="sm:col-span-6 relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search within ${config.canonical}...`}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>

            {/* In-Stock Toggle */}
            <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span>In Stock Only</span>
              </label>

              {(searchTerm || selectedSubcat !== 'All' || selectedBrand !== 'All' || inStockOnly) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-1.5 text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedBrand !== 'All' || selectedSubcat !== 'All' || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Active Filters:</span>
            {selectedBrand !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 font-bold">
                Brand: {selectedBrand}
                <button onClick={() => handleBrandClick('All')} className="hover:text-cyan-950 font-bold ml-1">✕</button>
              </span>
            )}
            {selectedSubcat !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-bold">
                Category: {selectedSubcat}
                <button onClick={() => handleSubcatClick('All')} className="hover:text-slate-950 font-bold ml-1">✕</button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-amber-950 font-bold ml-1">✕</button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-cyan-700 font-bold hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing {filteredProducts.length} of {departmentProducts.length} Products
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto">
              <DeptIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                No Products Found in {config.canonical}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No items match your selected filters. Try broadening your search or resetting filters to view all products.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

