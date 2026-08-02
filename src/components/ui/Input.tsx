import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-brand-400 focus:ring-1 focus:ring-brand-400',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
);
Input.displayName = 'Input';
