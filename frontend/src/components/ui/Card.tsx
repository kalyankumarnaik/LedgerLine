import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-2xl p-6 shadow-sm shadow-slate-200/50 dark:shadow-none transition-colors ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-5 pb-3 border-b border-slate-100 dark:border-navy-800/80">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
