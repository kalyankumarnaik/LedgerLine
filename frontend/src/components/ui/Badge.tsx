import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'POSTED':
      case 'APPROVED':
      case 'SUCCESS':
      case 'CREDIT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'FROZEN':
      case 'REJECTED':
      case 'FAILED':
      case 'ERROR':
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
      case 'PENDING':
      case 'PROCESSING':
      case 'MEDIUM':
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      case 'RESTRICTED':
      case 'CLOSED':
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'DEBIT':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-navy-800 dark:text-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()} ${className}`}>
      {status}
    </span>
  );
};
