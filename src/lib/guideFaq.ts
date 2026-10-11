import type { Guide } from '@/data/guides';
import { renderGuideMarkdown } from '@/lib/guideHtml';
import { rewriteSubAreaDestinationHrefs } from '@/lib/subAreaDestinations';

/**
 * FAQPage JSON-LD for guide pages, built from the Q&As already visible in the
 * guide body. Two Q&A formats are recognised, in page order:
 *
 * 1. Paragraph format (Budapest, Madrid and most guides): a paragraph that opens
 *    with a bold question ending in "?" followed by the answer, e.g.
 *    `**Is X good for calls?** Yes. ...` in content/guides/*.md or
 *    `<p><strong>Question?</strong> Answer</p>` in hand-written guides.
 * 2. Heading format (Porto): an H3 or H4 heading ending in "?", answered by the
 *    paragraph(s) directly under it, up to the next heading or non-paragraph
 *    block. H2 question headings are section titles, not Q&As, and are ignored.
 *
 * Question and answer text are the visible text (markup stripped), so the
 * JSON-LD always matches the page. Entries with an empty question or answer
 * are dropped, so an FAQPage is never empty.
 *
 * Guardrail: a Q&A whose answer carries an affiliate or partner link (booking.com,
 * flatio, aid=, partner/affiliate/utm params, any partner domain from
 * src/utils/affiliateEngine.ts) is left out of the structured data. It still
 * renders on the page. Partner CTAs from affiliateEngine render as React
 * components outside the guide body, so they never reach this parser.
 *
 * Emitted only when at least MIN_FAQ_ENTRIES Q&As remain. One FAQPage per guide.
 * Destination pages build their own FAQPage in src/lib/destinationFaq.ts.
 */
export const MIN_FAQ_ENTRIES = 2;

export interface GuideFaqEntry {
  question: string;
  answer: string;
}

const AFFILIATE_LINK =
  /(?:[?&](?:aid|affiliate|affiliate_id|aff|aff_id|partner|partner_id|ref|irclickid|clickref)=|utm_(?:source|medium|campaign)=|booking\.com|flatio\.|airalo\.|safetywing\.|ivisa\.|skyscanner\.|nordvpn\.|agoda\.|impact\.com|awin1\.com|go\.nordvpn|tp\.media|travelpayouts)/i;

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

function decode(value: string): string {
  return value
    .replace(/&(?:amp|lt|gt|quot|#39|#x27|apos|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function visibleText(html: string): string {
  return decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function hasAffiliateLink(html: string): boolean {
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)].map((m) => decode(m[2]));
  return hrefs.some((href) => AFFILIATE_LINK.test(href));
}

const QA_PARAGRAPH = /<p>\s*<strong>([^<]*?\?)\s*<\/strong>([\s\S]*?)<\/p>/g;
const QA_HEADING = /<h([34])[^>]*>((?:[^<]|<\/?(?:em|strong|code)>)*?\?)\s*<\/h\1>\s*((?:<p>(?:(?!<\/p>)[\s\S])*<\/p>\s*)+)/g;

interface RawQa {
  index: number;
  questionHtml: string;
  answerHtml: string;
}

/** Visible Q&As in a guide body, in page order, affiliate-link answers removed. */
export function guideFaqEntries(content: string): GuideFaqEntry[] {
  const html = renderGuideMarkdown(rewriteSubAreaDestinationHrefs(content));
  const raw: RawQa[] = [];
  for (const m of html.matchAll(QA_PARAGRAPH)) {
    raw.push({ index: m.index ?? 0, questionHtml: m[1], answerHtml: m[2] });
  }
  for (const m of html.matchAll(QA_HEADING)) {
    // Answer paragraphs joined with a space, as a reader sees consecutive paragraphs.
    const answerHtml = [...m[3].matchAll(/<p>([\s\S]*?)<\/p>/g)].map((p) => p[1]).join(' ');
    raw.push({ index: m.index ?? 0, questionHtml: m[2], answerHtml });
  }
  raw.sort((a, b) => a.index - b.index);

  const entries: GuideFaqEntry[] = [];
  const seen = new Set<string>();
  for (const { questionHtml, answerHtml } of raw) {
    const question = visibleText(questionHtml);
    const answer = visibleText(answerHtml);
    if (!question || !answer || seen.has(question)) continue;
    if (hasAffiliateLink(answerHtml)) continue;
    seen.add(question);
    entries.push({ question, answer });
  }
  return entries;
}

/** FAQPage JSON-LD for a guide, or null when it has fewer than MIN_FAQ_ENTRIES Q&As. */
export function guideFaqJsonLd(guide: Pick<Guide, 'content'>) {
  const entries = guideFaqEntries(guide.content);
  if (entries.length < MIN_FAQ_ENTRIES) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
