import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { SRI_LANKA_DISTRICTS } from '../utils/sriLankaDistricts';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const CustomerAuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentCustomer, customerLogin, customerRegister, showToast } = useStore();

  const redirectPath = searchParams.get('redirect') || '/profile';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone1: '',
    phone2: '',
    address: '',
    district: 'Colombo',
    dob: ''
  });

  // If already logged in, redirect
  useEffect(() => {
    if (currentCustomer) {
      navigate(redirectPath, { replace: true });
    }
  }, [currentCustomer, navigate, redirectPath]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await customerLogin(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerData.name.trim() || !registerData.email.trim() || !registerData.password) {
      showToast('Please fill in your name, email, and password', 'error');
      return;
    }
    if (!registerData.phone1.trim()) {
      showToast('Please enter at least one telephone number', 'error');
      return;
    }
    if (registerData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await customerRegister(registerData);
    setIsSubmitting(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] py-10 sm:py-16 px-4 bg-gradient-to-b from-cyan-50/40 via-white to-slate-50 flex items-center justify-center">
      <div className="w-full max-w-xl">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100/80 text-cyan-900 text-xs font-bold mb-3 border border-cyan-200/60 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>HAVEITALL Customer Hub</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Customer Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {mode === 'login'
              ? 'Sign in to access your personal profile, track orders in real-time, and view your purchase history.'
              : 'Join HAVEITALL to enjoy fast checkout, track parcels across Sri Lanka, and manage your delivery details.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Segmented Mode Switcher */}
          <div className="p-2 bg-slate-100/80 m-4 rounded-2xl flex items-center gap-1 border border-slate-200/50">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-cyan-600" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
              <span>Register New Account</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {mode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                >
                  {isSubmitting ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In to Customer Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-cyan-700 font-bold hover:underline cursor-pointer"
                    >
                      Create one now
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder="e.g. Kasun Perera"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email and Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="kasun@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="At least 6 chars"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Telephone No 1 & Telephone No 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Telephone No 1 (Primary) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={registerData.phone1}
                        onChange={(e) => setRegisterData({ ...registerData, phone1: e.target.value })}
                        placeholder="077 123 4567"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Telephone No 2 (Alternative / WhatsApp)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={registerData.phone2}
                        onChange={(e) => setRegisterData({ ...registerData, phone2: e.target.value })}
                        placeholder="071 987 6543 (optional)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <textarea
                      rows={2}
                      value={registerData.address}
                      onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                      placeholder="e.g. No. 45/2, Temple Road, Mount Lavinia"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white resize-none"
                    />
                  </div>
                </div>

                {/* District & Date of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      District (Sri Lanka)
                    </label>
                    <select
                      value={registerData.district}
                      onChange={(e) => setRegisterData({ ...registerData, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-white cursor-pointer"
                    >
                      {SRI_LANKA_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={registerData.dob}
                        onChange={(e) => setRegisterData({ ...registerData, dob: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-cyan-700 font-bold hover:underline cursor-pointer"
                    >
                      Sign In to your account
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security & Service Note */}
        <div className="mt-6 flex items-center justify-center gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted & Safe Credentials</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span>Islandwide Courier Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

