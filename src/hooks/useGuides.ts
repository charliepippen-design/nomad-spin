import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Guide } from '@/data/guides';
import { GUIDE_DB_TIMEOUT_MS, GuideDatabaseTimeoutError, withTimeout } from '@/lib/guideCatalog';

// Manual type since guides table may not be in auto-generated types yet
interface GuidesRow {
  id: number;
  city: string;
  keyword: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  slug: string | null;
}

interface GuidesQueryResult {
  data: GuidesRow[] | null;
  error: { message: string } | null;
}

interface GuidesTableQuery {
  select: (columns: string) => {
    order: (
      column: string,
      options: { ascending: boolean },
    ) => {
      abortSignal: (signal: AbortSignal) => PromiseLike<GuidesQueryResult>;
    };
  };
}

const GUIDE_COLUMNS = 'id, city, keyword, title, content, status, created_at, slug';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Convert a city name to a URL-safe slug, e.g. "Bali" → "bali" */
function toSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-');
}

/** Strip HTML tags and Markdown symbols to return plain text */
function stripMarkdownAndHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ') // strip HTML
    .replace(/[#*`_~]/g, '') // strip simple md symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip links [text](url) -> text
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract a ~160-char excerpt from raw content */
function excerptFromContent(content: string): string {
  const plain = stripMarkdownAndHtml(content);
  if (plain.length <= 160) return plain;
  return plain.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

/** Estimate read time based on 200 wpm */
function calcReadTime(content: string): string {
  const words = stripMarkdownAndHtml(content).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// ── mapper ────────────────────────────────────────────────────────────────────

function rowToGuide(row: GuidesRow): Guide {
  return {
    id: String(row.id),
    slug: row.slug || toSlug(row.city),
    title: row.title,
    excerpt: excerptFromContent(row.content),
    date: row.created_at,
    readTime: calcReadTime(row.content),
    content: row.content,
  };
}

async function fetchLiveGuides(signal: AbortSignal, timeoutMs = GUIDE_DB_TIMEOUT_MS): Promise<Guide[]> {
  const timeoutController = new AbortController();
  const onParentAbort = () => timeoutController.abort(signal.reason);
  if (signal.aborted) timeoutController.abort(signal.reason);
  else signal.addEventListener('abort', onParentAbort, { once: true });

  const timer = setTimeout(() => {
    timeoutController.abort(new GuideDatabaseTimeoutError(timeoutMs));
  }, timeoutMs);

  try {
    const query = (supabase as unknown as { from: (table: string) => GuidesTableQuery })
      .from('guides')
      .select(GUIDE_COLUMNS)
      .order('created_at', { ascending: false })
      .abortSignal(timeoutController.signal);

    const { data, error } = await withTimeout(Promise.resolve(query), timeoutMs, timeoutController.signal);
    if (error) throw error;
    return (data ?? []).map(rowToGuide);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onParentAbort);
  }
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useGuides() {
  return useQuery<Guide[], Error>({
    queryKey: ['guides'],
    queryFn: ({ signal }) => fetchLiveGuides(signal),
    staleTime: 1000 * 60 * 5, // 5 min cache
    // One bounded attempt. Default retries stacked on a hung request and kept
    // guide pages on the spinner for well over 12 seconds.
    retry: false,
    // Don't leave the query pending forever when the browser reports offline.
    networkMode: 'always',
  });
}
