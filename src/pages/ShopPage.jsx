import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/ProductSkeleton';
import { SEO } from '../components/common/SEO';
import { toSlug, getCategoryPath } from '../utils/productUrl';
import {
  matchesSubcategory,
  matchesDepartmentProduct,
  normalizeDepartmentKey
} from '../utils/departmentCategories';
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  RotateCcw,
  Check
} from 'lucide-react';

const matchesCategory = (product, selectedCat) => {
  if (!selectedCat || selectedCat === 'All') return true;
  if (!product) return false;

  // Handle string category comparisons (e.g. category pills)
  if (typeof product === 'string') {
    const pCat = product.toLowerCase().trim();
    const sCat = selectedCat.toLowerCase().trim();
    if (pCat === sCat) return true;
    if ((sCat === 'cosmatics' || sCat === 'cosmetics') && (pCat === 'cosmatics' || pCat === 'cosmetics' || pCat === 'skincare' || pCat === 'lipcare')) return true;
    if ((sCat === 'applieances' || sCat === 'appliances') && (pCat === 'applieances' || pCat === 'appliances')) return true;
    if (sCat === 'fashion' && (pCat === 'fashion' || pCat === 'accessories' || pCat === 'jewelleries' || pCat === 'watches' || pCat === 'lifestyle')) return true;
    return false;
  }

  // Handle full product object
  const sCat = selectedCat.toLowerCase().trim();
  if (sCat === 'cosmatics' || sCat === 'cosmetics') return matchesDepartmentProduct(product, 'Cosmatics');
  if (sCat === 'applieances' || sCat === 'appliances') return matchesDepartmentProduct(product, 'Applieances');
  if (sCat === 'fashion') return matchesDepartmentProduct(product, 'Fashion');

  return matchesSubcategory(product, selectedCat);
};

