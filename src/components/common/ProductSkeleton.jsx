import React from 'react';

/**
 * Product Card Skeleton
 * Aesthetic: Deep emerald green (#064e3b), warm cream (#faf6f0, #f4eee4), and soft gold/amber shimmer (#f59e0b).
 */
export const ProductCardSkeleton = () => (
  <div className="relative bg-white rounded-lg sm:rounded-xl border border-emerald-950/10 shadow-xs flex flex-col overflow-hidden animate-pulse">
    {/* Product Image Area with Warm Cream & Emerald-Gold Tint */}
    <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-gradient-to-br from-[#faf7f2] via-[#f1ebe0] to-[#e7dece] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/25 to-transparent animate-shimmer pointer-events-none" />
      {/* Top Badge Skeleton */}
      <div className="absolute top-2 left-2 w-14 sm:w-16 h-4 bg-emerald-900/15 rounded-md" />
    </div>

    {/* Product Details Area */}
    <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
      <div>
        {/* Brand & Rating Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-16 bg-emerald-900/15 rounded-full" />
          <div className="h-3 w-10 bg-amber-500/20 rounded-full" />
        </div>
        {/* Title Skeleton (2 lines) */}
        <div className="h-3.5 sm:h-4 w-5/6 bg-slate-200/90 rounded mb-1.5" />
        <div className="h-3.5 sm:h-4 w-3/5 bg-slate-100 rounded" />
      </div>

      {/* Price & Action Button Skeleton */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="h-4 sm:h-5 w-20 bg-emerald-900/20 rounded" />
          <div className="h-2.5 w-12 bg-slate-200/80 rounded" />
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-900/15 shrink-0" />
      </div>
    </div>
  </div>
);

/**
 * Grid of Product Card Skeletons
 */
export const ProductGridSkeleton = ({ count = 8, cols = "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4" }) => (
  <div className={`grid ${cols} gap-3 sm:gap-4 lg:gap-6`}>
    {Array.from({ length: count }).map((_, idx) => (
      <ProductCardSkeleton key={idx} />
    ))}
  </div>
);

/**
 * Hero Slider Banner Skeleton
 */
export const HeroSkeleton = () => (
  <div className="relative w-full aspect-[16/7] sm:aspect-[21/8] lg:aspect-[24/8] bg-gradient-to-r from-[#064e3b] via-[#0b3b30] to-[#042f24] rounded-2xl overflow-hidden shadow-md animate-pulse border border-emerald-800/40">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent animate-shimmer pointer-events-none" />
    <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 space-y-3 max-w-md z-10">
      <div className="h-4 w-28 bg-amber-400/30 rounded-full" />
      <div className="h-8 sm:h-10 w-64 sm:w-80 bg-emerald-100/20 rounded-lg" />
      <div className="h-4 w-48 sm:w-56 bg-emerald-100/10 rounded" />
    </div>
  </div>
);

/**
 * Brand Pill Skeleton
 */
export const BrandPillSkeleton = () => (
  <div className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 pr-2.5 sm:pr-3.5 bg-white border border-slate-200 rounded-full shadow-2xs animate-pulse">
    <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-emerald-900/15 shrink-0" />
    <div className="h-3 w-12 sm:w-16 bg-slate-200 rounded" />
  </div>
);

/**
 * Category Card Skeleton
 */
export const CategoryCardSkeleton = () => (
  <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-[#faf7f2] via-[#f1ebe0] to-[#e7dece] border border-slate-200 shadow-xs animate-pulse p-4 flex flex-col justify-end">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent animate-shimmer pointer-events-none" />
    <div className="space-y-1.5 relative z-10">
      <div className="h-4 w-20 bg-emerald-900/25 rounded" />
      <div className="h-2.5 w-12 bg-amber-600/25 rounded" />
    </div>
  </div>
);

/**
 * Product Detail Page Skeleton
 */
export const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 animate-pulse space-y-8">
    {/* Breadcrumb Skeleton */}
    <div className="flex items-center gap-2">
      <div className="h-3 w-12 bg-slate-200 rounded" />
      <div className="h-3 w-3 bg-slate-200 rounded-full" />
      <div className="h-3 w-16 bg-slate-200 rounded" />
      <div className="h-3 w-3 bg-slate-200 rounded-full" />
      <div className="h-3 w-32 bg-slate-200 rounded" />
    </div>

    {/* Product Main Display */}
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
      {/* Image Gallery Skeleton (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col sm:flex-row gap-4">
        <div className="hidden sm:flex flex-col gap-2.5 w-20 shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="flex-1 aspect-[3/4] sm:aspect-[4/5] rounded-2xl bg-gradient-to-br from-[#faf7f2] via-[#f1ebe0] to-[#e7dece] border border-emerald-950/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Details Side Skeleton (50%) */}
      <div className="w-full lg:w-1/2 space-y-5">
        <div className="h-4 w-24 bg-emerald-900/20 rounded-full" />
        <div className="h-8 w-4/5 bg-slate-200 rounded-lg" />
        <div className="flex items-center gap-3">
          <div className="h-4 w-28 bg-amber-500/20 rounded" />
          <div className="h-4 w-20 bg-slate-200 rounded" />
        </div>
        <div className="h-8 w-36 bg-emerald-900/25 rounded" />

        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-5/6 bg-slate-100 rounded" />
          <div className="h-3 w-2/3 bg-slate-100 rounded" />
        </div>

        <div className="pt-6 flex gap-4">
          <div className="h-12 w-1/2 bg-emerald-900/20 rounded-xl" />
          <div className="h-12 w-1/2 bg-amber-500/20 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);
