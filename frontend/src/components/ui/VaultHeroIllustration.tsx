import React from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  ShieldCheck,
  Lock,
  Cpu,
  Sparkles,
  Zap,
  TrendingUp,
  Fingerprint,
} from 'lucide-react';

export const VaultHeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center p-6 select-none">
      {/* Multi-layered radial chromatic background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 via-fuchsia-500/20 to-emerald-500/25 blur-3xl rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-cyan-500/20 blur-2xl rounded-full pointer-events-none animate-float" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-violet-600/25 blur-2xl rounded-full pointer-events-none animate-float-delayed" />

      {/* Central Cybernetic Vault Core */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Outer Rotating Neon Energy Rings */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-violet-500/30 border-dashed animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border border-cyan-500/30 border-t-emerald-400 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '14s' }} />
          <div className="absolute inset-10 rounded-full border border-fuchsia-500/25 animate-pulse-scale" />

          {/* Central Holographic Sphere */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="w-44 h-44 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-indigo-900 via-violet-950 to-navy-950 p-1 shadow-2xl shadow-violet-600/40 border border-violet-400/40 card-holographic flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            {/* Ambient internal orb */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-violet-500/30 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/30 rounded-full blur-xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-500 via-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-violet-500/40 mb-2">
              <Scale className="w-7 h-7 text-white" />
            </div>

            <div className="font-black text-sm text-white tracking-wider uppercase font-mono">
              Balance<span className="text-emerald-400">Vault</span>
            </div>
            <div className="text-[10px] text-violet-300 font-mono mt-0.5">
              PROVABLE CORE
            </div>

            {/* Glowing Status Dot */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-bold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Invariants Active</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Satellite Card 1: Conserved Capital */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 -left-4 sm:-left-8 p-3.5 rounded-2xl bg-navy-900/90 backdrop-blur-xl border border-emerald-500/40 shadow-xl card-glow-emerald max-w-[200px]"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Conserved Capital
            </span>
          </div>
          <div className="text-sm font-black text-emerald-400 font-mono">
            ₹10,000,000.00
          </div>
          <div className="text-[9px] text-emerald-300/80 font-mono flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Variance: 0.0000 INR</span>
          </div>
        </motion.div>

        {/* Floating Satellite Card 2: Double-Entry Live Posting */}
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -bottom-6 -right-4 sm:-right-8 p-3.5 rounded-2xl bg-navy-900/90 backdrop-blur-xl border border-violet-500/40 shadow-xl card-glow-violet max-w-[210px]"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Double-Entry State
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-200">
            <span className="text-violet-400 font-bold">[DR]</span> ACC-1001 (+₹1.5k)
          </div>
          <div className="text-[11px] font-mono text-slate-200 mt-0.5">
            <span className="text-emerald-400 font-bold">[CR]</span> ACC-1002 (-₹1.5k)
          </div>
          <div className="text-[9px] text-violet-300/80 font-mono mt-1 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-violet-400" />
            <span>&Sigma; Dr - &Sigma; Cr = 0</span>
          </div>
        </motion.div>

        {/* Floating Satellite Card 3: Row-Lock Security */}
        <motion.div
          animate={{ x: [-3, 3, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="hidden sm:flex items-center gap-2 absolute top-1/2 -right-12 -translate-y-1/2 px-3 py-2 rounded-xl bg-navy-900/90 backdrop-blur-xl border border-cyan-500/40 shadow-lg text-[10px] text-cyan-300 font-mono font-bold card-glow-sky"
        >
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>SELECT FOR UPDATE</span>
        </motion.div>
      </div>
    </div>
  );
};
