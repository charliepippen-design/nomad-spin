import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import type { Guide } from '@/data/guides';

/** One attempt. Default React Query retries would keep isLoading true for each hung request. */
export const GUIDE_FETCH_TIMEOUT_MS = 4_000;

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

interface GuidesQuery {
  from(table: 'guides'): {
    select(columns: string): {
      order(
        column: string,
        options: { ascending: boolean },
      ): {
        abortSignal(signal: AbortSignal): PromiseLike<{
          data: GuidesRow[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
}

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

// ── hook ──────────────────────────────────────────────────────────────────────

export function useGuides() {
  return useQuery<Guide[], Error>({
    queryKey: ['guides'],
    retry: false,
    queryFn: () => fetchLiveGuides(),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}

async function fetchLiveGuides(): Promise<Guide[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Live guide database is not configured');
  }

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Live guide database timed out'));
    }, GUIDE_FETCH_TIMEOUT_MS);
  });

  try {
    const pending = (supabase as unknown as GuidesQuery)
      .from('guides')
      .select('id, city, keyword, title, content, status, created_at, slug')
      .order('created_at', { ascending: false })
      .abortSignal(controller.signal);

    const { data, error } = await Promise.race([pending, timeout]);
    if (error) throw error;
    return (data ?? []).map(rowToGuide);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
