import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Field({ label, children, hint, required }: { label: string; children: ReactNode; hint?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-2xs font-medium text-ink-600 mb-1">
        {label}{required && <span className="text-danger-text"> *</span>}
      </span>
      {children}
      {hint && <span className="block text-2xs text-ink-400 mt-1">{hint}</span>}
    </label>
  );
}

const inputBase = 'w-full h-8 px-2.5 text-sm bg-white border border-ink-100 rounded focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 disabled:bg-ink-50 disabled:text-ink-400';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} py-1.5 ${props.className ?? ''}`} />;
}
