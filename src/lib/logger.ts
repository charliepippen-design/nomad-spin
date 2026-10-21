/**
 * Dev-only logger. Every method is a no-op in production builds so debug
 * chatter never reaches visitors' consoles. Use console.error directly for
 * real errors that should surface in production.
 */
type LogFn = (...args: unknown[]) => void;

const noop: LogFn = () => {};
// Optional chaining keeps this safe if imported from a Node script (tsx) where import.meta.env is undefined.
const isDev = import.meta.env?.DEV === true;

export const logger: { log: LogFn; debug: LogFn; info: LogFn; warn: LogFn } = {
  log: isDev ? (...args) => console.log(...args) : noop,
  debug: isDev ? (...args) => console.debug(...args) : noop,
  info: isDev ? (...args) => console.info(...args) : noop,
  warn: isDev ? (...args) => console.warn(...args) : noop,
};
