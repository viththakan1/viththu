import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('admin@axisxstudio.co');
  const [password, setPassword] = useState('axisx2026');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('admin-demo-auth', 'ok');
    localStorage.setItem('admin-demo-gate', 'ok');
    navigate('/admin');
  };

  const handleOneClickDemo = () => {
    localStorage.setItem('admin-demo-auth', 'ok');
    localStorage.setItem('admin-demo-gate', 'ok');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f5fa] via-[#e8f8fc] to-[#f4fcfe] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-cyan-100 p-8 sm:p-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-slate-200 flex items-center justify-center p-3 mx-auto shadow-md">
            <img src="/haveitall-logo.png" alt="HAVEITALL" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 uppercase">
            HAVEITALL Admin Studio
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to manage inventory, customer orders, categories & store settings.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500 bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md hover:shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-semibold uppercase">Or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* 1-Click Quick Demo Login */}
        <button
          onClick={handleOneClickDemo}
          className="w-full py-3 rounded-xl border border-amber-500/40 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>1-Click Demo Login (Instant Access)</span>
        </button>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-400 hover:text-cyan-700 transition-colors">
            &larr; Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
