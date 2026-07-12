import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  width?: string;
}

export function Table<T extends { id: string }>({ columns, rows, empty }: { columns: Column<T>[]; rows: T[]; empty?: ReactNode }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-ink-100">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`text-left font-medium text-2xs uppercase tracking-wide text-ink-500 px-3 py-2 ${c.className ?? ''}`}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-ink-400 text-sm">
                {empty ?? 'No records found.'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className={`px-3 py-2.5 text-ink-800 ${c.className ?? ''}`}>
                    {c.render ? c.render(row) : (row as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
