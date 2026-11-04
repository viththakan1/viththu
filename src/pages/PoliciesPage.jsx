import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Truck, FileText, ChevronRight } from 'lucide-react';

export const PoliciesPage = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Store Policies';
  let icon = <ShieldCheck className="w-6 h-6 text-cyan-600" />;

  if (path === '/return-policy') {
    title = 'Shipping, Return & Exchange Policy';
    icon = <Truck className="w-6 h-6 text-cyan-600" />;
  } else if (path === '/privacy-policy') {
    title = 'Privacy Policy';
    icon = <ShieldCheck className="w-6 h-6 text-cyan-600" />;
  } else if (path === '/terms-of-service') {
    title = 'Terms of Service';
    icon = <FileText className="w-6 h-6 text-cyan-600" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-cyan-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">{title}</span>
      </nav>

      <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Last updated: April 2026 • HAVEITALL Sri Lanka</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        {path === '/return-policy' && (
          <>
            <h3 className="font-heading text-lg font-bold text-slate-900">1. Islandwide Sri Lanka Delivery</h3>
            <p>
              We deliver to all addresses within Sri Lanka via reputable domestic courier partners. Standard deliveries are dispatched within 24-48 business hours from our Colombo atelier and typically reach destinations within 3 to 5 business days.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Free delivery is granted for single orders totaling LKR 5,000 or more.</li>
              <li>Orders below LKR 5,000 are subject to a flat domestic shipping charge of LKR 450.</li>
              <li>Couriers will attempt delivery twice and notify you via SMS/phone before arrival.</li>
            </ul>

            <h3 className="font-heading text-lg font-bold text-slate-900 pt-4">2. Returns & Exchanges</h3>
            <p>
              We want you to be completely satisfied with your HAVEITALL purchase. Items may be returned or exchanged within 7 days from the delivery date, subject to the following criteria:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Items must be unopened, untampered, and with all original manufacturer seals and packaging intact.</li>
              <li>Opened cosmetics, used skincare bottles, and personal hygiene products are non-refundable for hygiene safety.</li>
              <li>Exchanges or returns can be initiated effortlessly via WhatsApp support with photos of the unboxed package.</li>
            </ul>
          </>
        )}

        {path === '/privacy-policy' && (
          <>
            <h3 className="font-heading text-lg font-bold text-slate-900">1. Information We Collect</h3>
            <p>
              We collect details required to fulfill and dispatch your orders, including your name, delivery address, phone number, and email. We do not store sensitive credit card or banking login details on our servers.
            </p>

            <h3 className="font-heading text-lg font-bold text-slate-900 pt-4">2. WhatsApp Communications</h3>
            <p>
              When opting into our WhatsApp concierge or customer service, we use your number strictly to send order confirmation details, courier tracking IDs, and direct assistance requested by you.
            </p>

            <h3 className="font-heading text-lg font-bold text-slate-900 pt-4">3. Data Security</h3>
            <p>
              We employ strict industry-standard encryption protocols to ensure that all customer interactions and records remain strictly private and protected.
            </p>
          </>
        )}

        {path === '/terms-of-service' && (
          <>
            <h3 className="font-heading text-lg font-bold text-slate-900">1. Product Descriptions & Photography</h3>
            <p>
              We take great pride in capturing true-to-life colors, formulations, and packaging. Because cosmetic shades and botanical skincare extracts may display subtle variations depending on display lighting and screen calibration, descriptions and ingredient lists serve as verified benchmarks.
            </p>

            <h3 className="font-heading text-lg font-bold text-slate-900 pt-4">2. Pricing and Currencies</h3>
            <p>
              All prices shown on the store are listed in Sri Lankan Rupees (LKR) inclusive of applicable local charges unless expressly stated otherwise.
            </p>

            <h3 className="font-heading text-lg font-bold text-slate-900 pt-4">3. Governing Law</h3>
            <p>
              These terms are governed and construed under the applicable laws and commercial regulations of the Democratic Socialist Republic of Sri Lanka.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
