import type { Guide } from '@/data/guides';

export const HOME_TITLE = 'Spin the Globe for Your Next Digital Nomad Base | Nomad Spin';
export const HOME_DESCRIPTION =
  'Spin a 3D globe and discover your next digital nomad destination. Compare cost, internet, and safety across 780+ cities.';
export const HOME_H1 = 'Find your next digital nomad base';
export const HOME_INTRO =
  'Not sure where to go next? Spin the 3D globe to discover a city, then compare cost, internet speed and safety across 780+ cities. Open a destination page to see visa length and best months for that place. For a closer look, read our living guides for cities like Lisbon, Chiang Mai, Bali, Mexico City and Cape Town. You can also read our decision framework, How to Choose Your Next Nomad Base.';
export const HOME_GUIDES_LINK = { href: '/guides', label: 'Digital nomad guides' } as const;

export type HomeGuideLink = Pick<Guide, 'slug' | 'title'>;

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Crawlable home body for the prerender. Mirrors the visible section in Index.tsx. */
export function homeBodyHtml(guides: readonly HomeGuideLink[]): string {
  const items = guides
    .map((guide) => `<li><a href="/guides/${esc(guide.slug)}">${esc(guide.title)}</a></li>`)
    .join('');
  return `<main id="seo-home"><h1>${esc(HOME_H1)}</h1><p>${esc(HOME_INTRO)}</p><ul><li><a href="${HOME_GUIDES_LINK.href}">${esc(HOME_GUIDES_LINK.label)}</a></li>${items}</ul></main>`;
}
