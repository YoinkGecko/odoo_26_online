export function fmtCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

export function fmtNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(ts);
}

export function toDateInput(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function fromDateInput(s: string): number {
  return new Date(s + 'T00:00:00').getTime();
}
