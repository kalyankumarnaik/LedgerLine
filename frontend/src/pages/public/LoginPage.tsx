import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { VaultHeroIllustration } from '../../components/ui/VaultHeroIllustration';
import {
  Scale,
  Lock,
  User,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide your username or email, and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authService.login({ username, password });
      login(res.token, res.refreshToken, res.user);

      // Route according to user role
      if (res.user.roles.includes('ROLE_ADMIN')) {
        navigate('/admin/dashboard');
      } else if (res.user.roles.includes('ROLE_AUDITOR')) {
        navigate('/auditor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (userVal: string) => {
    setUsername(userVal);
    setPassword('Password@123!');
  };

  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-violet-600/25 via-fuchsia-500/20 via-emerald-500/15 to-transparent blur-[150px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-gradient-to-br from-cyan-500/20 to-blue-600/15 blur-[140px] pointer-events-none -z-10 animate-float" />
      <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-emerald-500/20 to-teal-600/15 blur-[140px] pointer-events-none -z-10 animate-float-delayed" />

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Visual Theme Showcase with Vault Hero Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:col-span-7 flex-col justify-center items-center text-left space-y-6 pr-4"
        >
          <div className="w-full space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-violet-500/30 group-hover:scale-105 group-hover:rotate-3 transition-transform">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black tracking-tight text-white">
                Balance<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400">Vault</span>
              </span>
            </Link>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Provable FinTech <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 via-cyan-400 to-emerald-300 animate-gradient inline-block">
                Double-Entry Platform
              </span>
            </h1>

            <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
              Every balance mathematically conserved. Row-level concurrency locking via PostgreSQL <code className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">SELECT FOR UPDATE</code> with zero overdraft guarantees.
            </p>
          </div>

          {/* Theme Illustration Component */}
          <div className="w-full my-2">
            <VaultHeroIllustration />
          </div>

          {/* Security Guarantee Badges */}
          <div className="w-full flex flex-wrap gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Non-Negative Constraint
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-950/60 border border-violet-500/40 text-violet-300 font-semibold shadow-xs">
              <Lock className="w-3.5 h-3.5 text-violet-400" /> Deterministic UUID Locking
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> SHA-256 Idempotency
            </span>
          </div>
        </motion.div>

        {/* Right Column: Sleek Glassmorphic Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full lg:col-span-5 max-w-md mx-auto"
        >
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Balance<span className="text-violet-400">Vault</span>
              </span>
            </Link>
            <h2 className="mt-3 text-xl font-black text-white tracking-tight">Sign in to your account</h2>
          </div>

          <div className="bg-navy-900/90 backdrop-blur-2xl py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-violet-500/30 card-glow-violet card-holographic relative">
            <div className="hidden lg:block mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
              <p className="mt-1 text-xs text-slate-400">
                Sign in to access your accounts and provable transaction ledger.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or alex"
                    className="w-full px-4 py-2.5 bg-navy-950/80 border border-navy-700 focus:border-violet-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-white font-medium transition-all"
                  />
                  <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-violet-400 hover:text-violet-300 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 bg-navy-950/80 border border-navy-700 focus:border-violet-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-white font-medium transition-all"
                  />
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full mt-2 shadow-lg shadow-violet-600/30 py-3 text-sm font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:opacity-95"
              >
                Sign In to BalanceVault
              </Button>
            </form>

            {/* Quick Demo Autofill Chips */}
            <div className="mt-8 pt-6 border-t border-navy-800">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Demonstration Login</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => autofill('admin')}
                  className="px-2.5 py-2 rounded-xl border border-violet-500/40 bg-violet-950/40 text-violet-300 text-xs font-bold hover:bg-violet-900/60 hover:border-violet-400 transition-all shadow-sm flex flex-col items-center gap-0.5"
                >
                  <span>Admin</span>
                  <span className="text-[9px] font-mono text-violet-400 font-normal">Superuser</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => autofill('alex')}
                  className="px-2.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60 hover:border-emerald-400 transition-all shadow-sm flex flex-col items-center gap-0.5"
                >
                  <span>Holder</span>
                  <span className="text-[9px] font-mono text-emerald-400 font-normal">Client</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => autofill('sarah')}
                  className="px-2.5 py-2 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-300 text-xs font-bold hover:bg-amber-900/60 hover:border-amber-400 transition-all shadow-sm flex flex-col items-center gap-0.5"
                >
                  <span>Auditor</span>
                  <span className="text-[9px] font-mono text-amber-400 font-normal">Read-Only</span>
                </motion.button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
              New to BalanceVault?{' '}
              <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
                Create an account holder account &rarr;
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
