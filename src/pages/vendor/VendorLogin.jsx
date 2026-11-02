import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  Store,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  Phone,
  Building,
  CreditCard,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Clock,
  AlertCircle,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

export const VendorLogin = () => {
  const { vendorLogin, vendorRegister, vendors } = useStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [registeredData, setRegisteredData] = useState(null);
  const [loginAlert, setLoginAlert] = useState(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regBankName, setRegBankName] = useState('Commercial Bank');
  const [regAccountNo, setRegAccountNo] = useState('');
  const [regAccountHolder, setRegAccountHolder] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginAlert(null);
    const res = vendorLogin(loginEmail, loginPassword);
    if (res.success) {
      navigate('/vendor');
    } else {
      setLoginAlert({
        type: res.pending ? 'pending' : 'error',
        message: res.error
      });
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setLoginAlert(null);
    const res = vendorRegister({
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      address: regAddress,
      bankName: regBankName,
      accountNumber: regAccountNo,
      accountHolder: regAccountHolder
    });
    if (res.success) {
      setRegisteredData({
        name: regName,
        email: regEmail
      });
      setLoginEmail(regEmail);
      setLoginPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 text-white flex flex-col justify-center items-center p-4 py-12">
      {/* Top Bar Switcher */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 text-xs text-slate-400">
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
        <Link to="/dropshipper/login" className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors">
          <span>Are you a dropshipper?</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center mx-auto shadow-md">
            <img src="/haveitall-logo.png" alt="HAVEITALL" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-slate-900">
              Vendor Portal
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase">
              HAVEITALL
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Sell your products on HAVEITALL marketplace.
          </p>
        </div>

        {registeredData ? (
          <div className="text-center py-2 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Pending Admin Approval
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Application Received!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for applying to sell on <strong>HAVEITALL</strong>. Your store account <strong>"{registeredData.name}"</strong> has been submitted.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Admin Approval Required:</strong> To maintain catalog authenticity, store administrators must review and activate each new vendor account before login.
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 pt-1 border-t border-slate-200/60">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Registered Email: <span className="font-mono font-medium text-slate-800">{registeredData.email}</span></span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Once approved by the admin, you can log in with your password to begin selling.</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRegisteredData(null);
                  setActiveTab('login');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Vendor Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/"
                className="block text-center text-xs text-slate-500 hover:text-slate-800 py-1 transition-colors"
              >
                Back to Storefront
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginAlert(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-indigo-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Vendor Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setLoginAlert(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-indigo-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Apply to Sell (Register)
              </button>
            </div>

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginAlert && (
                  <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                    loginAlert.type === 'pending'
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}>
                    {loginAlert.type === 'pending' ? (
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">
                        {loginAlert.type === 'pending' ? 'Application Awaiting Approval' : 'Unable to Sign In'}
                      </p>
                      <p className="text-[11px] mt-0.5 leading-relaxed text-slate-600">
                        {loginAlert.message}
                      </p>
                    </div>
                  </div>
                )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="vendor@haveitall.lk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Access Vendor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store / Brand Name *
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="e.g. Ceylon Crafts LK"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="contact@store.lk"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone (Pickup Contact) *
                </label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="0771234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={regBankName}
                  onChange={e => setRegBankName(e.target.value)}
                  placeholder="Commercial Bank"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pickup Address (For FED Courier) *
              </label>
              <textarea
                required
                rows={2}
                value={regAddress}
                onChange={e => setRegAddress(e.target.value)}
                placeholder="No, Street, City, Sri Lanka"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={regAccountNo}
                  onChange={e => setRegAccountNo(e.target.value)}
                  placeholder="800123456"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Holder
                </label>
                <input
                  type="text"
                  value={regAccountHolder}
                  onChange={e => setRegAccountHolder(e.target.value)}
                  placeholder="Account name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Submit Vendor Application</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </form>
          )}
        </>
      )}
      </div>
    </div>
  );
};

