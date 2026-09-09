import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export const LoginPage = () => {
  const { loginWithCredentials, loading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim()) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    try {
      const loggedUser = await loginWithCredentials(email.trim(), password.trim());
      
      // Strict Role Redirection:
      // christy@skct.edu.in + queryhub@123 -> Trainer Portal (/trainer)
      // All other email IDs -> Student Dashboard (/dashboard)
      if (loggedUser.role === 'TRAINER' || loggedUser.role === 'PROFESSOR') {
        navigate('/trainer');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#081F5C] flex items-center justify-center p-4 font-sans text-slate-900 relative overflow-hidden">
      {/* Background Graphic Accent Overlay */}
      <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#D0E3FF]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/3 top-0 w-64 h-64 bg-[#D0E3FF]/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <img 
            src={logoImg} 
            alt="QueryHub Logo" 
            className="w-20 h-20 object-contain rounded-2xl mx-auto shadow-2xl border-2 border-[#D0E3FF]/40 bg-white p-1.5 hover:scale-105 transition-transform" 
          />
          <h1 className="text-3xl font-black tracking-tight text-white">
            QueryHub
          </h1>
          <p className="text-xs text-[#D0E3FF] font-semibold tracking-wide">
            Smart Learning Platform & Virtual Lab
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white border border-[#D0E3FF]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-100 pb-4 text-center">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Sign In to Your Account</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your email and password to access QueryHub</p>
          </div>

          {(localError || error) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold text-center">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@skct.edu.in or student@gmail.com"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#081F5C] hover:bg-[#061848] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to QueryHub'}</span>
              <ArrowRight className="w-4 h-4 text-[#D0E3FF]" />
            </button>
          </form>
        </div>

        {/* Footer Badges */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-[#D0E3FF]/90 font-semibold">
          <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-[#D0E3FF]" /> Qwen AI Engine</span>
          <span>•</span>
          <span>SQLite Interactive Virtual Lab</span>
        </div>

      </div>
    </div>
  );
};
