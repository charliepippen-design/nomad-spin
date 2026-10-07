/**
 * Static 404 document written to dist/404.html.
 * Vercel serves this file with HTTP 404 when no static file and no rewrite match.
 * It is not the homepage shell: no canonical, no SPA bundle, noindex.
 */

export const NOT_FOUND_TITLE = 'Page Not Found (404) | Nomad Spin';

export const NOT_FOUND_DESCRIPTION =
  'This page does not exist. Head back to Nomad Spin, browse the guides, or open a destination hub.';

/** Home, the guides index, and the featured destination hubs. */
export const NOT_FOUND_LINKS: readonly { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/guides', label: 'Guides' },
  { href: '/destinations/lisbon', label: 'Lisbon' },
  { href: '/destinations/mexico-city', label: 'Mexico City' },
  { href: '/destinations/bangkok', label: 'Bangkok' },
  { href: '/destinations/medellin', label: 'Medellin' },
  { href: '/destinations/buenos-aires', label: 'Buenos Aires' },
  { href: '/destinations/tbilisi', label: 'Tbilisi' },
];

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildNotFoundHtml(): string {
  const links = NOT_FOUND_LINKS.map(
    (link) => `<li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`,
  ).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(NOT_FOUND_TITLE)}</title>
  <meta name="description" content="${esc(NOT_FOUND_DESCRIPTION)}" />
  <meta name="robots" content="noindex, follow" />
  <link rel="icon" href="/favicon.ico" />
  <style>
    body { margin: 0; min-height: 100vh; background: #0b0f14; color: #e5e7eb; font-family: ui-sans-serif, system-ui, sans-serif; }
    main { max-width: 40rem; margin: 0 auto; padding: 4rem 1.25rem; }
    h1 { font-size: 2rem; margin: 0 0 1rem; }
    p { line-height: 1.6; color: #cbd5e1; }
    ul { padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 0.75rem 1.25rem; }
    a { color: #34d399; }
  </style>
</head>
<body>
  <main>
    <h1>Page not found</h1>
    <p>${esc(NOT_FOUND_DESCRIPTION)}</p>
    <nav aria-label="Helpful pages">
      <ul>${links}</ul>
    </nav>
  </main>
</body>
</html>
`;
}
