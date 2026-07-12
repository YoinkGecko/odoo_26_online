import { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface FilterProps {
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  selects?: Array<{ label: string; value: string; onChange: (v: string) => void; options: Option[] }>;
  chips?: Array<{ label: string; value: string; active: boolean; onClick: () => void }>;
  right?: ReactNode;
}

export function FilterBar({ search, selects, chips, right }: FilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {search && (
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
          <input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? 'Search…'}
            className="w-full h-8 pl-7 pr-3 text-sm bg-white border border-ink-100 rounded focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
          />
        </div>
      )}
      {selects?.map((sel) => (
        <select
          key={sel.label}
          value={sel.value}
          onChange={(e) => sel.onChange(e.target.value)}
          className="h-8 px-2 text-sm bg-white border border-ink-100 rounded focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
        >
          <option value="">{sel.label}: All</option>
          {sel.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
      {chips && (
        <div className="flex items-center gap-1">
          {chips.map((chip) => (
            <button
              key={chip.value}
              onClick={chip.onClick}
              className={`h-7 px-2.5 text-2xs font-medium border rounded transition-colors ${
                chip.active
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-ink-600 border-ink-100 hover:border-ink-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}
