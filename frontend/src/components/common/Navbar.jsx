import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './Badge';
import { Button } from './Button';
import { Modal } from './Modal';
import { Database, Cpu, ShieldCheck, LogIn, LogOut, User, Lock, KeyRound, Terminal, PlayCircle, Trophy, BarChart2 } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

export const Navbar = () => {
  const { user, loginWithCredentials, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [trainerEmail, setTrainerEmail] = useState('christy@skct.edu.in');
  const [trainerPassword, setTrainerPassword] = useState('queryhub@123');
  const [authError, setAuthError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleTrainerLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoggingIn(true);
    try {
      const loggedUser = await loginWithCredentials(trainerEmail, trainerPassword, 'Prof. Christy (SKCT)');
      setLoginModalOpen(false);
      setProfileMenuOpen(false);
      navigate('/trainer');
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-edwin-midnight text-white shadow-md sticky top-0 z-40 border-b border-edwin-dawn/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={logoImg} 
            alt="QueryHub Logo" 
            className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow-md border border-edwin-dawn/40 hover:scale-105 transition-transform" 
          />
          <h1 className="font-extrabold text-xl leading-tight tracking-tight text-white">
            QueryHub
          </h1>
        </div>

        {/* Navigation Quick Links */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => navigate('/student/dbms-lab')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-edwin-dawn hover:bg-white/10 transition border border-transparent hover:border-edwin-dawn/30"
          >
            <Terminal className="w-4 h-4 text-emerald-400" /> DBMS Virtual Lab
          </button>

          <button
            onClick={() => navigate('/student/dbms-lab/practice')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-edwin-dawn hover:bg-white/10 transition border border-transparent hover:border-edwin-dawn/30"
          >
            <Trophy className="w-4 h-4 text-amber-400" /> SQL Practice & Challenges
          </button>

          <button
            onClick={() => navigate('/visualizers')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-edwin-dawn hover:bg-white/10 transition border border-transparent hover:border-edwin-dawn/30"
          >
            <PlayCircle className="w-4 h-4 text-sky-300" /> Visualizers
          </button>
        </div>

        {/* Profile & Trainer Access Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-xl text-xs text-edwin-dawn font-semibold transition-all"
          >
            <img 
              src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
              alt={user?.name || "Profile"} 
              className="w-7 h-7 rounded-full border border-edwin-dawn object-cover"
            />
            <span className="hidden sm:inline text-white font-bold">{user?.name || 'Alex Rivera'}</span>
            <Badge variant={user?.role === 'TRAINER' || user?.role === 'PROFESSOR' ? 'sand' : 'secondary'}>
              {user?.role || 'Student'}
            </Badge>
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-edwin-surface border border-edwin-border rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn text-edwin-midnight">
              <div className="px-4 py-2 border-b border-edwin-border">
                <p className="text-xs font-bold text-edwin-midnight">{user?.name || 'Alex Rivera'}</p>
                <p className="text-[10px] text-edwin-navy font-mono">{user?.email || 'alex.rivera@skct.edu.in'}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/student/dbms-lab');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-edwin-midnight hover:bg-edwin-dawn/40 flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4 text-emerald-600" /> SQL IDE Virtual Lab
                </button>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/student/dbms-lab/analytics');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-edwin-midnight hover:bg-edwin-dawn/40 flex items-center gap-2"
                >
                  <BarChart2 className="w-4 h-4 text-indigo-600" /> Competency Analytics
                </button>
              </div>

              {user?.role === 'TRAINER' || user?.role === 'PROFESSOR' ? (
                <>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('/trainer');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-edwin-midnight hover:bg-edwin-dawn/40 flex items-center gap-2 border-t border-edwin-border/60"
                  >
                    <ShieldCheck className="w-4 h-4 text-edwin-accent" /> Open Trainer Portal
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('/trainer/dbms-lab');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-edwin-midnight hover:bg-edwin-dawn/40 flex items-center gap-2"
                  >
                    <Terminal className="w-4 h-4 text-[#081F5C]" /> Trainer DBMS Lab Dashboard
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-edwin-midnight hover:bg-edwin-dawn/40 flex items-center gap-2 border-t border-edwin-border/60"
                >
                  <KeyRound className="w-4 h-4 text-edwin-accent" /> Trainer Portal Login
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-edwin-border/60 mt-1"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trainer Login Modal */}
      <Modal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        title="Trainer / Instructor Portal Login"
      >
        <form onSubmit={handleTrainerLogin} className="space-y-4">
          <div className="p-3 bg-edwin-dawn/30 text-edwin-midnight rounded-xl text-xs flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-edwin-midnight shrink-0" />
            <span>Enter trainer credentials to manage PPT slides and monitor student visitors.</span>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold">
              {authError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-edwin-midnight mb-1">Trainer Email</label>
            <input 
              type="email"
              required
              placeholder="christy@skct.edu.in"
              value={trainerEmail}
              onChange={(e) => setTrainerEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-edwin-border rounded-xl text-edwin-midnight focus:outline-none focus:ring-2 focus:ring-edwin-navy font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-edwin-midnight mb-1">Trainer Password</label>
            <input 
              type="password"
              required
              placeholder="DBMS@123"
              value={trainerPassword}
              onChange={(e) => setTrainerPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-edwin-border rounded-xl text-edwin-midnight focus:outline-none focus:ring-2 focus:ring-edwin-navy font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setLoginModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loggingIn} icon={LogIn}>
              {loggingIn ? 'Authenticating...' : 'Login to Trainer Portal'}
            </Button>
          </div>
        </form>
      </Modal>
    </header>
  );
};
