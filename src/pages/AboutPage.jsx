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
            Our Heritage & Story
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Weaving Stories of Elegance Across Sri Lanka
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            AxisX Store is an artisanal textile atelier and contemporary fashion house founded in Colombo, blending South Asian heritage weaving techniques with refined modern silhouettes.
          </p>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-700">Artisan Roots</span>
            <h2 className="font-heading text-3xl font-bold text-slate-900 leading-snug">
              Preserving Century-Old Weaving Traditions
            </h2>
            <p>
              Founded with a passion for authentic natural fibers, AxisX Store bridges the gap between master weavers across South Asia and the discerning modern customer in Sri Lanka.
            </p>
            <p>
              Each Banarasi silk saree, pure linen kurta, and handblock-printed cotton yard in our studio undergoes rigorous quality control. We examine warp count, zari purity, and seam finishes to ensure that every creation stands the test of celebration and time.
            </p>
            <p>
              Our flagship creative studio in Colombo 03 serves as both an atelier for bespoke fittings and a fulfillment center dispatching daily parcels to every corner of Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=700&fit=crop"
              alt="Loom & Textiles"
              className="rounded-2xl shadow-md object-cover h-64 sm:h-80 w-full"
            />
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=700&fit=crop"
              alt="Silk Saree"
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
              <h3 className="font-heading text-base font-bold text-slate-900">100% Pure Fibers</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We never compromise on synthetic substitutes. Only pure mulberry silks, certified flax linen, and natural combed cottons.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">Fair Artisan Trade</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct partnerships with weaving families guarantee ethical compensations and celebrate generational craft.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">Boutique Perfection</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every single item is individually inspected, steam pressed, and securely packaged before doorstep dispatch.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">Colombo Concierge</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dedicated WhatsApp styling assistance to help you pick colors, drape techniques, and custom tailoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Location & Hours */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">Visit Our Atelier</span>
            <h3 className="font-heading text-3xl font-bold">AxisX Colombo Studio</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Experience the touch of our pure silks in person. Our studio is conveniently situated along Galle Road in Colombo 03 with customer parking.
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
