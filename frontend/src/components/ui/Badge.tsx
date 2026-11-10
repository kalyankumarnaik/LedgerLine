import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', showDot = true }) => {
  const norm = status.toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case 'ACTIVE':
      case 'POSTED':
      case 'APPROVED':
      case 'SUCCESS':
      case 'CREDIT':
        return {
          wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80 shadow-xs shadow-emerald-500/10',
          dot: 'bg-emerald-500',
          ping: true,
        };
      case 'FROZEN':
      case 'REJECTED':
      case 'FAILED':
      case 'ERROR':
      case 'CRITICAL':
      case 'HIGH':
        return {
          wrapper: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/80 shadow-xs shadow-rose-500/10',
          dot: 'bg-rose-500',
          ping: false,
        };
      case 'PENDING':
      case 'PROCESSING':
      case 'MEDIUM':
      case 'WARNING':
        return {
          wrapper: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/80 shadow-xs shadow-amber-500/10',
          dot: 'bg-amber-500',
          ping: true,
        };
      case 'DEBIT':
        return {
          wrapper: 'bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-700/80 shadow-xs shadow-violet-500/10',
          dot: 'bg-violet-500',
          ping: false,
        };
      case 'TRANSFER':
      case 'SETTLED':
        return {
          wrapper: 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700/80 shadow-xs shadow-sky-500/10',
          dot: 'bg-sky-500',
          ping: false,
        };
      case 'RESTRICTED':
      case 'CLOSED':
      case 'LOW':
        return {
          wrapper: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400',
          ping: false,
        };
      default:
        return {
          wrapper: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-navy-800 dark:text-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
          ping: false,
        };
    }
  };

  const { wrapper, dot, ping } = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${wrapper} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {ping && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dot}`} />
        </span>
      )}
      <span>{status}</span>
    </span>
  );
};
