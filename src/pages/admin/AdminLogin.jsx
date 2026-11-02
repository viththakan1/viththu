import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useStore();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    // Authenticate with configured admin credentials
    if (trimmedEmail === 'viththakan2001@gmail.com' && password === 'admin1234') {
      localStorage.setItem('admin-demo-auth', 'ok');
      localStorage.setItem('admin-demo-gate', 'ok');
      showToast('Welcome back, Admin!');
      navigate('/admin');
    } else {
      setError('Invalid admin credentials. Please enter the correct email and password.');
      showToast('Invalid admin email or password', 'error');
    }
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

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
                placeholder="viththakan2001@gmail.com"
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
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-500 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md hover:shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-400 hover:text-cyan-700 transition-colors">
            &larr; Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
