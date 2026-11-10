import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex transition-colors overflow-x-hidden">
      {/* Ambient glowing multi-chromatic radial orbs */}
      <div className="fixed top-0 right-0 w-[550px] h-[550px] bg-violet-600/10 dark:bg-violet-600/15 rounded-full blur-[130px] pointer-events-none -z-10 transform translate-x-1/4 -translate-y-1/4 animate-pulse-glow" />
      <div className="fixed bottom-0 left-64 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none -z-10 transform -translate-x-1/4 translate-y-1/4" />
      <div className="fixed top-1/2 right-1/4 w-[350px] h-[350px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
