import type { City } from '@/data/cities';
import { livingGuideForCity } from '@/lib/destinationSeo';
import { allCitySlugs, findCityBySlug } from '@/lib/citySlug';
import { haversineKm } from '@/lib/distance';

/**
 * Trailing slug tokens for a part of a city (suburbs, outskirts, and the same
 * shape: coast towns, mountain towns, hills, surrounds). Longest first so
 * "coastal-suburbs" is not read as a city named "muscat-coastal".
 */
const SUB_AREA_SUFFIXES = [
  'coastal-suburbs',
  'coastal-towns',
  'mountain-towns',
  'province-towns',
  'coast-towns',
  'outskirts',
  'surrounds',
  'mountains',
  'suburbs',
  'hills',
] as const;

type SubAreaSuffix = (typeof SUB_AREA_SUFFIXES)[number];

/**
 * Padova Province Towns sits on the Padua coordinates (about 0.5 km).
 * The next false neighbor, Funchal Suburbs to Porto Santo, is about 70 km.
 */
const SAME_PLACE_KM = 15;

export const SUB_AREA_ROBOTS = 'noindex, follow';

export interface SubAreaDestination {
  city: City;
  slug: string;
  suffix: SubAreaSuffix;
  parent: City | null;
  parentSlug: string | null;
}

export interface SubAreaParentNotice {
  parentName: string;
  parentSlug: string;
  livingGuideSlug: string | null;
}

function qualifierSuffix(slug: string): SubAreaSuffix | null {
  for (const suffix of SUB_AREA_SUFFIXES) {
    const tail = `-${suffix}`;
    if (slug.endsWith(tail) && slug.length > tail.length) return suffix;
  }
  return null;
}

function slugParent(slug: string, city: City, suffix: SubAreaSuffix): { city: City; slug: string } | null {
  const candidate = slug.slice(0, -(suffix.length + 1));
  const resolved = findCityBySlug(candidate);
  if (!resolved || resolved.canonicalSlug !== candidate) return null;
  if (resolved.city.id === city.id || resolved.city.countryCode !== city.countryCode) return null;
  if (qualifierSuffix(resolved.canonicalSlug)) return null;
  return { city: resolved.city, slug: resolved.canonicalSlug };
}

function nearestSamePlace(city: City): { city: City; slug: string } | null {
  let best: { city: City; slug: string; km: number } | null = null;
  for (const row of allCitySlugs()) {
    if (row.city.id === city.id || row.city.countryCode !== city.countryCode) continue;
    if (qualifierSuffix(row.slug)) continue;
    const km = haversineKm(city.lat, city.lng, row.city.lat, row.city.lng);
    if (km > SAME_PLACE_KM) continue;
    if (!best || km < best.km) best = { city: row.city, slug: row.slug, km };
  }
  return best ? { city: best.city, slug: best.slug } : null;
}

let cached: SubAreaDestination[] | null = null;

/** Sub-area rows derived from slug suffixes, each with its parent hub when one exists. */
export function listSubAreaDestinations(): SubAreaDestination[] {
  if (cached) return cached;
  const rows: SubAreaDestination[] = [];
  for (const { city, slug } of allCitySlugs()) {
    const suffix = qualifierSuffix(slug);
    if (!suffix) continue;
    const parent = slugParent(slug, city, suffix) ?? nearestSamePlace(city);
    rows.push({
      city,
      slug,
      suffix,
      parent: parent?.city ?? null,
      parentSlug: parent?.slug ?? null,
    });
  }
  rows.sort((a, b) => a.slug.localeCompare(b.slug));
  cached = rows;
  return rows;
}

const bySlug = new Map<string, SubAreaDestination>();

function subAreaMap(): Map<string, SubAreaDestination> {
  if (bySlug.size === 0) {
    for (const row of listSubAreaDestinations()) bySlug.set(row.slug, row);
  }
  return bySlug;
}

export function subAreaBySlug(slug: string): SubAreaDestination | null {
  return subAreaMap().get(slug) ?? null;
}

export function destinationRobotsContent(slug: string): string | null {
  return subAreaBySlug(slug) ? SUB_AREA_ROBOTS : null;
}

/** Parent hub slug when this URL is a sub-area of one. Otherwise the slug itself. */
export function canonicalHubSlug(slug: string): string {
  return subAreaBySlug(slug)?.parentSlug ?? slug;
}

export function canonicalDestinationPath(slug: string): string {
  return `/destinations/${canonicalHubSlug(slug)}`;
}

export function subAreaParentNotice(row: SubAreaDestination): SubAreaParentNotice | null {
  if (!row.parent || !row.parentSlug) return null;
  return {
    parentName: row.parent.name,
    parentSlug: row.parentSlug,
    livingGuideSlug: livingGuideForCity(row.parent)?.slug ?? null,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Visible parent-hub line for prerendered sub-area pages. Empty when no parent hub exists. */
export function subAreaParentNoticeHtml(row: SubAreaDestination): string {
  const notice = subAreaParentNotice(row);
  if (!notice) return '';
  const hub = `<a href="/destinations/${escapeHtml(notice.parentSlug)}">${escapeHtml(notice.parentName)} guide</a>`;
  const living = notice.livingGuideSlug
    ? ` and the <a href="/guides/${escapeHtml(notice.livingGuideSlug)}">living guide</a>`
    : '';
  return `<p>Part of the ${escapeHtml(notice.parentName)} area. See the full ${hub}${living}.</p>`;
}

const DESTINATION_HREF = /\/destinations\/([a-z0-9-]+)/g;

/** Point /destinations/{sub-area} hrefs at the parent hub. Leaves slugs with no parent unchanged. */
export function rewriteSubAreaDestinationHrefs(value: string): string {
  return value.replace(/\/destinations\/([a-z0-9-]+)/g, (full, slug: string) => {
    const parent = subAreaBySlug(slug)?.parentSlug;
    if (!parent) return full;
    return `/destinations/${parent}`;
  });
}

export function guideDestinationLinks(slugs: readonly string[] | undefined): string[] {
  const seen = new Set<string>();
  const links: string[] = [];
  for (const slug of slugs ?? []) {
    const href = canonicalHubSlug(slug);
    if (seen.has(href)) continue;
    seen.add(href);
    links.push(href);
  }
  return links;
}

export function omitSubAreaDestinationLines(text: string): string {
  const hidden = new Set(listSubAreaDestinations().map((row) => row.slug));
  return text
    .split('\n')
    .filter((line) => {
      DESTINATION_HREF.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = DESTINATION_HREF.exec(line))) {
        if (hidden.has(match[1])) return false;
      }
      return true;
    })
    .join('\n');
}

/** Insert a robots meta tag. Does not change the canonical link. */
export function insertRobotsMeta(html: string, content: string | null): string {
  if (!content) return html;
  const tag = `<meta name="robots" content="${content}" />`;
  if (/<meta\s+name="robots"/i.test(html)) {
    return html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, tag);
  }
  if (html.includes('</head>')) return html.replace('</head>', `${tag}\n</head>`);
  return `${tag}${html}`;
}
