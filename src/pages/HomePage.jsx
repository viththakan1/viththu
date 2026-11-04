import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { HeroSlider } from '../components/common/HeroSlider';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Banknote,
  MessageCircle,
  Scissors,
  Star,
  Quote,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const HomePage = () => {
  const {
    products = [],
    categories = [],
    brands = [],
    banners = [],
    reviews = [],
    settings = {}
  } = useStore();

  const [activeTab, setActiveTab] = useState('all');

  const safeBanners = Array.isArray(banners) ? banners : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const featuredBanners = safeBanners.length > 0 ? safeBanners[0] : null;

  // Filter products for the showcase tab
  const filteredProducts = safeProducts.filter(p => {
    if (!p) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'bestseller') return p.badge === 'Best Seller' || (Number(p.rating) || 0) >= 4.8;
    if (activeTab === 'new') return p.newArrival || p.badge === 'New';
    if (activeTab === 'trending') return p.featured;
    return true;
  }).slice(0, 8);

  return (
    <div className="space-y-14 sm:space-y-16 pb-20">
      {/* Landing Page Image (Hero Slider) & Full Width Label Below (Not touching image) */}
      <div>
        <HeroSlider />

        {/* Full Width Label Below Landing Page Image (Clean spacing, not touching image) */}
        <section className="w-full bg-white border-y border-slate-200/90 shadow-2xs mt-4 sm:mt-6 py-3.5 sm:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              {/* Option 1: Islandwide Shipping */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-4 px-2 sm:px-6">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-tight">
                    Islandwide Shipping
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                    Fast delivery 3-5 days
                  </p>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-4 px-2 sm:px-6 pl-3 sm:pl-6">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-tight">
                    Cash on Delivery
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                    Pay at your doorstep
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Categories Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-700">
              Explore Our Range
            </span>
            <h2 className="font-heading text-3xl font-bold text-slate-900 mt-1">
              Featured Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse authentic skincare, cosmetics & lifestyle essentials directly from global brands.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-100 shadow-xs hover:shadow-card transition-all duration-300 flex flex-col justify-end p-4 border border-slate-100 hover:border-cyan-200"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent group-hover:from-slate-950/90 transition-all" />
              <div className="relative z-10 text-white">
                <h3 className="font-heading text-base font-bold group-hover:text-cyan-300 transition-colors leading-tight">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-cyan-200 font-medium">
                  {cat.count}+ Designs
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Section: 3 in a row on mobile phone, 6-7 on desktop */}
      {brands && brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-cyan-700">
                Studio Heritage
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
                Our Brands
              </h2>
            </div>
            <Link
              to="/brands"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
            >
              <span>View All ({brands.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-3 md:gap-3.5">
            {brands.map((brand) => (
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
        </section>
      )}

      {/* Featured Products Section with Tab Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-700">
            Handpicked For You
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
            Featured Products
          </h2>
          <p className="text-sm text-slate-500">
            Experience our most sought-after skincare essentials, high-performance cosmetics, and authentic lifestyle products.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'bestseller', label: 'Best Sellers' },
              { id: 'new', label: 'New Arrivals' },
              { id: 'trending', label: 'Trending Picks' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-cyan-600 text-cyan-700 hover:bg-cyan-600 hover:text-white font-semibold text-sm transition-all shadow-xs"
          >
            <span>Explore Complete Catalog ({products.length} Items)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Promotional Banner Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-teal-950 text-white p-8 sm:p-12 lg:p-16 border border-cyan-800/40">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&h=800&fit=crop"
              alt="Promotional Banner"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider">
              Exclusive Beauty Offer
            </span>
            <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              100% Authentic Global Skincare & Beauty
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Enjoy 10% off your first order with coupon code <span className="font-mono font-bold text-amber-300">HAVEITALL10</span>. Islandwide fast delivery and direct WhatsApp assistance included.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors shadow-md"
              >
                Shop the Sale Now
              </Link>
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=Hello!%20I%20would%20like%20to%20order%20from%20HAVEITALL%20with%20code%20HAVEITALL10`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship & Brand Story Highlights */}
      <section className="bg-gradient-to-b from-cyan-50/50 to-white py-16 border-y border-cyan-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-cyan-700">
                The HAVEITALL Promise
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                100% Authentic Global Brands, <br />
                Direct From Official Websites
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Looking for genuine global brands in Sri Lanka? At haveitall.lk, we buy directly from official brand websites across the globe—so you never have to worry about fakes. Enjoy 100% authentic products with reliable islandwide delivery.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">100% Genuine Global Products</h4>
                    <p className="text-xs text-slate-500">Sourced exclusively from verified brand flagships worldwide.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Transparent & Ethical Sourcing</h4>
                    <p className="text-xs text-slate-500">Supporting artisan communities with fair wages and respect for craftsmanship.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Personalized Colombo Concierge</h4>
                    <p className="text-xs text-slate-500">Custom size consultations and styling recommendations via WhatsApp.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                >
                  <span>Learn more about our heritage & studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=800&fit=crop"
                alt="Skincare Essentials"
                className="rounded-2xl shadow-lg object-cover h-64 sm:h-80 w-full"
              />
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=800&fit=crop"
                alt="Cosmetics & Beauty"
                className="rounded-2xl shadow-lg object-cover h-64 sm:h-80 w-full mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-700">
            Client Voices
          </span>
          <h2 className="font-heading text-3xl font-bold text-slate-900">
            What Our Patrons Say
          </h2>
          <p className="text-sm text-slate-500">
            Real feedback from beauty enthusiasts, wellness shoppers, and discerning customers across Sri Lanka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev, idx) => {
            const reviewerName = rev.name || rev.author || 'Verified Buyer';
            const reviewerRole = rev.role || (rev.city ? `Verified Buyer, ${rev.city}` : 'Verified Customer');
            const reviewComment = rev.content || rev.comment || 'Outstanding service and premium product quality.';
            const reviewRating = Math.max(1, Math.min(5, Number(rev.rating) || 5));
            const reviewAvatar = rev.avatar || (reviewerName ? reviewerName.slice(0, 2).toUpperCase() : 'CU');

            return (
              <div
                key={rev.id || idx}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(reviewRating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic mb-4">
                    "{reviewComment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center">
                    {reviewAvatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{reviewerName}</h4>
                    <p className="text-[11px] text-slate-400">{reviewerRole}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WhatsApp Concierge Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold">
              Looking for Product Advice or Wholesale Inquiries?
            </h3>
            <p className="text-sm text-emerald-100 max-w-xl">
              Connect directly with our Colombo team on WhatsApp for authentic batch verification, skincare recommendations, and express dispatch.
            </p>
          </div>
          <a
            href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=Hello!%20I%20would%20like%20to%20consult%20regarding%20products%20on%20HAVEITALL.`}
            target="_blank"
            rel="noreferrer"
            className="px-7 py-3.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shadow-md transition-colors flex items-center gap-2 shrink-0"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};
