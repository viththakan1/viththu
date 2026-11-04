import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { getProductPath } from '../../utils/productUrl';

export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, products, formatPrice } = useStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filtered = query.trim() === ''
    ? []
    : products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(query.toLowerCase())) ||
        (p.fabric && p.fabric.toLowerCase().includes(query.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6);

  const handleSelectProduct = (product) => {
    setIsSearchOpen(false);
    navigate(getProductPath(product));
  };

  const popularSearches = ['Serum', 'Sunscreen', 'Moisturizer', 'Cleanser', 'Lipstick', 'Perfume'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm transition-all duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-cyan-100 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-cyan-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skincare, cosmetics, lifestyle, brands..."
            className="w-full bg-transparent border-none text-slate-800 placeholder:text-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto p-4 flex-1">
          {query.trim() === '' ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-sm font-medium transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5 text-cyan-600" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-base font-medium">No products found matching "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for serums, sunscreen, cleansers, or cosmetics.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Matching Products ({filtered.length})
              </p>
              {filtered.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-cyan-50/60 cursor-pointer border border-transparent hover:border-cyan-200/60 transition-all group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-16 object-cover rounded-lg shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-600">
                      {product.category}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-cyan-700 transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Pro tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[10px]">ESC</kbd> to exit</span>
          <button
            onClick={() => {
              setIsSearchOpen(false);
              navigate(`/shop?search=${encodeURIComponent(query)}`);
            }}
            className="text-cyan-700 font-semibold hover:underline"
          >
            View all results in Shop &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
