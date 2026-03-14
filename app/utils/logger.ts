/**
 * Centralized logging. In development all levels are emitted; in production only errors.
 * Use instead of ad-hoc console.log/console.warn/console.error.
 */

const isDev = import.meta.dev;

function noop(_?: unknown, ..._args: unknown[]): void {}

export const logger = {
  log: isDev ? (...args: unknown[]) => console.log('[app]', ...args) : noop,
  warn: isDev ? (...args: unknown[]) => console.warn('[app]', ...args) : noop,
  error: (...args: unknown[]) => console.error('[app]', ...args),
  debug: isDev ? (...args: unknown[]) => console.debug('[app]', ...args) : noop,
};
