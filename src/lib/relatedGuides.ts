import type { City } from '@/data/cities';
import { guides, type Guide } from '@/data/guides';
import { allCitySlugs, findCityBySlug } from '@/lib/citySlug';
import { canonicalHubSlug, subAreaBySlug } from '@/lib/subAreaDestinations';

/**
 * Three peers per guide. Keys that are not published yet are ignored until
 * that guide is in the sitemap list. Targets of a published guide must be published.
 */
const RELATED_GUIDE_PEERS: Record<string, readonly [string, string, string]> = {
  'living-in-lisbon': ['living-in-porto', 'living-in-valencia', 'living-in-prague'],
  'living-in-porto': ['living-in-lisbon', 'living-in-valencia', 'living-in-prague'],
  'living-in-valencia': ['living-in-lisbon', 'living-in-barcelona', 'living-in-porto'],
  'living-in-barcelona': ['living-in-lisbon', 'living-in-valencia', 'living-in-budapest'],
  'living-in-budapest': ['living-in-lisbon', 'living-in-prague', 'living-in-tbilisi'],
  'living-in-prague': ['living-in-lisbon', 'living-in-budapest', 'living-in-barcelona'],
  'living-in-tbilisi': ['living-in-lisbon', 'living-in-budapest', 'living-in-chiang-mai'],
  'living-in-chiang-mai': ['living-in-bangkok', 'living-in-da-nang', 'living-in-ho-chi-minh-city'],
  'living-in-bangkok': ['living-in-chiang-mai', 'living-in-ho-chi-minh-city', 'living-in-da-nang'],
  'living-in-da-nang': ['living-in-chiang-mai', 'living-in-ho-chi-minh-city', 'living-in-bali'],
  'living-in-ho-chi-minh-city': ['living-in-chiang-mai', 'living-in-da-nang', 'living-in-bangkok'],
  'living-in-bali': ['living-in-chiang-mai', 'living-in-da-nang', 'living-in-bangkok'],
  'living-in-mexico-city': ['living-in-medellin', 'living-in-buenos-aires', 'paraguay-tax-residency-remote-workers'],
  'living-in-medellin': ['living-in-mexico-city', 'living-in-buenos-aires', 'living-in-cape-town'],
  'living-in-buenos-aires': ['living-in-mexico-city', 'living-in-medellin', 'paraguay-tax-residency-remote-workers'],
  'paraguay-tax-residency-remote-workers': ['living-in-buenos-aires', 'living-in-medellin', 'living-in-mexico-city'],
  'living-in-cape-town': ['living-in-lisbon', 'living-in-medellin', 'living-in-bali'],
  'how-to-choose-next-nomad-base': ['living-in-lisbon', 'living-in-chiang-mai', 'living-in-mexico-city'],
  'where-to-go-next-by-season': ['living-in-lisbon', 'living-in-chiang-mai', 'living-in-mexico-city'],
  'best-places-digital-nomads-2025': ['living-in-lisbon', 'living-in-chiang-mai', 'living-in-mexico-city'],
  'living-in-madrid': ['living-in-barcelona', 'living-in-valencia', 'living-in-lisbon'],
  'living-in-hoi-an': ['living-in-da-nang', 'living-in-ho-chi-minh-city', 'living-in-chiang-mai'],
  'living-in-tallinn': ['living-in-prague', 'living-in-budapest', 'living-in-tbilisi'],
};

const GENERAL_GUIDES = [
  'how-to-choose-next-nomad-base',
  'where-to-go-next-by-season',
  'best-places-digital-nomads-2025',
] as const;

const LIVING_EXTRAS = ['how-to-choose-next-nomad-base', 'where-to-go-next-by-season'] as const;

const DISPLAY_NAMES: Record<string, string> = {
  'paraguay-tax-residency-remote-workers': 'Paraguay Tax Residency for Remote Workers',
  'how-to-choose-next-nomad-base': 'How to Choose Your Next Nomad Base',
  'where-to-go-next-by-season': 'Where to Go Next by Season',
  'best-places-digital-nomads-2025': 'Best Places for Digital Nomads in 2026',
};

