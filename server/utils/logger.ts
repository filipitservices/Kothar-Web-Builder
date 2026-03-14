/**
 * Server-side logging. Single place for all server console output.
 * Prefixes with [server] so logs are identifiable. Use instead of direct console.*.
 */

function log(...args: unknown[]): void {
  console.log('[server]', ...args);
}

function warn(...args: unknown[]): void {
  console.warn('[server]', ...args);
}

function error(...args: unknown[]): void {
  console.error('[server]', ...args);
}

export const logger = { log, warn, error };
