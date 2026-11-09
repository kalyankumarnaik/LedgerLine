import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Scale, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';

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
    <div className="relative min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/10 via-emerald-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
      >
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 via-violet-brand to-emerald-brand flex items-center justify-center text-white shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Ledger<span className="text-violet-brand">Line</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sign in to your account</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-violet-brand hover:underline">
            open a new account holder account
          </Link>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-fintech-lg rounded-2xl border border-slate-200/90 dark:border-navy-800">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or alex.holder@ledgerline.com"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-medium transition-all"
                />
                <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-violet-brand hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-medium transition-all"
                />
                <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full mt-2 shadow-md shadow-violet-500/25">
              Sign In to LedgerLine
            </Button>
          </form>

          {/* Quick Demo Autofill Chips */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-navy-800">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 text-center">
              Quick Demo Role Login (One-Click)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => autofill('admin')}
                className="px-2.5 py-1.5 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 text-xs font-bold hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors shadow-sm"
              >
                Admin
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => autofill('alex')}
                className="px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm"
              >
                Holder
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => autofill('sarah')}
                className="px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors shadow-sm"
              >
                Auditor
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