const PLAIN_DETAILS: Record<string, string> = {
  'paraguay-tax-residency-remote-workers': 'Territorial tax residency for remote workers in Asunción.',
  'how-to-choose-next-nomad-base': 'Pick a base from budget, internet, safety, and visa fit.',
  'where-to-go-next-by-season': 'A calendar of workable weather, season by season.',
  'best-places-digital-nomads-2025': 'A 2026 shortlist of digital nomad bases.',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export interface RelatedGuideEntry {
  slug: string;
  name: string;
  detail: string;
}

export interface RelatedDestinationEntry {
  slug: string;
  name: string;
}

export class UnpublishedRelatedGuideError extends Error {
  constructor(guideSlug: string, targetSlug: string) {
    super(`Related guides for ${guideSlug} include unpublished target ${targetSlug}`);
    this.name = 'UnpublishedRelatedGuideError';
  }
}

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const citySlugByName = new Map<string, string>();
const ambiguousCityNames = new Set<string>();
for (const { city, slug } of allCitySlugs()) {
  if (subAreaBySlug(slug)) continue;
  const key = fold(city.name);
  const existing = citySlugByName.get(key);
  if (ambiguousCityNames.has(key)) continue;
  if (existing && existing !== slug) {
    ambiguousCityNames.add(key);
    citySlugByName.delete(key);
    continue;
  }
  citySlugByName.set(key, slug);
}

function cityForLivingGuide(slug: string): City | null {
  if (!slug.startsWith('living-in-')) return null;
  return findCityBySlug(slug.slice('living-in-'.length))?.city ?? null;
}

function regionOf(slug: string): City['region'] | null {
  return cityForLivingGuide(slug)?.region ?? null;
}

/** Compact best-month runs, with a year wrap such as Nov-Feb. Hyphen-minus only. */
export function compactMonthRange(months: readonly string[]): string {
  const indexes = [...new Set(months.map((month) => MONTHS.indexOf(month as (typeof MONTHS)[number])))]
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);
  if (indexes.length === 0) return '';

  const runs: number[][] = [];
  let current = [indexes[0]];
  for (let i = 1; i < indexes.length; i += 1) {
    if (indexes[i] === indexes[i - 1] + 1) current.push(indexes[i]);
    else {
      runs.push(current);
      current = [indexes[i]];
    }
  }
  runs.push(current);

  if (runs.length > 1 && runs[0][0] === 0 && runs[runs.length - 1][runs[runs.length - 1].length - 1] === 11) {
    const last = runs.pop();
    const first = runs.shift();
    if (last && first) runs.unshift([...last, ...first]);
  }

  return runs
    .map((run) => {
      const start = MONTHS[run[0]];
      const end = MONTHS[run[run.length - 1]];
      if (!start || !end || run.length === 1) return start ?? '';
      return `${start}-${end}`;
    })
    .filter(Boolean)
    .join(', ');
}

