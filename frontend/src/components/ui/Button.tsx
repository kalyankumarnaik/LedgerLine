import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
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
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden';

  const variants = {
    primary:
      'bg-violet-brand hover:bg-violet-600 text-white shadow-md shadow-violet-500/25 hover:shadow-violet-500/40 focus:ring-violet-500',
    secondary:
      'bg-navy-900 hover:bg-navy-850 text-white dark:bg-navy-800 dark:hover:bg-navy-700 shadow-md focus:ring-navy-500',
    emerald:
      'bg-emerald-brand hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 focus:ring-emerald-500',
    outline:
      'border border-slate-300 dark:border-navy-700 bg-white/50 dark:bg-navy-900/50 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 focus:ring-violet-500 hover:border-slate-400 dark:hover:border-navy-600',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 focus:ring-rose-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={disabled || loading ? undefined : { scale: 1.02 }}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </motion.button>
  );
};
