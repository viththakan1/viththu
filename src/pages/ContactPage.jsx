import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export const ContactPage = () => {
  const { settings, addMessage } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [faqOpen, setFaqOpen] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    addMessage({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject || 'General Inquiry',
      message: formData.message,
      type: 'contact'
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const faqs = [
    {
      q: 'How long does islandwide delivery take?',
      a: 'Deliveries across the Colombo metropolitan area usually take 1-2 business days. For outstation districts (Kandy, Galle, Jaffna, Matara, etc.), parcels arrive within 3-5 business days via trusted tracked couriers.'
    },
    {
      q: 'Is Cash on Delivery (COD) available everywhere in Sri Lanka?',
      a: 'Yes, we provide Cash on Delivery across major cities and postal zones throughout Sri Lanka. You can conveniently pay in cash to the delivery agent upon receiving your order.'
    },
    {
      q: 'Can I order directly through WhatsApp?',
      a: 'Absolutely! Many of our valued patrons prefer WhatsApp. You can click any "Order via WhatsApp" button on product cards or the cart, and our team will personally assist with sizing, photo confirmations, and dispatch.'
    },
    {
      q: 'Do you offer custom saree blouses or tailoring services?',
      a: 'Yes, we provide bespoke blouse stitching, saree fall/pico finishes, and custom kurta tailoring upon request through our studio team.'
    },
    {
      q: 'What is your return & exchange policy?',
      a: 'We accept returns and exchanges within 7 calendar days of receipt for unused, unworn items in their original packaging with tags intact. Handloom fabric cut-lengths are non-refundable once cut.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-700">Get in Touch</span>
        <h1 className="font-heading text-4xl font-extrabold text-slate-900">
          Contact AxisX Studio
        </h1>
        <p className="text-sm text-slate-500">
          Have a question about our handwoven sarees, pure linen wear, wholesale bolts, or need styling advice? We are always happy to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info & Studio Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <h3 className="font-heading text-xl font-bold text-slate-900">
              Studio & Atelier Information
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Colombo Studio</h4>
                  <p className="mt-0.5 leading-relaxed">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Direct Phone</h4>
                  <p className="mt-0.5 font-medium">{settings.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Email Inquiries</h4>
                  <p className="mt-0.5 font-medium">{settings.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Studio Hours</h4>
                  <p className="mt-0.5 leading-relaxed">{settings.hours}</p>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Action */}
            <div className="pt-4 border-t border-slate-100">
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=Hello%20AxisX%20Store!%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp ({settings.whatsapp})</span>
              </a>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <h3 className="font-heading text-xl font-bold text-slate-900">
              Send Us a Message
            </h3>
            <p className="text-xs text-slate-500">
              Fill in your details and message below. Our client concierge team will respond within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kasun Fernando"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +94 77 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. kasun@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Bulk Silk Order / Custom Size"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message *</label>
                <textarea
                  required
                  rows="4"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you with our textiles, designs, or order inquiries?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md hover:shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="pt-8 border-t border-slate-200 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-700 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-600" />
            Frequently Asked Questions
          </span>
          <h2 className="font-heading text-3xl font-bold text-slate-900">
            Common Customer Queries
          </h2>
        </div>

        <div className="space-y-3 pt-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? -1 : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 hover:text-cyan-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    faqOpen === idx ? 'rotate-180 text-cyan-600' : ''
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-2 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
