import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  FileText,
  UserCheck,
  ShieldAlert,
  Users,
  Building2,
  CheckCircle,
  FileCheck2,
  Scale,
  Sparkles,
  SlidersHorizontal,
  FileStack,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin, isAuditor, isAccountHolder } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-violet-brand text-white shadow-md shadow-violet-500/20 font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-navy-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-navy-900 via-violet-brand to-emerald-brand flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Ledger<span className="text-violet-brand">Line</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-500">
              Verified Core
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Account Holder Navigation */}
          {isAccountHolder && (
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Personal Banking
              </p>
              <nav className="space-y-1">
                <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </NavLink>
                <NavLink to="/accounts" className={linkClass} onClick={onClose}>
                  <Wallet className="w-4 h-4" />
                  <span>My Accounts</span>
                </NavLink>
                <NavLink to="/transfer" className={linkClass} onClick={onClose}>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Transfer Money</span>
                </NavLink>
                <NavLink to="/deposit" className={linkClass} onClick={onClose}>
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Deposit Funds</span>
                </NavLink>
                <NavLink to="/withdraw" className={linkClass} onClick={onClose}>
                  <ArrowUpFromLine className="w-4 h-4" />
                  <span>Withdraw Funds</span>
                </NavLink>
                <NavLink to="/transactions" className={linkClass} onClick={onClose}>
                  <History className="w-4 h-4" />
                  <span>History & Receipts</span>
                </NavLink>
                <NavLink to="/statements" className={linkClass} onClick={onClose}>
                  <FileText className="w-4 h-4" />
                  <span>Statements & CSV</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* Administrator Navigation */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-violet-500 dark:text-violet-400 mb-2">
                Admin Control Portal
              </p>
              <nav className="space-y-1">
                <NavLink to="/admin/dashboard" className={linkClass} onClick={onClose}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Platform Overview</span>
                </NavLink>
                <NavLink to="/admin/users" className={linkClass} onClick={onClose}>
                  <Users className="w-4 h-4" />
                  <span>User Management</span>
                </NavLink>
                <NavLink to="/admin/accounts" className={linkClass} onClick={onClose}>
                  <Building2 className="w-4 h-4" />
                  <span>Account Directory</span>
                </NavLink>
                <NavLink to="/admin/transactions" className={linkClass} onClick={onClose}>
                  <FileStack className="w-4 h-4" />
                  <span>Transaction Monitoring</span>
                </NavLink>
                <NavLink to="/admin/failed-attempts" className={linkClass} onClick={onClose}>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Failed Attempts</span>
                </NavLink>
                <NavLink to="/admin/risk" className={linkClass} onClick={onClose}>
                  <Sparkles className="w-4 h-4" />
                  <span>Risk & Anomaly Engine</span>
                </NavLink>
                <NavLink to="/admin/reconciliation" className={linkClass} onClick={onClose}>
                  <Scale className="w-4 h-4" />
                  <span>Reconciliation Center</span>
                </NavLink>
                <NavLink to="/admin/adjustments" className={linkClass} onClick={onClose}>
                  <CheckCircle className="w-4 h-4" />
                  <span>Adjustment Approvals</span>
                </NavLink>
                <NavLink to="/admin/audit-events" className={linkClass} onClick={onClose}>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Security Audit Log</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* Auditor Navigation */}
          {isAuditor && (
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-500 mb-2">
                Independent Auditor Portal
              </p>
              <nav className="space-y-1">
                <NavLink to="/auditor/dashboard" className={linkClass} onClick={onClose}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Auditor Overview</span>
                </NavLink>
                <NavLink to="/auditor/ledger" className={linkClass} onClick={onClose}>
                  <FileStack className="w-4 h-4" />
                  <span>Immutable Ledger</span>
                </NavLink>
                <NavLink to="/auditor/integrity" className={linkClass} onClick={onClose}>
                  <Scale className="w-4 h-4" />
                  <span>Integrity Verification</span>
                </NavLink>
                <NavLink to="/auditor/failed-attempts" className={linkClass} onClick={onClose}>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Refused Attempts Log</span>
                </NavLink>
                <NavLink to="/auditor/audit-events" className={linkClass} onClick={onClose}>
                  <FileCheck2 className="w-4 h-4" />
                  <span>System Audit Events</span>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* Footer Role Badge */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
              {isAdmin ? 'AD' : isAuditor ? 'AU' : 'AH'}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {isAdmin ? 'System Admin' : isAuditor ? 'Senior Auditor' : 'Account Holder'}
              </span>
              <span className="block text-[10px] text-slate-400 font-mono truncate">
                Active Session
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
