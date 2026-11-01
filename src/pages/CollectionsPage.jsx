import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CollectionsPage = () => {
  const { categories } = useStore();

  const curatedLookbooks = [
    {
      id: 'lookbook-1',
      title: 'The Royal Silk Affair',
      tagline: 'Centuries of Banarasi & Kanjivaram Grandeur',
      description: 'Heirloom sarees and bridal attire intricately woven with pure metallic zari work, designed to be treasured for generations.',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&h=700&fit=crop',
      category: 'Sarees',
      itemsCount: '45 Exclusive Designs'
    },
    {
      id: 'lookbook-2',
      title: 'Island Summer Linen',
      tagline: 'Effortless Tropical Breathability',
      description: 'Tailored shirts, relaxed kurtas, and airy daily staples crafted from certified organic flax linen suited for the Sri Lankan climate.',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1000&h=700&fit=crop',
      category: "Men's Wear",
      itemsCount: '32 Styles'
    },
    {
      id: 'lookbook-3',
      title: 'Festive Lehengas & Occasion Gowns',
      tagline: 'Celebratory Splendor',
      description: 'Voluminous party lehengas, shimmering georgette dupattas, and contemporary gowns meant to illuminate weddings and gala evenings.',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&h=700&fit=crop',
      category: 'Party Wear',
      itemsCount: '19 Masterpieces'
    },
    {
      id: 'lookbook-4',
      title: 'Artisanal Fabrics by the Yard',
      tagline: 'For Custom Tailoring & Designers',
      description: 'Pure silks, natural vegetable-dyed block printed cottons, and brocades sourced directly for boutique creators and custom ateliers.',
      image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1000&h=700&fit=crop',
      category: 'Fabrics',
      itemsCount: '67 Fabric Rolls'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          Editorial Showcase
        </span>
        <h1 className="font-heading text-4xl font-extrabold text-slate-900">
          Curated Collections
        </h1>
        <p className="text-sm text-slate-500">
          Explore thematic chapters curated by our Colombo studio stylists, celebrating artisanal craft, sustainable textiles, and modern South Asian fashion.
        </p>
      </div>

      {/* Lookbooks Grid */}
      <div className="space-y-12">
        {curatedLookbooks.map((book, idx) => (
          <div
            key={book.id}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs hover:shadow-card transition-all ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            <div className={`lg:col-span-6 space-y-4 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-lg">
                <span>{book.itemsCount}</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {book.title}
              </h2>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                {book.tagline}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {book.description}
              </p>
              <div className="pt-2">
                <Link
                  to={`/shop?category=${encodeURIComponent(book.category)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-md transition-all group"
                >
                  <span>Explore {book.category}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className={`lg:col-span-6 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <div className="rounded-2xl overflow-hidden aspect-[16/10] shadow-md group">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
