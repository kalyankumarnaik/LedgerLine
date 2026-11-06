import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'emerald' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-violet-brand hover:bg-violet-600 text-white shadow-md shadow-violet-500/20 focus:ring-violet-500',
    secondary: 'bg-navy-900 hover:bg-navy-850 text-white dark:bg-navy-800 dark:hover:bg-navy-700 shadow-md focus:ring-navy-500',
    emerald: 'bg-emerald-brand hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 focus:ring-emerald-500',
    outline: 'border border-slate-300 dark:border-navy-700 bg-transparent hover:bg-slate-100 dark:hover:bg-navy-850 text-slate-700 dark:text-slate-200 focus:ring-violet-500',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-navy-850 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md focus:ring-rose-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
