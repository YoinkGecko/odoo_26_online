type LogLevel = 'info' | 'warn' | 'error';

const colors: Record<LogLevel, string> = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const reset = '\x1b[0m';

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
  // eslint-disable-next-line no-console
  console.log(`${colors[level]}[${ts}] ${level.toUpperCase()}${reset} ${message}${metaStr}`);
}

export const logger = {
  info: (m: string, meta?: Record<string, unknown>) => log('info', m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => log('warn', m, meta),
  error: (m: string, meta?: Record<string, unknown>) => log('error', m, meta),
};
