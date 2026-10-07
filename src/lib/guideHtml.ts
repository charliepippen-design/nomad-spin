import { marked } from 'marked';
import type { Guide } from '@/data/guides';

marked.use({ gfm: true, breaks: false });

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
  const body = renderGuideMarkdown(guide.content);
  const published = esc(guide.date.split('T')[0] ?? guide.date);
  const related = guide.relatedDestinations ?? [];
  const relatedHtml = related.length
    ? `<h2>Related destinations</h2><ul>${related
        .map((slug) => {
          const label = slug.replace(/-/g, ' ');
          return `<li><a href="/destinations/${esc(slug)}">${esc(label)}</a></li>`;
        })
        .join('')}</ul>`
    : '';

  return `
<main id="seo-guide" style="max-width:42rem;margin:2rem auto;padding:0 1.25rem;font-family:Georgia,'Source Serif 4',serif;font-weight:400;line-height:1.65;color:#1c1917;background:#fff">
  <p><a href="/guides" style="color:#007a52">Guides</a> · <a href="/" style="color:#007a52">Spin the globe</a></p>
  <h1>${esc(guide.title)}</h1>
  <p>${esc(guide.excerpt)}</p>
  <p>${esc(guide.readTime)} · Published ${published}</p>
  <article>${body}</article>
  ${relatedHtml}
  <p><a href="/" style="color:#007a52">Spin the globe</a></p>
</main>`;
}
