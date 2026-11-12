import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  Coins,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

interface LedgerSimItem {
  id: string;
  source: string;
  dest: string;
  amount: number;
  drAccount: string;
  crAccount: string;
  type: string;
}

const SIMULATION_DATA: LedgerSimItem[] = [
  {
    id: 'TXN-9021',
    source: 'Alex Holder (Checking)',
    dest: 'Elena Rostova (Checking)',
    amount: 1500,
    drAccount: 'ACC-INR-1001 (Dr)',
    crAccount: 'ACC-INR-1002 (Cr)',
    type: 'P2P Transfer',
  },
  {
    id: 'TXN-9022',
    source: 'External UPI Network',
    dest: 'Alex Holder (Checking)',
    amount: 25000,
    drAccount: 'SYS-CLEARING-INR-001 (Dr)',
    crAccount: 'ACC-INR-1001 (Cr)',
    type: 'External Deposit',
  },
  {
    id: 'TXN-9023',
    source: 'Elena Rostova (Checking)',
    dest: 'ATM Cash Reserve',
    amount: 4000,
    drAccount: 'ACC-INR-1002 (Dr)',
    crAccount: 'SYS-CLEARING-INR-001 (Cr)',
    type: 'ATM Withdrawal',
  },
];

export const LandingPage: React.FC = () => {
  const [simIndex, setSimIndex] = useState(0);

  const currentSim = SIMULATION_DATA[simIndex];

  const handleNextSim = () => {
    setSimIndex((prev) => (prev + 1) % SIMULATION_DATA.length);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 selection:bg-violet-brand selection:text-white overflow-hidden transition-colors">
      {/* Ambient multi-chromatic background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-violet-600/20 via-fuchsia-500/15 via-emerald-500/15 to-transparent blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-1/3 -left-40 w-[550px] h-[550px] bg-gradient-to-br from-cyan-500/15 to-blue-600/15 blur-[150px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-500/15 to-teal-600/10 blur-[150px] pointer-events-none -z-10 animate-float-delayed" />

      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 group-hover:scale-105 group-hover:rotate-3 transition-transform">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Balance<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-brand to-emerald-brand">Vault</span>
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
            <Button variant="primary" size="md" className="shadow-lg shadow-violet-500/25">
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
        className="relative max-w-7xl mx-auto px-6 pt-10 pb-16 text-center z-10"
      >
        {/* Animated Badge */}
        <motion.div variants={itemVariants} className="inline-block">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50/90 dark:bg-violet-950/70 border border-violet-300 dark:border-violet-700/80 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-wide uppercase shadow-md shadow-violet-500/10">
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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 via-sky-500 to-emerald-400 dark:from-violet-400 dark:via-fuchsia-300 dark:to-emerald-300 animate-gradient inline-block">
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
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-xl shadow-violet-500/30">
              Launch Live App <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 hover:border-violet-400">
              Open Demonstration Account
            </Button>
          </Link>
        </motion.div>

        {/* Live Core Guarantees Pill Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Zero Overdrafts Prohibited
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 text-violet-700 dark:text-violet-300 font-semibold shadow-xs">
            <Lock className="w-3.5 h-3.5 text-violet-500" /> SELECT FOR UPDATE Locking
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 font-semibold shadow-xs">
            <Fingerprint className="w-3.5 h-3.5 text-sky-500" /> SHA-256 Idempotency Defense
          </span>
        </motion.div>

        {/* Live Interactive Double-Entry Simulation Ticker */}
        <motion.div
          variants={itemVariants}
          className="mt-12 max-w-4xl mx-auto p-6 bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl border border-violet-200/60 dark:border-navy-800 rounded-3xl shadow-xl card-glow-violet text-left"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Live Double-Entry Core Engine Simulation
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    Math Verified
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every transaction writes balanced journal entries: &Sigma; Debits &minus; &Sigma; Credits = 0.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextSim}
              className="text-xs font-semibold gap-1.5 self-start sm:self-auto border-violet-300 dark:border-navy-700 hover:border-violet-500 text-violet-600 dark:text-violet-400"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Next Scenario
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSim.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Transaction Spec */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Transaction Event
                </span>
                <div className="mt-1 font-bold text-slate-900 dark:text-white text-sm">
                  {currentSim.type}
                </div>
                <div className="font-mono text-xs text-violet-600 dark:text-violet-400 mt-0.5">
                  {currentSim.id}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Amount: </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ₹{currentSim.amount.toLocaleString('en-IN')}.00
                  </span>
                </div>
              </div>

              {/* Debit Posting */}
              <div className="p-3.5 rounded-2xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Debit Entry (DR)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400 px-1.5 py-0.2 rounded bg-violet-100 dark:bg-violet-900/60">
                    +DEBIT
                  </span>
                </div>
                <div className="mt-1 font-mono font-bold text-sm text-violet-900 dark:text-violet-200">
                  {currentSim.drAccount}
                </div>
                <div className="mt-2 font-mono text-xs font-black text-violet-700 dark:text-violet-300">
                  ₹{currentSim.amount.toLocaleString('en-IN')}.0000
                </div>
              </div>

              {/* Credit Posting */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Credit Entry (CR)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60">
                    +CREDIT
                  </span>
                </div>
                <div className="mt-1 font-mono font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  {currentSim.crAccount}
                </div>
                <div className="mt-2 font-mono text-xs font-black text-emerald-700 dark:text-emerald-300">
                  ₹{currentSim.amount.toLocaleString('en-IN')}.0000
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Demo Roles Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-8 p-5 max-w-4xl mx-auto bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-lg text-left"
        >
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-navy-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Pre-Configured Demonstration Roles (Password: Password@123!)
            </span>
            <span className="text-[11px] font-mono text-emerald-500 font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60">
              1-Click Demo Ready
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <Link
              to="/login"
              className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/80 to-purple-50/40 dark:from-navy-850 dark:to-violet-950/20 border border-violet-200/70 dark:border-violet-900/40 hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-violet-500/10"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-violet-700 dark:text-violet-300">Platform Admin</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold">
                  SUPERUSER
                </span>
              </div>
              <span className="font-mono text-slate-600 dark:text-slate-300 block">admin@ledgerline.com</span>
              <span className="block text-[11px] text-violet-600 dark:text-violet-400 font-medium mt-2">
                Approvals & Risk Monitor &rarr;
              </span>
            </Link>

            <Link
              to="/login"
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-navy-850 dark:to-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-emerald-500/10"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Account Holder</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  CLIENT
                </span>
              </div>
              <span className="font-mono text-slate-600 dark:text-slate-300 block">alex.holder@ledgerline.com</span>
              <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">
                Transfers & Audit Receipts &rarr;
              </span>
            </Link>

            <Link
              to="/login"
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-navy-850 dark:to-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-amber-500/10"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-700 dark:text-amber-300">Independent Auditor</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                  READ-ONLY
                </span>
              </div>
              <span className="font-mono text-slate-600 dark:text-slate-300 block">sarah.auditor@ledgerline.com</span>
              <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-2">
                Immutable Ledger Audits &rarr;
              </span>
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* Core Architectural Guarantees */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-navy-800/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-500">
            Provable Financial Security
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Engineered for Mathematical Invariants
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Eliminates financial hazards at the database, transaction, and concurrency levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="card-holographic p-8 rounded-3xl bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-xl hover:border-violet-400/80 dark:hover:border-violet-600/80 transition-all card-glow-violet"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-violet-500/25">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Double-Entry Accounting</h3>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every money transfer produces balanced debits and credits (&Sigma; Debits &minus; &Sigma; Credits = 0). External funding balances against a reserve clearing account. Total money is strictly conserved.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="card-holographic p-8 rounded-3xl bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-xl hover:border-emerald-400/80 dark:hover:border-emerald-600/80 transition-all card-glow-emerald"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-500/25">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pessimistic Row Locking</h3>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Accounts are locked in deterministic natural UUID order via PostgreSQL <code className="text-xs font-mono bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400">SELECT FOR UPDATE</code>. Simultaneous cross-transfers cannot deadlock or overdraft.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="card-holographic p-8 rounded-3xl bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-xl hover:border-sky-400/80 dark:hover:border-sky-600/80 transition-all card-glow-sky"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-sky-500/25">
              <Fingerprint className="w-6 h-6" />
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
        <div>&copy; 2026 BalanceVault Platform (formerly LedgerLine). All rights reserved.</div>
        <div className="flex gap-6 mt-4 sm:mt-0 font-medium font-mono text-[11px]">
          <span className="text-violet-500">Java 21 LTS</span>
          <span className="text-emerald-500">Spring Boot 3.3.5</span>
          <span className="text-sky-500">PostgreSQL 18</span>
          <span className="text-slate-400">React + Vite</span>
        </div>
      </footer>
    </div>
  );
};
