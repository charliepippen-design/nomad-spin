import type { Guide } from '@/data/guides';

/** Live guide reads must settle. A hung Supabase call used to keep the article spinner up. */
export const GUIDE_DB_TIMEOUT_MS = 4_000;

export class GuideDatabaseTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Guide database request timed out after ${timeoutMs}ms`);
    this.name = 'GuideDatabaseTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Live rows win on slug. Static guides fill anything the live query has not
 * returned yet, including while it is still in flight or after it fails.
 */
export function mergeGuides(live: readonly Guide[] | undefined, fallback: readonly Guide[]): Guide[] {
  if (!live) return [...fallback];
  const liveSlugs = new Set(live.map((guide) => guide.slug));
  return [...live, ...fallback.filter((guide) => !liveSlugs.has(guide.slug))];
}

function abortReason(signal: AbortSignal | undefined): unknown {
  return signal?.reason ?? new DOMException('The operation was aborted.', 'AbortError');
}

/**
 * Rejects when `promise` does not settle in time, or when `signal` aborts.
 * The original promise is still observed so a late rejection is not unhandled.
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, signal?: AbortSignal): Promise<T> {
  if (signal?.aborted) {
    return Promise.reject(abortReason(signal));
  }

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new GuideDatabaseTimeoutError(timeoutMs));
    }, timeoutMs);

    const onAbort = () => {
      clearTimeout(timer);
      reject(abortReason(signal));
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    promise.then(
      (value) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}
