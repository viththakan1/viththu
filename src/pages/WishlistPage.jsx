import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlist, products } = useStore();

  const favoriteProducts = products.filter(p => wishlist.includes(p.id));

  if (favoriteProducts.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-slate-900">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-500">
          Save your favorite handcrafted sarees, linen shirts, and fabrics here while you shop.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold text-xs shadow-md mt-2"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-slate-900">
          My Saved Wishlist ({favoriteProducts.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Items you've bookmarked for your upcoming celebrations and wardrobe essentials.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {favoriteProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};
