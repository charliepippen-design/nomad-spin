import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Guide } from '@/data/guides';
import type { Tables } from '@/integrations/supabase/types';

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

/** Strip HTML tags and return plain text */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Extract a ~160-char excerpt from raw HTML content */
function excerptFromContent(html: string): string {
  const plain = stripHtml(html);
  if (plain.length <= 160) return plain;
  return plain.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

/** Estimate read time based on 200 wpm */
function calcReadTime(html: string): string {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// ── mapper ────────────────────────────────────────────────────────────────────

type GuidesRow = Tables<'guides'>;

function rowToGuide(row: GuidesRow): Guide {
  return {
    id: String(row.id),
    slug: toSlug(row.city),
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('id, city, keyword, title, content, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as GuidesRow[]).map(rowToGuide);
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}
