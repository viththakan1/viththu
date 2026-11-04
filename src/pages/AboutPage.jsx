import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  Sparkles,
  Award,
  Users,
  Feather,
  HeartHandshake,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

export const AboutPage = () => {
  const { settings } = useStore();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-b from-cyan-50/70 to-white py-16 lg:py-24 border-b border-cyan-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            Our Mission & Story
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Authentic Skincare, Cosmetics & Lifestyle for Sri Lanka
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            haveitall.lk connects beauty and wellness enthusiasts across Sri Lanka with 100% genuine products sourced directly from official brand websites and authorized global distribution channels.
          </p>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-700">Official Direct Import</span>
            <h2 className="font-heading text-3xl font-bold text-slate-900 leading-snug">
              100% Authentic Global Brands in Sri Lanka
            </h2>
            <p>
              Looking for genuine global brands in Sri Lanka? At haveitall.lk, we buy directly from official brand websites across the globe—so you never have to worry about fakes. Enjoy 100% authentic products with reliable islandwide delivery.
            </p>
            <p>
              Every beauty, skincare, cosmetics, and lifestyle product in our catalog undergoes rigorous quality control. We verify serial numbers, batch seals, and original brand packaging to ensure that every creation delivers pure authenticity.
            </p>
            <p>
              Our flagship operations in Colombo serve as both a concierge hub for customer inquiries and a fulfillment center dispatching daily parcels to every corner of Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=700&fit=crop"
              alt="Skincare Formulas"
              className="rounded-2xl shadow-md object-cover h-64 sm:h-80 w-full"
            />
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=700&fit=crop"
              alt="Authentic Cosmetics"
              className="rounded-2xl shadow-md object-cover h-64 sm:h-80 w-full mt-6"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-700">What Drives Us</span>
            <h2 className="font-heading text-3xl font-bold text-slate-900">Our Pillars of Excellence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Feather className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">100% Genuine Brands</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct official imports from brand portals. Zero counterfeits, verified manufacturer seals and batch numbers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">Clean & Potent Formulas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dermatologist-tested skincare, active serums, and high-performance cosmetics formulated with premium ingredients.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">Safe Islandwide Dispatch</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Carefully packaged with temperature and shock protection to ensure every cream, serum, and bottle arrives fresh.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">Beauty Concierge</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dedicated WhatsApp support to answer regimen questions, check expiration dates, and assist with orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Location & Hours */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">Customer Support & Dispatch</span>
            <h3 className="font-heading text-3xl font-bold">HAVEITALL Operations Hub</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Serving customers islandwide across Sri Lanka with direct WhatsApp support, batch tracking, and fast doorstep delivery.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{settings.hours}</span>
              </p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-colors"
            >
              <span>Get in Touch or Book Visit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
