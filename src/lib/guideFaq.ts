import type { Guide } from '@/data/guides';
import { renderGuideMarkdown } from '@/lib/guideHtml';
import { rewriteSubAreaDestinationHrefs } from '@/lib/subAreaDestinations';

/**
 * FAQPage JSON-LD for guide pages, built from the Q&As already visible in the
 * guide body. A Q&A is a paragraph that opens with a bold question ending in
 * "?" followed by the answer, e.g. `**Is X good for calls?** Yes. ...` in
 * content/guides/*.md or `<p><strong>Question?</strong> Answer</p>` in
 * hand-written guides. Question and answer text are the visible text of that
 * paragraph (markup stripped), so the JSON-LD always matches the page.
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

/** Visible Q&As in a guide body, in page order, affiliate-link answers removed. */
export function guideFaqEntries(content: string): GuideFaqEntry[] {
  const html = renderGuideMarkdown(rewriteSubAreaDestinationHrefs(content));
  const entries: GuideFaqEntry[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(QA_PARAGRAPH)) {
    const question = visibleText(match[1]);
    const answerHtml = match[2];
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
