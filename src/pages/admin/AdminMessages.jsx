import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageSquare, Mail, Phone, Check, Clock, ExternalLink, Trash2 } from 'lucide-react';

export const AdminMessages = () => {
  const { messages, markMessageAsRead, deleteMessage } = useStore();
  const [selectedTab, setSelectedTab] = useState('all');

  const filtered = messages.filter(m => {
    if (selectedTab === 'unread') return !m.read;
    if (selectedTab === 'read') return m.read;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
            Customer Inquiries & Messages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review customer product questions, wholesale requests, and contact inquiries ({messages.length} total).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTab === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setSelectedTab('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTab === 'unread' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Unread ({messages.filter(m => !m.read).length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No messages in this category</p>
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 rounded-2xl border transition-all bg-white shadow-xs ${
                msg.read ? 'border-slate-100' : 'border-cyan-200 bg-cyan-50/20 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-slate-900">{msg.name}</span>
                  {!msg.read && (
                    <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">• {msg.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  {msg.phone && (
                    <a
                      href={`https://wa.me/${msg.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(msg.name)},%20this%20is%20HAVEITALL%20following%20up%20on%20your%20inquiry.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reply on WhatsApp</span>
                    </a>
                  )}
                  {!msg.read && (
                    <button
                      onClick={() => markMessageAsRead(msg.id)}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this inquiry from MongoDB?')) {
                        deleteMessage(msg.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-3 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800">
                  Subject: {msg.subject || 'General Inquiry'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">{msg.message}</p>
                <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-400">
                  {msg.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{msg.email}</span>
                    </span>
                  )}
                  {msg.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{msg.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
