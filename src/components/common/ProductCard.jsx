import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { optimizeProductImage, getProductSrcSet } from '../../utils/imageOptimizer';

export const ProductCard = ({ product }) => {
  const {
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useStore();

  const isFavorited = isInWishlist(product.id);

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  // Ultra-crisp optimized image URLs
  const mainImage = optimizeProductImage(product.image, 1200, 92);
  const hoverImage = Array.isArray(product.images) && product.images.length > 1 && product.images[1] !== product.image
    ? optimizeProductImage(product.images[1], 1200, 92)
    : null;

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="group relative bg-white rounded-lg sm:rounded-xl border border-slate-100 hover:border-cyan-200/80 shadow-xs hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container with HD Enhancement */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-slate-100 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full relative">
          {/* Main Primary Image */}
          <img
            src={mainImage}
            srcSet={getProductSrcSet(product.image)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
              hoverImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
            }`}
            style={{
              imageRendering: '-webkit-optimize-contrast',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          />

          {/* Luxury Second Photo Crossfade on Hover */}
          {hoverImage && (
            <img
              src={hoverImage}
              srcSet={getProductSrcSet(product.images[1])}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              alt={`${product.name} alternate view`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out pointer-events-none"
              style={{
                imageRendering: '-webkit-optimize-contrast',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            />
          )}

          {/* Crisp Gradient Vignette for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[11px] font-bold rounded sm:rounded-md uppercase tracking-wider bg-white/95 text-cyan-900 shadow-xs backdrop-blur-sm border border-cyan-100">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="px-1 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold rounded sm:rounded-md bg-rose-500 text-white shadow-xs">
              {discountPercent}%
            </span>
          )}
        </div>

        {/* Fabric tag overlay */}
        {product.fabric && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 z-10 pointer-events-none hidden sm:block">
            <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-medium rounded bg-slate-900/70 text-slate-100 backdrop-blur-sm">
              {product.fabric}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5 sm:mb-1">
            <div className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-cyan-700 truncate">
              {product.brand ? (
                <>
                  <Link
                    to={`/brand/${encodeURIComponent(product.brand)}`}
                    className="hover:underline hover:text-cyan-900 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.brand}
                  </Link>
                  <span className="text-slate-300 font-normal"> • </span>
                  <span className="text-slate-500 font-medium">{product.category}</span>
                </>
              ) : (
                product.category
              )}
            </div>
            <div className="hidden sm:flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-heading text-xs sm:text-base font-bold text-slate-900 hover:text-cyan-700 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 mt-1 sm:mt-2">
            <span className="text-xs sm:text-base font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through hidden sm:inline">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Wishlist (Left) + Add to Cart (Right) */}
        <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-slate-100 flex items-center gap-1.5 sm:gap-2">
          {/* Wishlist Button on the Left */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-200 shrink-0 flex items-center justify-center active:scale-95 ${
              isFavorited
                ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-xs'
                : 'bg-slate-50 hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-500'
            }`}
            aria-label="Save to Wishlist"
            title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${isFavorited ? 'fill-rose-500 scale-105' : ''}`} />
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCartClick}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-cyan-50 hover:bg-cyan-600 text-cyan-800 hover:text-white text-[11px] sm:text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
