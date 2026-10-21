import { DEFAULT_SOCIAL_IMAGE, DEFAULT_SOCIAL_IMAGE_ALT, type SocialImage } from './socialImage';

/** Head rewriting for the prerendered HTML written by scripts/generate-seo-pages.ts. */

export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Set exactly one <meta>/<link> for `key`, keeping data-rh so react-helmet-async
 * replaces it on hydration instead of appending a second copy.
 */
function setHeadTag(html: string, tag: 'meta' | 'link', keyAttr: string, key: string, valueAttr: string, value: string): string {
  const pattern = new RegExp(`<${tag}\\b[^>]*\\b${keyAttr}="${key.replace(/[.:]/g, '\\$&')}"[^>]*>\\s*`, 'g');
  const element = `<${tag} data-rh="true" ${keyAttr}="${key}" ${valueAttr}="${value}" />`;
  let placed = false;
  const out = html.replace(pattern, (match) => {
    if (placed) return '';
    placed = true;
    return `${element}${match.slice(match.indexOf('>') + 1)}`;
  });
  return placed ? out : out.replace('</head>', `  ${element}\n</head>`);
}

export function injectSeo(
  html: string,
  opts: {
    title: string;
    description: string;
    url: string;
    ogType?: string;
    image?: SocialImage;
    jsonLd?: object | object[];
  }
): string {
  const desc = esc(opts.description);
  const title = esc(opts.title);
  const url = esc(opts.url);
  const ogType = opts.ogType ?? 'website';
  const image = esc(opts.image?.url ?? DEFAULT_SOCIAL_IMAGE);
  const imageAlt = esc(opts.image?.alt ?? DEFAULT_SOCIAL_IMAGE_ALT);
  const jsonLdBlock = opts.jsonLd
    ? [opts.jsonLd]
        .flat()
        .map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`)
        .join('')
    : '';

  const metas: [string, string, string][] = [
    ['name', 'description', desc],
    ['property', 'og:title', title],
    ['property', 'og:description', desc],
    ['property', 'og:url', url],
    ['property', 'og:type', ogType],
    ['property', 'og:image', image],
    ['property', 'og:image:alt', imageAlt],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', desc],
    ['name', 'twitter:image', image],
    ['name', 'twitter:image:alt', imageAlt],
  ];
  let out = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  for (const [attr, key, value] of metas) out = setHeadTag(out, 'meta', attr, key, 'content', value);
  out = setHeadTag(out, 'link', 'rel', 'canonical', 'href', url);

  // Drop the homepage WebSite/Organization graph so destination pages don't claim to be the homepage.
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLdBlock || '');
  return out;
}

const HEAD_KEYS = [
  'og:image',
  'og:image:alt',
  'twitter:image',
  'twitter:image:alt',
  'og:title',
  'og:description',
  'twitter:title',
  'twitter:description',
  'description',
] as const;

const ATTR_RE = /([\w:-]+)="([^"]*)"/g;

/** Every <meta name|property=key> in the head, by key, in document order. Values are unescaped. */
export function headMetaValues(html: string): Record<string, string[]> {
  const head = html.slice(0, html.indexOf('</head>'));
  const out: Record<string, string[]> = {};
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/g)) {
    const attrs = Object.fromEntries([...tag.matchAll(ATTR_RE)].map((m) => [m[1], unescape(m[2])]));
    const key = attrs.property ?? attrs.name;
    if (!key || attrs.content === undefined) continue;
    (out[key] ??= []).push(attrs.content);
  }
  const canonical = [...head.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/g)].map((m) => /href="([^"]*)"/.exec(m[0])?.[1] ?? '');
  if (canonical.length) out.canonical = canonical.map(unescape);
  return out;
}

function unescape(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Problems with one prerendered page: any key in HEAD_KEYS (plus canonical) not present exactly once, or the wrong image. */
export function headProblems(html: string, expected?: SocialImage): string[] {
  const values = headMetaValues(html);
  const problems: string[] = [];
  for (const key of [...HEAD_KEYS, 'canonical']) {
    const n = values[key]?.length ?? 0;
    if (n !== 1) problems.push(`${key} appears ${n} times`);
  }
  if (expected) {
    for (const key of ['og:image', 'twitter:image']) {
      if (values[key]?.[0] !== expected.url) problems.push(`${key} is ${values[key]?.[0]}, expected ${expected.url}`);
    }
    for (const key of ['og:image:alt', 'twitter:image:alt']) {
      if (values[key]?.[0] !== expected.alt) problems.push(`${key} is ${values[key]?.[0]}, expected ${expected.alt}`);
    }
  }
  return problems;
}
