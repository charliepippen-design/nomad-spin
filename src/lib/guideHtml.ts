import { marked } from 'marked';
import type { Guide } from '@/data/guides';
import { relatedDestinationsHtml, relatedGuidesHtml } from '@/lib/relatedGuides';
import { rewriteSubAreaDestinationHrefs } from '@/lib/subAreaDestinations';

marked.use({ gfm: true, breaks: false });

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Guide <title>, og:title, and twitter:title. Shared by the article page and prerender. */
export function guidePageTitle(headline: string): string {
  return `${headline} | Nomad Spin`;
}

/**
 * Crawlable /guides index. One link per guide from the sitemap list
 * (src/data/guides.ts), with the guide title and its one-line meta description.
 */
export function guidesIndexBodyHtml(items: readonly Pick<Guide, 'slug' | 'title' | 'excerpt'>[]): string {
  const list = items
    .map(
      (guide) =>
        `<li><a href="/guides/${esc(guide.slug)}">${esc(guide.title)}</a><p>${esc(guide.excerpt)}</p></li>`,
    )
    .join('');
  return `<main id="seo-guides"><h1>Guides and articles</h1><ul>${list}</ul></main>`;
}

/** Full article HTML for crawlers. Markdown and existing HTML both render. */
export function renderGuideMarkdown(markdown: string): string {
  const parsed = marked.parse(markdown, { async: false });
  if (typeof parsed !== 'string') {
    throw new Error('Guide markdown renderer must stay synchronous');
  }
  return parsed.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

export function guideBodyHtml(guide: Guide): string {
  const body = renderGuideMarkdown(rewriteSubAreaDestinationHrefs(guide.content));
  const published = esc(guide.date.split('T')[0] ?? guide.date);
  const relatedGuides = relatedGuidesHtml(guide.slug);
  const relatedDestinations = relatedDestinationsHtml(guide);

  return `
<main id="seo-guide" style="max-width:42rem;margin:2rem auto;padding:0 1.25rem;font-family:Georgia,'Source Serif 4',serif;font-weight:400;line-height:1.65;color:#1c1917;background:#fff">
  <p><a href="/guides" style="color:#007a52">Guides</a> · <a href="/" style="color:#007a52">Spin the globe</a></p>
  <h1>${esc(guide.title)}</h1>
  <p>${esc(guide.excerpt)}</p>
  <p>${esc(guide.readTime)} · Published ${published}</p>
  <article>${body}</article>
  ${relatedGuides}
  ${relatedDestinations}
  <p><a href="/" style="color:#007a52">Spin the globe</a></p>
</main>`;
}
