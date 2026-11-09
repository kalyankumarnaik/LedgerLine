import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import {
  Scale,
  ShieldCheck,
  Lock,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
  Layers,
  Cpu,
  Fingerprint,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 selection:bg-violet-brand selection:text-white overflow-hidden transition-colors">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-violet-600/15 via-emerald-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 via-violet-brand to-emerald-brand flex items-center justify-center text-white shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Ledger<span className="text-violet-brand">Line</span>
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
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
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-6 pt-12 pb-20 text-center z-10"
      >
        {/* Animated Badge */}
        <motion.div variants={itemVariants} className="inline-block">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50/80 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-wide uppercase shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>Provable Double-Entry Fintech Engine</span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          variants={itemVariants}
          className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1] text-slate-900 dark:text-white"
        >
          Every movement accounted for. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-brand via-violet-400 to-emerald-brand">
            Every balance proven.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          A high-integrity double-entry transaction platform engineered with PostgreSQL row-level concurrency protection, strict idempotency replay defense, and provable immutable ledger records.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-lg shadow-violet-500/25">
              Launch Live App <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
              Open Demonstration Account
            </Button>
          </Link>
        </motion.div>

        {/* Live Core Guarantees Pill Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/70 dark:bg-navy-900/70 border border-slate-200 dark:border-navy-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Zero Overdrafts Prohibited
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/70 dark:bg-navy-900/70 border border-slate-200 dark:border-navy-800">
            <Lock className="w-3.5 h-3.5 text-violet-500" /> SELECT FOR UPDATE Ordering
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/70 dark:bg-navy-900/70 border border-slate-200 dark:border-navy-800">
            <Fingerprint className="w-3.5 h-3.5 text-blue-500" /> SHA-256 Idempotency Defense
          </span>
        </motion.div>

        {/* Demo Accounts Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-12 p-5 max-w-3xl mx-auto bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-fintech-lg text-left"
        >
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-navy-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Pre-Configured Demonstration Roles (Password: Password@123!)
            </span>
            <span className="text-[11px] font-mono text-emerald-500 font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60">
              PostgreSQL Seed Ready
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <Link
              to="/login"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/70 dark:border-navy-800 hover:border-violet-400 dark:hover:border-violet-600 transition-all hover:-translate-y-0.5"
            >
              <span className="font-bold text-violet-600 dark:text-violet-400 block mb-0.5">Administrator</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">admin@ledgerline.com</span>
              <span className="block text-[10px] text-slate-400 mt-1">Platform control & approvals →</span>
            </Link>
            <Link
              to="/login"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/70 dark:border-navy-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:-translate-y-0.5"
            >
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Account Holder</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">alex.holder@ledgerline.com</span>
              <span className="block text-[10px] text-slate-400 mt-1">Transfers & receipts →</span>
            </Link>
            <Link
              to="/login"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/70 dark:border-navy-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:-translate-y-0.5"
            >
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Independent Auditor</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">sarah.auditor@ledgerline.com</span>
              <span className="block text-[10px] text-slate-400 mt-1">Immutable ledger audits →</span>
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* Core Architectural Guarantees */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-navy-800/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Architected for Provable Financial Correctness
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Engineered to eliminate financial hazards at the database, transaction, and concurrency levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="p-8 rounded-2xl bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-fintech-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-brand flex items-center justify-center mb-6 shadow-sm shadow-violet-500/20">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Double-Entry Accounting</h3>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every money transfer produces balanced debits and credits ($\sum Debits - \sum Credits = 0$). External funding balances against a reserve clearing account. Total money is strictly conserved.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="p-8 rounded-2xl bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-fintech-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-brand flex items-center justify-center mb-6 shadow-sm shadow-emerald-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pessimistic Row Locking</h3>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Accounts are locked in deterministic natural UUID order via PostgreSQL <code className="text-xs font-mono bg-slate-100 dark:bg-navy-850 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400">SELECT FOR UPDATE</code>. Simultaneous cross-transfers cannot deadlock or overdraft.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="p-8 rounded-2xl bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-fintech-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mb-6 shadow-sm shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Idempotency & Replay Defense</h3>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Unique idempotency keys with SHA-256 payload fingerprinting prevent duplicate debits. Replays return cached responses without repeating double-entry ledger postings.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 relative z-10">
        <div>&copy; 2026 LedgerLine Platform. All rights reserved.</div>
        <div className="flex gap-6 mt-4 sm:mt-0 font-medium font-mono text-[11px]">
          <span className="text-violet-500">Java 21 LTS</span>
          <span className="text-emerald-500">Spring Boot 3.3.5</span>
          <span className="text-blue-500">PostgreSQL 18</span>
          <span className="text-slate-400">React + Vite</span>
        </div>
      </footer>
    </div>
  );
};
