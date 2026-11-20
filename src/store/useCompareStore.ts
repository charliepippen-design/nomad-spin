import { create } from 'zustand';
import { MAX_COMPARE } from '@/lib/compare';

/**
 * Comparison shortlist: canonical city slugs, kept in this browser only.
 * The /compare URL stays the source of truth for a shared comparison; the
 * shortlist is what "Add to compare" buttons fill between pages.
 */

const KEY = 'nomadspin_compare_shortlist';

function read(): string[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // Private mode or blocked storage: the shortlist still works for this page view.
  }
}

interface CompareState {
  slugs: string[];
  /** Returns false when the shortlist is already full. */
  add: (slug: string) => boolean;
  remove: (slug: string) => void;
  set: (slugs: string[]) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  slugs: read(),
  add: (slug) => {
    const current = get().slugs;
    if (current.includes(slug)) return true;
    if (current.length >= MAX_COMPARE) return false;
    const next = [...current, slug];
    write(next);
    set({ slugs: next });
    return true;
  },
  remove: (slug) => {
    const next = get().slugs.filter((s) => s !== slug);
    write(next);
    set({ slugs: next });
  },
  set: (slugs) => {
    const next = [...new Set(slugs)].slice(0, MAX_COMPARE);
    write(next);
    set({ slugs: next });
  },
  clear: () => {
    write([]);
    set({ slugs: [] });
  },
}));
