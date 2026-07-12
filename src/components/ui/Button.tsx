import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary: 'bg-white text-ink-800 border border-ink-100 hover:bg-ink-50 hover:border-ink-200 disabled:text-ink-300',
  ghost: 'text-ink-600 hover:text-ink-900 hover:bg-ink-50 disabled:text-ink-300',
  danger: 'bg-white text-danger-text border border-danger-border hover:bg-danger-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-2xs rounded',
  md: 'h-9 px-3.5 text-sm rounded',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'secondary', size = 'md', loading, icon, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-100 select-none disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className ?? ''}`}
      {...rest}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {children}
    </button>
  );
});
