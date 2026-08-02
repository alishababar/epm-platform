import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-400 text-white',
  secondary: 'bg-surface-raised hover:bg-surface-border text-slate-100 border border-surface-border',
  ghost: 'hover:bg-surface-raised text-slate-300',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
