// Surfaces backend business-rule rejections in the UI.
// The violated-condition portion is rendered in red per the design spec.

interface Props {
  prefix?: string;
  children: React.ReactNode;
}

export function RuleNote({ prefix = 'Rule', children }: Props) {
  return (
    <p className="text-2xs italic text-ink-500 leading-relaxed">
      <span className="not-italic font-medium text-ink-400">{prefix}:</span>{' '}
      <span className="text-danger-text">{children}</span>
    </p>
  );
}

// Inline error banner that maps a structured backend error → red text.
export function RuleError({ error }: { error: { code: string; message: string } | null }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-danger-soft border border-danger-border rounded">
      <span className="text-2xs font-medium text-danger-text shrink-0">{error.code}</span>
      <span className="text-2xs text-danger-text">{error.message}</span>
    </div>
  );
}
