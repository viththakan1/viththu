import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import {
  ChevronRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  X,
  HelpCircle,
  ShieldCheck,
  Truck,
  MessageCircle,
  MapPin,
  Building2,
  Globe,
  CheckCircle2
} from 'lucide-react';

export const BrandPage = () => {
  const { brandName } = useParams();
  const { brands = [], products = [] } = useStore();

  const decodedBrandName = useMemo(() => {
    return brandName ? decodeURIComponent(brandName) : '';
  }, [brandName]);

  // Find registered brand or derive fallback brand metadata
  const brandData = useMemo(() => {
    const found = brands.find(
      (b) => b.name?.toLowerCase() === decodedBrandName.toLowerCase()
    );
    if (found) return found;

    return {
      id: `brand-${decodedBrandName.toLowerCase().replace(/\s+/g, '-')}`,
      name: decodedBrandName,
      logo: '',
      banner: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&h=600&fit=crop',
      origin: 'Curated Artisan Studio',
      description: 'Exclusive artisanal collection handcrafted with premier heritage textiles.',
      featured: true
    };
  }, [brands, decodedBrandName]);

  // All products belonging to this specific brand
  const allBrandProducts = useMemo(() => {
    return products.filter(
      (p) => p.brand?.toLowerCase() === decodedBrandName.toLowerCase()
    );
  }, [products, decodedBrandName]);

  // Categories available specifically for this brand
  const brandCategories = useMemo(() => {
    const cats = new Set();
    allBrandProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [allBrandProducts]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [openFaq, setOpenFaq] = useState(0); // First FAQ open by default
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('All');

  // Brand-tailored FAQs (uses manually defined brand Q&As if present, otherwise smart defaults)
  const brandFaqs = useMemo(() => {
    if (Array.isArray(brandData.faqs) && brandData.faqs.length > 0) {
      return brandData.faqs;
    }
    return [
      {
        topic: 'Authenticity',
        q: `Are all ${brandData.name} products 100% authentic and handpicked?`,
        a: `Yes, every creation under ${brandData.name} is directly sourced from certified master artisans and reputable design workshops. Each item passes meticulous quality and authenticity inspection by AxisX Studio before packaging.`
      },
      {
        topic: 'Care Guide',
        q: `How do I care for garments and textiles from ${brandData.name}?`,
        a: `We recommend dry cleaning or gentle hand wash with cold water and mild liquid detergent for delicate silks, handloom cottons, and embroidered fabrics. Avoid direct harsh sunlight to preserve the organic dyes and intricate metallic zari threads.`
      },
      {
        topic: 'Geo & Delivery',
        q: `What is the estimated delivery time for ${brandData.name} in Sri Lanka and overseas?`,
        a: `Orders across Colombo (Zones 1-15) and Western Province arrive within 24-48 hours. Island-wide dispatch across Kandy, Galle, Jaffna, and other regions takes 2-4 business days. International shipping via express courier takes 4-7 business days.`
      },
      {
        topic: 'Returns',
        q: `What is the return and exchange policy for ${brandData.name}?`,
        a: `We offer a hassle-free 7-day exchange window for unused items with original tags and packaging intact. If you require size alteration or an alternate design, our customer care team is available to assist promptly.`
      },
      {
        topic: 'Custom Styling',
        q: `Can I request custom stitching, bespoke sizing, or bulk orders for ${brandData.name}?`,
        a: `Absolutely! AxisX Studio provides bespoke tailoring, custom saree blouse stitching, and bulk curation for weddings or boutique collections. Contact us directly on WhatsApp to consult our textile stylists.`
      }
    ];
  }, [brandData.name, brandData.faqs]);

  // Dynamic SEO & AEO Structured Data (Schema.org JSON-LD for Google & AI Answer Engines)
  const schemaStructuredData = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Brand',
          '@id': `https://axisxstore.com/brand/${encodeURIComponent(brandData.name)}#brand`,
          'name': brandData.name,
          'description': brandData.description || `Luxury artisanal textiles and designer collections by ${brandData.name}.`,
          'logo': brandData.logo,
          'image': brandData.banner,
          'areaServed': {
            '@type': 'Country',
            'name': 'Sri Lanka'
          },
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': brandData.origin || 'Colombo',
            'addressCountry': 'LK'
          }
        },
        {
          '@type': 'FAQPage',
          '@id': `https://axisxstore.com/brand/${encodeURIComponent(brandData.name)}#faq`,
          'mainEntity': brandFaqs.map((faq) => ({
            '@type': 'Question',
            'name': faq.q,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': faq.a
            }
          }))
        },
        {
          '@type': 'CollectionPage',
          '@id': `https://axisxstore.com/brand/${encodeURIComponent(brandData.name)}`,
          'name': `${brandData.name} Official Designer Collection | AxisX Store`,
          'description': brandData.description,
          'numberOfItems': allBrandProducts.length
        }
      ]
    };
  }, [brandData, brandFaqs, allBrandProducts.length]);

  // SEO & Geo Meta tags updater
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${brandData.name} - Luxury Handcrafted Designer Wear | AxisX Store Sri Lanka`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = `Shop authentic ${brandData.name} collection online at AxisX Store. Origin: ${brandData.origin || 'Colombo, Sri Lanka'}. ${brandData.description || 'Exclusive luxury weaves and ethnic fashion'}. Express island-wide delivery.`;

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = `${brandData.name}, ${brandData.origin || 'Sri Lanka'}, sarees, handloom fabrics, ethnic fashion Colombo, luxury designer textiles`;

    return () => {
      document.title = originalTitle;
    };
  }, [brandData]);

  // Filtered brand products
  const displayedProducts = useMemo(() => {
    let result = [...allBrandProducts];

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search keyword
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.fabric && p.fabric.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

    return result;
  }, [allBrandProducts, selectedCategory, searchTerm, sortBy]);

  // Banner image fallback if brand banner is missing: use first product image or default banner
  const bannerImage =
    brandData.banner ||
    allBrandProducts[0]?.image ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&h=600&fit=crop';

  return (
    <div className="min-h-screen bg-[#f8fcfe]">
      {/* 35% of the Landing Brand Page: Brand Product Banner */}
      <section className="relative h-[35vh] min-h-[250px] sm:min-h-[290px] md:min-h-[340px] max-h-[440px] w-full overflow-hidden bg-slate-100">
        {/* Background Banner Image - 100% crisp, sharp, completely unblurred, no filters */}
        <img
          src={bannerImage}
          alt={`${brandData.name} Banner`}
          className="w-full h-full object-cover object-center"
        />

        {/* Banner Content Container: ONLY Brand Logo & Brand Name - Crisp, clear, no black shadows or blur */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-3.5 sm:gap-4 p-2 sm:p-2.5 bg-white/95 rounded-2xl border border-slate-200">
            {/* Brand Logo */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
              {brandData.logo ? (
                <img
                  src={brandData.logo}
                  alt={brandData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-cyan-600 text-white font-bold text-xl sm:text-2xl flex items-center justify-center">
                  {brandData?.name ? brandData.name.slice(0, 1) : 'B'}
                </div>
              )}
            </div>

            {/* Brand Name */}
            <div className="pr-3 sm:pr-4">
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {brandData.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Bar: Shown Below the Brand Banner Section */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/brands" className="hover:text-cyan-600 transition-colors">Brands</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate">{brandData.name}</span>
          </nav>

          <Link
            to="/brands"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Brands</span>
          </Link>
        </div>
      </div>

      {/* Main Content: Below the Banner Show That Brand Related Products */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Filter, Sort & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-3.5 sm:p-4 mb-6 space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Product count heading */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-100/70 text-cyan-800">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                  {brandData.name} Creations
                </h3>
                <p className="text-[11px] text-slate-400">
                  Showing {displayedProducts.length} of {allBrandProducts.length} products
                </p>
              </div>
            </div>

            {/* Right: Quick Search & Sort */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Search within brand */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search in ${brandData.name}...`}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-700 cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills (Exclusive to this brand's categories) */}
          {brandCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                Category:
              </span>
              {brandCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid: 2 per row on mobile, 3 on tablet, 4 on desktop */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                No products found
              </h3>
              <p className="text-xs text-slate-500">
                {searchTerm
                  ? `No products in ${brandData.name} matched "${searchTerm}".`
                  : `Currently there are no products listed under ${brandData.name}.`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
              <Link
                to="/shop"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm transition-colors"
              >
                Explore Full Shop Catalog
              </Link>
            </div>
          </div>
        )}

        {/* Dynamic SEO & AEO Structured Data (Schema.org JSON-LD for Google & AI Answer Engines) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaStructuredData) }}
        />

        {/* ======================================================== */}
        {/* HIGH-VISIBILITY SEO / GEO / AEO FRIENDLY ABOUT BRAND     */}
        {/* ======================================================== */}
        <section
          aria-labelledby="brand-about-heading"
          itemScope
          itemType="https://schema.org/Brand"
          className="mt-14 sm:mt-16 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm transition-all"
        >
          {/* Section Header with Semantic Metadata */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/80 p-1 overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                {brandData.logo ? (
                  <img
                    itemProp="logo"
                    src={brandData.logo}
                    alt={`${brandData.name} Official Emblem`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-cyan-600 text-white font-bold text-xl rounded-xl flex items-center justify-center">
                    {brandData?.name ? brandData.name.slice(0, 1) : 'B'}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-cyan-600" />
                    Verified Designer Label
                  </span>
                  {brandData.origin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span itemProp="addressLocality">{brandData.origin}</span>
                    </span>
                  )}
                </div>

                <h2
                  id="brand-about-heading"
                  itemProp="name"
                  className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight"
                >
                  About {brandData.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Official Brand Profile, Artisanal Heritage & Regional Sourcing
                </p>
              </div>
            </div>

            {/* Quick Regional / Geo Status Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-600" />
                <span>Islandwide Sri Lanka & Global Delivery</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-cyan-50/80 border border-cyan-200 text-cyan-900 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700" />
                <span>{allBrandProducts.length} Authenticated Designs</span>
              </div>
            </div>
          </div>

          {/* High-Visibility Rich SEO Brand Narrative & Factsheet */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-600" />
                Brand Overview & Artisan Philosophy
              </h3>

              <div itemProp="description" className="text-sm text-slate-700 leading-relaxed space-y-3 font-normal">
                <p className="text-slate-800 font-medium">
                  {brandData.description ||
                    `${brandData.name} is a premier textile and couture house specializing in handcrafted South Asian bridal wear, contemporary ethnic silhouettes, and heirloom weaves.`}
                </p>
                <p>
                  Rooted in authentic regional craftsmanship, every creation under <strong>{brandData.name}</strong> undergoes rigorous fiber verification, hand-dye testing, and pattern precision. From hand-selected natural raw silks and organic linen blends to intricate zari borders, our collections celebrate sustainable fashion rooted in cultural legacy.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 bg-cyan-50/40 border-l-2 border-cyan-500 p-3 rounded-r-xl">
                  <strong>AxisX Studio Authenticity Certification:</strong> All items in this {brandData.name} showcase are directly partnered through master weaver guilds in {brandData.origin || 'South Asia'}, guaranteeing direct artisan compensation, zero synthetic counterfeits, and true material purity.
                </p>
              </div>
            </div>

            {/* AEO / GEO Fast-Facts Entity Card (Answer Engine Friendly Factsheet) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>Brand Factsheet</span>
                <span className="text-[10px] text-cyan-700 font-mono font-bold">SEO/AEO Entity</span>
              </h4>

              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Brand Entity:</dt>
                  <dd className="font-bold text-slate-900 text-right">{brandData.name}</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Geo Location / Studio:</dt>
                  <dd className="font-semibold text-slate-800 text-right">{brandData.origin || 'Colombo, Sri Lanka'}</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Artisanal Specialties:</dt>
                  <dd className="font-medium text-slate-700 text-right">Handlooms, Sarees, Cottons, Silks</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Delivery Coverage:</dt>
                  <dd className="font-medium text-slate-700 text-right">Colombo 1-15 (24-48h), Islandwide (2-4d)</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Exchange Policy:</dt>
                  <dd className="font-semibold text-emerald-700 text-right">7-Day Hassle-Free Returns</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Official Stockist:</dt>
                  <dd className="font-bold text-cyan-800 text-right">AxisX Studio, Colombo</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* GEO & Trust Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100/70">
              <div className="p-2.5 rounded-xl bg-cyan-600 text-white shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Verified Authenticity</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Inspected master looms with certified fiber authenticity seals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/70">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Geo-Traceable Artisan Origin</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Crafted by genuine heritage guilds in {brandData.origin || 'recognized textile hubs'}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-sky-50/50 border border-sky-100/70">
              <div className="p-2.5 rounded-xl bg-sky-600 text-white shrink-0 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Tracked Express Islandwide</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Insured courier dispatch to all districts in Sri Lanka with SMS updates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* HIGH-VISIBILITY SEO / GEO / AEO FRIENDLY BRAND Q/A       */}
        {/* ======================================================== */}
        <section
          aria-labelledby="brand-faq-heading"
          itemScope
          itemType="https://schema.org/FAQPage"
          className="mt-10 sm:mt-12 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm"
        >
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-extrabold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Answers • AEO Knowledge Base</span>
            </div>
            <h3
              id="brand-faq-heading"
              className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              Frequently Asked Questions about {brandData.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Clear, direct answers regarding fabric authenticity, regional delivery in Sri Lanka, care instructions, and bespoke tailoring.
            </p>
          </div>

          {/* Interactive Semantic Q&A Accordion */}
          <div className="max-w-3xl mx-auto space-y-3.5">
            {brandFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isOpen
                      ? 'border-cyan-300 bg-cyan-50/20 shadow-xs'
                      : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-800 hover:text-cyan-700 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span itemProp="name" className="text-slate-900 font-bold">
                        {faq.q}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                      className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 bg-white"
                    >
                      <p itemProp="text" className="pl-9 text-slate-700">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Geo Local Assistance & WhatsApp CTA */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 text-center sm:text-left">
              <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>
                Need custom sizing or in-person consultation? Visit <strong>AxisX Studio Showroom, Colombo 03</strong> or contact our stylist team.
              </span>
            </div>

            <a
              href="https://wa.me/94771354761"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask Specialist on WhatsApp</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