export const ShopPage = () => {
  const { products: storeProducts, categories: storeCategories, formatPrice, loading = false } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  // Hydration support: use SSR initial data if StoreContext is still initializing
  const ssrInitialData = typeof window !== 'undefined' ? window.__INITIAL_DATA__ : null;
  const products = storeProducts.length > 0
    ? storeProducts
    : (ssrInitialData?.categoryProducts || ssrInitialData?.products || []);
  const categories = storeCategories.length > 0
    ? storeCategories
    : (ssrInitialData?.categories?.length ? ssrInitialData.categories : (ssrInitialData?.category ? [ssrInitialData.category] : []));

  // Find category corresponding to categorySlug if routed via /category/:categorySlug
  const matchedCategory = useMemo(() => {
    if (!categorySlug) return null;
    const cleanSlug = toSlug(categorySlug);
    return categories.find(c => toSlug(c.name) === cleanSlug || toSlug(c.id) === cleanSlug) || null;
  }, [categorySlug, categories]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'All');
  const [maxPrice, setMaxPrice] = useState(30000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync category, brand or search query parameter from URL
  useEffect(() => {
    if (categorySlug) {
      const cleanSlug = toSlug(categorySlug);
      const matched = categories.find(c => toSlug(c.name) === cleanSlug || toSlug(c.id) === cleanSlug);
      setSelectedCategory(matched ? matched.name : categorySlug);
    } else {
      const cat = searchParams.get('category');
      setSelectedCategory(cat || 'All');
    }
    const b = searchParams.get('brand');
    setSelectedBrand(b || 'All');
    const q = searchParams.get('search');
    setSearchTerm(q || '');
  }, [searchParams, categorySlug, categories]);

  const handleCategorySelect = (catName) => {
    if (categorySlug) {
      if (catName === 'All') {
        navigate('/shop');
      } else {
        navigate(getCategoryPath(catName));
      }
      return;
    }
    setSelectedCategory(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    setSearchParams(newParams);
  };

  // Extract all unique brands
  const brands = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.brand) set.add(p.brand);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query));
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== 'All' && !matchesCategory(p, selectedCategory)) {
        return false;
      }

      // Brand
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
        return false;
      }

      // Max price
      if (p.price > maxPrice) {
        return false;
      }

      // In stock
      if (inStockOnly && !p.inStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, maxPrice, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setMaxPrice(30000);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'All' ||
    selectedBrand !== 'All' ||
    maxPrice < 30000 ||
    inStockOnly;

  const currentCategoryName = matchedCategory?.name || (selectedCategory !== 'All' ? selectedCategory : null);
  const seoTitle = currentCategoryName
    ? `Buy ${currentCategoryName} Products in Sri Lanka | 100% Authentic – HaveItAll.lk`
    : "Online Beauty, Skincare, Cosmetics & Health Supplements Store Sri Lanka | HaveItAll.lk";
  const seoDescription = currentCategoryName
    ? `Shop 100% authentic ${currentCategoryName} at HaveItAll.lk. Genuine products with islandwide Cash on Delivery (COD) across Sri Lanka.`
    : "Browse 100% authentic skincare, health supplements, cosmetics, and beauty appliances at HaveItAll.lk. Islandwide Cash on Delivery across Sri Lanka.";
  const canonicalPath = categorySlug ? `/category/${toSlug(categorySlug)}` : "/shop";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
      />
      {/* Page Header */}
      <div className="mb-8 border-b border-cyan-100 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              {currentCategoryName || 'All Products'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Showing {filteredProducts.length} authentic skincare, cosmetics & lifestyle essentials.
            </p>
          </div>

          {/* Quick search input in header */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by brand, skincare, cosmetics, product name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-cyan-500 shadow-xs"
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

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 no-scrollbar">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((c) => {
            const isCatActive = selectedCategory === c.name || (selectedCategory !== 'All' && matchesCategory(c.name, selectedCategory));
            return (
              <button
                key={c.id}
                onClick={() => handleCategorySelect(c.name)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isCatActive
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Filter className="w-4 h-4 text-cyan-600" />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Category
              </h4>
              <div className="space-y-1.5">
                {['All', ...categories.map(c => c.name)].map((cat) => {
                  const isCatActive = cat === 'All' ? selectedCategory === 'All' : (selectedCategory === cat || (selectedCategory !== 'All' && matchesCategory(cat, selectedCategory)));
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isCatActive
                          ? 'bg-cyan-50 text-cyan-800 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat}</span>
                      {isCatActive && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Brand
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedBrand === b
                        ? 'bg-cyan-50 text-cyan-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBrand === b && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold uppercase tracking-wider text-slate-500">Max Price</span>
                <span className="font-bold text-cyan-700">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>LKR 500</span>
                <span>LKR 30,000</span>
              </div>
            </div>

            {/* In-Stock Filter */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 accent-cyan-600"
                />
                <span>In-Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Controls Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                )}
              </button>

              <span className="text-xs text-slate-500 hidden sm:inline">
                Showing <strong className="text-slate-800">{filteredProducts.length}</strong> products
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 ml-auto">
              <label className="text-xs text-slate-500 hidden sm:inline">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="featured">Featured Picks</option>
                <option value="newest">New Arrivals First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cyan-100 text-cyan-900 font-medium">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBrand !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cyan-100 text-cyan-900 font-medium">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {maxPrice < 30000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cyan-100 text-cyan-900 font-medium">
                  Under {formatPrice(maxPrice)}
                  <button onClick={() => setMaxPrice(30000)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cyan-100 text-cyan-900 font-medium">
                  In-Stock Only
                  <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-500 font-semibold hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading && products.length === 0 ? (
            <ProductGridSkeleton count={9} cols="grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" />
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any items matching your selected criteria. Try adjusting or clearing your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 ml-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-slate-900">Filter Products</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</h4>
              <div className="space-y-1">
                {['All', ...categories.map(c => c.name)].map((cat) => {
                  const isCatActive = cat === 'All' ? selectedCategory === 'All' : (selectedCategory === cat || (selectedCategory !== 'All' && matchesCategory(cat, selectedCategory)));
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                        isCatActive ? 'bg-cyan-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Brand</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      selectedBrand === b ? 'bg-cyan-600 text-white' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-slate-500">Max Price</span>
                <span className="font-bold text-cyan-700">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-cyan-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-semibold shadow-xs"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
