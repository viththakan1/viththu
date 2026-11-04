import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import {
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
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
      banner: '',
      origin: '',
      description: '',
      featured: true
    };
  }, [brands, decodedBrandName]);

  // All products belonging to this specific brand
  const allBrandProducts = useMemo(() => {
    return products.filter(
      (p) => p.brand?.toLowerCase() === decodedBrandName.toLowerCase()
    );
  }, [products, decodedBrandName]);

  // Categories available specifically for this brand's products
  const brandCategories = useMemo(() => {
    const cats = new Set();
    allBrandProducts.forEach((p) => {
      const c = (p.category || '').trim();
      if (c) cats.add(c);
    });
    return ['All', ...Array.from(cats)];
  }, [allBrandProducts]);

  // Filter states
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
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
        q: `Are all ${brandData.name} products 100% authentic and original?`,
        a: `Yes, every creation under ${brandData.name} on haveitall.lk is imported directly from official brand websites and authorized global distribution channels. Each item arrives with its original manufacturer seal and verifiable batch code.`
      },
      {
        topic: 'Care Guide',
        q: `How do I store and use products from ${brandData.name}?`,
        a: `Store in a cool, dry place away from direct sunlight. Ensure caps, droppers, and lids are tightly closed after every use to preserve active ingredients, formula freshness, and efficacy.`
      },
      {
        topic: 'Geo & Delivery',
        q: `What is the estimated delivery time for ${brandData.name} in Sri Lanka?`,
        a: `Orders across Colombo and Western Province arrive within 24-48 hours. Island-wide dispatch across Kandy, Galle, Jaffna, and other regions takes 2-4 business days via tracked express couriers.`
      },
      {
        topic: 'Returns',
        q: `What is the return and exchange policy for ${brandData.name}?`,
        a: `We offer a hassle-free 7-day return window for unopened, sealed products in their original packaging. If you have questions about shade matching or formula suitability, our customer care team is available to assist.`
      },
      {
        topic: 'Personalized Support',
        q: `Can I request personalized product recommendations or bulk orders for ${brandData.name}?`,
        a: `Absolutely! HAVEITALL provides direct WhatsApp consultation for skincare regimen advice, authenticity verification, and bulk orders across Sri Lanka.`
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
          '@id': `https://haveitall.lk/brand/${encodeURIComponent(brandData.name)}#brand`,
          'name': brandData.name,
          'description': brandData.description || `100% authentic skincare, cosmetics and lifestyle essentials by ${brandData.name}.`,
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
          '@id': `https://haveitall.lk/brand/${encodeURIComponent(brandData.name)}#faq`,
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
          '@id': `https://haveitall.lk/brand/${encodeURIComponent(brandData.name)}`,
          'name': `${brandData.name} Official Brand Range | HAVEITALL`,
          'description': brandData.description,
          'numberOfItems': allBrandProducts.length
        }
      ]
    };
  }, [brandData, brandFaqs, allBrandProducts.length]);

  // SEO & Geo Meta tags updater
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${brandData.name} - 100% Authentic Skincare & Beauty | HAVEITALL Sri Lanka`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = `Shop authentic ${brandData.name} products online at HAVEITALL. Origin: ${brandData.origin || 'Certified Brand Import'}. ${brandData.description || 'Verified manufacturer batch seals and original formulations'}. Express island-wide delivery.`;

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = `${brandData.name}, ${brandData.origin || 'Sri Lanka'}, genuine skincare, authentic cosmetics, beauty products Colombo, lifestyle essentials`;

    return () => {
      document.title = originalTitle;
    };
  }, [brandData]);

  // Filtered brand products by category
  const displayedProducts = useMemo(() => {
    let result = [...allBrandProducts];

    // Filter by category
    if (selectedCategoryFilter !== 'All') {
      result = result.filter(
        (p) => (p.category || '').trim().toLowerCase() === selectedCategoryFilter.toLowerCase()
      );
    }

    return result;
  }, [allBrandProducts, selectedCategoryFilter]);

  // Banner image fallback if brand banner is missing: use first product image or empty
  const bannerImage =
    brandData.banner ||
    allBrandProducts[0]?.image ||
    '';

  return (
    <div className="min-h-screen bg-[#f8fcfe]">
      {/* Brand Product Banner */}
      <section className="relative h-[35vh] min-h-[250px] sm:min-h-[290px] md:min-h-[340px] max-h-[440px] w-full overflow-hidden bg-slate-900">
        {/* Background Banner Image or Gradient */}
        {bannerImage ? (
          <img
            src={bannerImage}
            alt={`${brandData.name} Banner`}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900" />
        )}
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
        {/* Category Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-3.5 sm:p-4 mb-6 space-y-3">
          {/* Product count heading */}
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

          {/* Category Filter Pills */}
          {brandCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 border-t border-slate-100 no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                Category:
              </span>
              {brandCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategoryFilter === cat
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
                {selectedCategoryFilter !== 'All'
                  ? `No products in ${brandData.name} under category "${selectedCategoryFilter}".`
                  : `Currently there are no products listed under ${brandData.name}.`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {selectedCategoryFilter !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('All')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Show All Categories
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
                    `${brandData.name} is a premier beauty and lifestyle brand specializing in authentic skincare formulas, high-performance cosmetics, and personal care essentials.`}
                </p>
                <p>
                  Committed to genuine quality, every product under <strong>{brandData.name}</strong> undergoes rigorous batch and seal verification. From dermatologically tested skincare to clean cosmetics, our offerings celebrate radiant beauty and trusted formulas.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 bg-cyan-50/40 border-l-2 border-cyan-500 p-3 rounded-r-xl">
                  <strong>HAVEITALL Authenticity Certification:</strong> All items in this {brandData.name} showcase are directly imported through authorized brand distributions in {brandData.origin || 'global markets'}, guaranteeing verifiable batch codes, zero counterfeits, and sealed packaging.
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
                  <dt className="text-slate-500 shrink-0 font-medium">Geo Origin / Sourcing:</dt>
                  <dd className="font-semibold text-slate-800 text-right">{brandData.origin || 'Global Brand'}</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Product Specialties:</dt>
                  <dd className="font-medium text-slate-700 text-right">Skincare, Cosmetics, Lifestyle Essentials</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Delivery Coverage:</dt>
                  <dd className="font-medium text-slate-700 text-right">Colombo (24-48h), Islandwide Sri Lanka (2-4d)</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Exchange Policy:</dt>
                  <dd className="font-semibold text-emerald-700 text-right">7-Day Hassle-Free Returns</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-slate-500 shrink-0 font-medium">Official Stockist:</dt>
                  <dd className="font-bold text-cyan-800 text-right">HAVEITALL, Colombo</dd>
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
                  Direct official imports with genuine batch codes and tamper seals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/70">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Direct Global Sourcing</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Imported from official brand distributions in {brandData.origin || 'global markets'}.
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
              Clear, direct answers regarding product authenticity, regional delivery in Sri Lanka, storage instructions, and order assistance.
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
                Need formula advice or regimen consultation? Visit <strong>HAVEITALL Store, Colombo 03</strong> or contact our beauty care team.
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