function formatUsd(amount: number): string {
  const digits = Math.abs(Math.round(amount)).toString();
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${amount < 0 ? '-' : ''}$${withCommas}`;
}

/**
 * Solo cost, headline Mbps, and best months from the destination city row.
 * " est." follows a figure the destination page already flags: solo cost when
 * dataSource is estimated, and Mbps when internet reliability is a formula default
 * (Valencia, Madrid, and Hoi An today).
 */
export function cityDataLine(city: City): string {
  const soloEstimate = city.dataSource === 'estimated' ? ' est.' : '';
  const mbpsEstimate = city.formulaEstimates?.internetReliability ? ' est.' : '';
  const months = compactMonthRange(city.weather?.bestMonths ?? []);
  const best = months ? `, best ${months}` : '';
  return `${formatUsd(city.costUSD)} solo${soloEstimate}, ${city.internetMbps} Mbps${mbpsEstimate}${best}`;
}

export function guideDisplayName(slug: string): string {
  const fixed = DISPLAY_NAMES[slug];
  if (fixed) return fixed;
  const city = cityForLivingGuide(slug);
  if (city) return `Living in ${city.name}`;
  return slug;
}

function guideDetail(slug: string): string {
  const plain = PLAIN_DETAILS[slug];
  if (plain) return plain;
  const city = cityForLivingGuide(slug);
  if (city) return cityDataLine(city);
  return 'A Nomad Spin guide.';
}

function unique(slugs: readonly string[]): string[] {
  const seen = new Set<string>();
  const items: string[] = [];
  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    items.push(slug);
  }
  return items;
}

function extraGuides(slug: string, published: ReadonlySet<string>): string[] {
  const pool = (GENERAL_GUIDES as readonly string[]).includes(slug) ? GENERAL_GUIDES : LIVING_EXTRAS;
  return pool.filter((item) => item !== slug && published.has(item));
}

function sameRegionPeers(slug: string, published: readonly string[]): string[] {
  const region = regionOf(slug);
  const living = published
    .filter((item) => item !== slug && item.startsWith('living-in-'))
    .sort((a, b) => a.localeCompare(b));
  const inRegion = region ? living.filter((item) => regionOf(item) === region) : [];
  const picked = inRegion.slice(0, 3);
  if (picked.length >= 3) return picked;
  for (const item of living) {
    if (picked.length >= 3) break;
    if (!picked.includes(item)) picked.push(item);
  }
  return picked;
}

/**
 * Five related guides for a published slug: the peer map (or 3 same-region
 * guides when the slug has no row) plus the two general extras. An unpublished
 * slug returns nothing, even when the peer map has a row for it.
 */
export function relatedGuideEntries(
  slug: string,
  catalog: readonly { slug: string }[] = guides,
): RelatedGuideEntry[] {
  const publishedList = catalog.map((item) => item.slug);
  const published = new Set(publishedList);
  if (!published.has(slug)) return [];

  const mapped = RELATED_GUIDE_PEERS[slug];
  let peers: string[];
  if (mapped) {
    for (const target of mapped) {
      if (!published.has(target)) throw new UnpublishedRelatedGuideError(slug, target);
    }
    peers = [...mapped];
  } else {
    peers = sameRegionPeers(slug, publishedList);
  }

  const slugs = unique([...peers, ...extraGuides(slug, published)].filter((item) => item !== slug && published.has(item)));
  return slugs.map((item) => ({
    slug: item,
    name: guideDisplayName(item),
    detail: guideDetail(item),
  }));
}

function cellText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function markdownTables(content: string): string[][][] {
  const tables: string[][][] = [];
  let current: string[][] = [];
  const flush = () => {
    if (current.length > 0) tables.push(current);
    current = [];
  };
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      flush();
      continue;
    }
    const cells = trimmed.split('|').slice(1, -1).map((cell) => cellText(cell));
    if (cells.every((cell) => /^:?-+:?$/.test(cell.replace(/\s/g, '')))) continue;
    current.push(cells);
  }
  flush();
  return tables;
}

function htmlTables(content: string): string[][][] {
  const tables: string[][][] = [];
  const tablePattern = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch: RegExpExecArray | null;
  while ((tableMatch = tablePattern.exec(content))) {
    const rows: string[][] = [];
    const rowPattern = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowPattern.exec(tableMatch[1]))) {
      const cells: string[] = [];
      const cellPattern = /<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi;
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellPattern.exec(rowMatch[1]))) cells.push(cellText(cellMatch[1]));
      if (cells.length > 0) rows.push(cells);
    }
    if (rows.length > 0) tables.push(rows);
  }
  return tables;
}

function citySlugsFromTable(rows: string[][]): string[] {
  if (rows.length === 0) return [];
  const header = rows[0].map((cell) => fold(cell));
  const slugs: string[] = [];
  const push = (label: string) => {
    const slug = citySlugByName.get(fold(label));
    if (!slug || slugs.includes(slug) || subAreaBySlug(slug)) return;
    slugs.push(slug);
  };
  if (header[0] === 'city') {
    for (const row of rows.slice(1)) push(row[0] ?? '');
    return slugs;
  }
  if (header[0] === 'field') {
    for (const label of rows[0].slice(1)) push(label);
    return slugs;
  }
  return [];
}

function comparisonTableSlugs(content: string): string[] {
  let best: string[] = [];
  for (const table of [...markdownTables(content), ...htmlTables(content)]) {
    const slugs = citySlugsFromTable(table);
    if (slugs.length > best.length) best = slugs;
  }
  return best.length >= 2 ? best : [];
}

function destinationEntry(slug: string): RelatedDestinationEntry | null {
  const hub = canonicalHubSlug(slug);
  if (subAreaBySlug(hub)) return null;
  const resolved = findCityBySlug(hub);
  if (!resolved || subAreaBySlug(resolved.canonicalSlug)) return null;
  return { slug: resolved.canonicalSlug, name: resolved.city.name };
}

/** Comparison-table hubs when the guide has one, otherwise its destination list. Sub-areas are dropped. */
export function relatedDestinationEntries(
  guide: Pick<Guide, 'content' | 'relatedDestinations'>,
): RelatedDestinationEntry[] {
  const fromTable = comparisonTableSlugs(guide.content);
  const source = fromTable.length >= 2 ? fromTable : (guide.relatedDestinations ?? []);
  const seen = new Set<string>();
  const entries: RelatedDestinationEntry[] = [];
  for (const slug of source) {
    const entry = destinationEntry(slug);
    if (!entry || seen.has(entry.slug)) continue;
    seen.add(entry.slug);
    entries.push(entry);
  }
  return entries;
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function relatedGuidesHtml(slug: string): string {
  const items = relatedGuideEntries(slug);
  if (items.length === 0) return '';
  const list = items
    .map((item) => `<li><a href="/guides/${esc(item.slug)}">${esc(item.name)}</a><p>${esc(item.detail)}</p></li>`)
    .join('');
  return `<h2>Related guides</h2><ul>${list}</ul>`;
}

export function relatedDestinationsHtml(guide: Pick<Guide, 'content' | 'relatedDestinations'>): string {
  const items = relatedDestinationEntries(guide);
  if (items.length === 0) return '';
  const list = items
    .map((item) => `<li><a href="/destinations/${esc(item.slug)}">${esc(item.name)}</a></li>`)
    .join('');
  return `<h2>Related destinations</h2><ul>${list}</ul>`;
}
