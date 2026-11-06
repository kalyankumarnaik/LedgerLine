import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  Scale,
  ShieldCheck,
  Lock,
  ArrowRight,
  Database,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 selection:bg-violet-brand selection:text-white">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 via-violet-brand to-emerald-brand flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Ledger<span className="text-violet-brand">Line</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="md">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="md">
              Create Account
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-wide uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>Next-Generation Fintech Core Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1] text-slate-900 dark:text-white">
          Every movement accounted for. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-brand via-violet-400 to-emerald-brand">
            Every balance proven.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
          A high-integrity double-entry transaction engine with PostgreSQL row-level concurrency protection, strict idempotency replay defense, and provable immutable ledger records.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
              Launch Live App <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
              Open Demonstration Account
            </Button>
          </Link>
        </div>

        {/* Demo Accounts Bar */}
        <div className="mt-12 p-4 max-w-3xl mx-auto bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-fintech text-left">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-navy-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pre-Configured Demonstration Roles (Password: Password@123!)
            </span>
            <span className="text-[11px] font-mono text-emerald-500 font-semibold">PostgreSQL Seed Ready</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800">
              <span className="font-bold text-violet-600 dark:text-violet-400 block">Administrator</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">admin@ledgerline.com</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Account Holder</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">alex.holder@ledgerline.com</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800">
              <span className="font-bold text-amber-600 dark:text-amber-400 block">Independent Auditor</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">sarah.auditor@ledgerline.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Guarantees */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-navy-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Architected for Financial Correctness
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Designed to eliminate financial hazards at the database, transaction, and concurrency levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-brand flex items-center justify-center mb-6">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Double-Entry Accounting</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every money transfer produces balanced debits and credits. External funding balances against a reserve clearing account. Total money is strictly conserved.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-brand flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pessimistic Row Locking</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Accounts are locked in deterministic order via PostgreSQL <code className="text-xs bg-slate-100 dark:bg-navy-850 px-1.5 py-0.5 rounded">SELECT FOR UPDATE</code>. Simultaneous withdrawals cannot overdraw accounts or deadlock.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Idempotency & Replay Defense</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Unique idempotency keys with SHA-256 payload fingerprinting prevent duplicate debits. Replays return cached responses without repeating postings.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <div>&copy; 2026 LedgerLine Platform. All rights reserved.</div>
        <div className="flex gap-6 mt-4 sm:mt-0 font-medium">
          <span>Java 21</span>
          <span>Spring Boot 3.x</span>
          <span>PostgreSQL 18</span>
          <span>React + Vite</span>
        </div>
      </footer>
    </div>
  );
};
