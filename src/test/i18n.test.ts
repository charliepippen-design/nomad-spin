import { describe, expect, it } from 'vitest';
import { en } from '@/locales/en';
import manifest from '@/locales/manifest.generated.json';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_INFO,
  PUBLISHED_LOCALES,
  SEGMENTS,
  STATIC_SEGMENTS,
  type Locale,
} from '@/i18n/config';
import { getT, loadLocale } from '@/i18n/dictionary';
import { alternatesFor, localizeHref, localizePath, parsePath, routePattern } from '@/i18n/paths';
import { cities } from '@/data/cities';
import { guides } from '@/data/guides';
import { citySlug, findCityBySlug } from '@/lib/citySlug';
import { buildLocale, buildManifestSource, contentLocales } from '../../scripts/sync-locales';
import fs from 'fs';
import path from 'path';

const translated = PUBLISHED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

function marks(text: string): string {
  return [...text.matchAll(/\{(\w+)\}|<\/?(\w+)>/g)].map((m) => m[0]).sort().join(' ');
}

describe('interface text', () => {
  it.each(translated)('%s has every English key, filled, with the same placeholders', async (locale) => {
    const bundle = await loadLocale(locale);
    const problems: string[] = [];
    for (const [ns, entries] of Object.entries(en)) {
      const local = (bundle.dictionary as Record<string, Record<string, string> | undefined>)[ns] ?? {};
      for (const [key, source] of Object.entries(entries as Record<string, string>)) {
        const value = local[key];
        if (typeof value !== 'string' || !value.trim()) problems.push(`missing ${ns}.${key}`);
        else if (marks(value) !== marks(source)) problems.push(`placeholders differ in ${ns}.${key}`);
      }
      for (const key of Object.keys(local)) {
        if (!(key in (entries as Record<string, string>))) problems.push(`unknown key ${ns}.${key}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('plural keys come in complete sets', () => {
    for (const [ns, entries] of Object.entries(en)) {
      for (const key of Object.keys(entries)) {
        if (key.endsWith('_one')) expect(entries, `${ns}.${key}`).toHaveProperty(`${key.slice(0, -4)}_other`);
      }
    }
  });

  it('falls back to English for a key a language lacks, and fills placeholders', async () => {
    await loadLocale('it');
    expect(getT('en')('common.nav.guides')).toBe('Guides');
    expect(getT('it')('common.nav.guides')).toBe('Guide');
    expect(getT('it').dyn('data.does.not.exist', 'fallback')).toBe('fallback');
    expect(getT('it').n('data.unit.days', 1)).toBe('1 giorno');
    expect(getT('it').n('data.unit.days', 90)).toBe('90 giorni');
  });
});

describe('URLs', () => {
  it('English paths are never rewritten', () => {
    for (const p of ['/', '/about', '/destinations/lisbon', '/guides/living-in-lisbon', '/compare?c=a,b#x']) {
      expect(localizePath(p, 'en')).toBe(p);
      expect(parsePath(p)).toEqual({ locale: 'en', enPath: p });
    }
  });

  it('segments are unique per language and never collide with a language code', () => {
    for (const locale of LOCALES) {
      if (locale === DEFAULT_LOCALE) continue;
      const values = STATIC_SEGMENTS.map((seg) => SEGMENTS[locale][seg]);
      expect(new Set(values).size).toBe(values.length);
      for (const value of values) {
        expect(value).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        expect(LOCALES as readonly string[]).not.toContain(value);
      }
    }
    for (const seg of STATIC_SEGMENTS) expect(LOCALES as readonly string[]).not.toContain(seg);
  });

  it.each(translated)('%s static pages round-trip, with query string and hash kept', (locale) => {
    expect(localizePath('/', locale)).toBe(`/${locale}`);
    expect(parsePath(`/${locale}`)).toEqual({ locale, enPath: '/' });
    for (const seg of STATIC_SEGMENTS) {
      const local = localizePath(`/${seg}?a=1#b`, locale);
      expect(local).toBe(`/${locale}/${SEGMENTS[locale as Exclude<Locale, 'en'>][seg]}?a=1#b`);
      expect(parsePath(local!)).toEqual({ locale, enPath: `/${seg}?a=1#b` });
    }
    // An English segment typed under the prefix resolves to the same page.
    expect(parsePath(`/${locale}/destinations`).enPath).toBe('/destinations');
  });

  it.each(translated)('%s only has URLs for translated cities and guides', (locale) => {
    const data = (manifest as Record<string, { cities: string[]; guides: Record<string, string> }>)[locale];
    const destinations = SEGMENTS[locale as Exclude<Locale, 'en'>].destinations;
    const translatedSlugs = new Set(data.cities);
    for (const city of cities.slice(0, 200)) {
      const slug = citySlug(city);
      const local = localizePath(`/destinations/${slug}`, locale);
      if (translatedSlugs.has(slug)) expect(local).toBe(`/${locale}/${destinations}/${slug}`);
      else {
        expect(local).toBeNull();
        expect(localizeHref(`/destinations/${slug}`, locale)).toBe(`/destinations/${slug}`);
        expect(alternatesFor(`/destinations/${slug}`)).toEqual([]);
      }
    }
    for (const guide of guides) {
      const local = localizePath(`/guides/${guide.slug}`, locale);
      const slug = data.guides[guide.slug];
      if (slug) {
        expect(local).toBe(`/${locale}/${SEGMENTS[locale as Exclude<Locale, 'en'>].guides}/${slug}`);
        expect(parsePath(local!).enPath).toBe(`/guides/${guide.slug}`);
      } else expect(local).toBeNull();
    }
  });

  it('a language that is not published has no URLs at all', () => {
    for (const locale of LOCALES) {
      if (PUBLISHED_LOCALES.includes(locale)) continue;
      expect(localizePath('/', locale)).toBeNull();
      expect(localizePath('/about', locale)).toBeNull();
      expect(parsePath(`/${locale}/about`).locale).toBe('en');
    }
  });

  it('hreflang lists each language once plus x-default, on the English URL', () => {
    const rows = alternatesFor('/about');
    expect(rows.map((row) => row.hreflang)).toEqual([...PUBLISHED_LOCALES.map((l) => LOCALE_INFO[l].htmlLang), 'x-default']);
    expect(rows[0].href).toBe('https://www.digitalnomadspin.com/about');
    expect(rows.at(-1)!.href).toBe('https://www.digitalnomadspin.com/about');
    expect(alternatesFor('/')[1].href).toBe('https://www.digitalnomadspin.com/it');
  });

  it('route patterns keep their parameters', () => {
    expect(routePattern('/destinations/:citySlug', 'en')).toBe('/destinations/:citySlug');
    expect(routePattern('/destinations/:citySlug', 'it')).toBe('/it/destinazioni/:citySlug');
    expect(routePattern('/', 'it')).toBe('/it');
  });
});

describe('translated content', () => {
  it('generated modules and manifest are in sync with content/', () => {
    const norm = (s: string) => s.replace(/\r\n/g, '\n');
    for (const locale of contentLocales()) {
      const out = buildLocale(locale);
      const dir = path.resolve(__dirname, `../locales/${locale}`);
      expect(norm(fs.readFileSync(path.join(dir, 'cities.generated.ts'), 'utf-8'))).toBe(out.citiesSource);
      expect(norm(fs.readFileSync(path.join(dir, 'guides.generated.ts'), 'utf-8'))).toBe(out.guidesSource);
    }
    expect(norm(fs.readFileSync(path.resolve(__dirname, '../locales/manifest.generated.json'), 'utf-8'))).toBe(buildManifestSource());
  });

  it.each(translated)('%s city slugs in the manifest are real cities and guide slugs are unique', (locale) => {
    const data = (manifest as Record<string, { cities: string[]; guides: Record<string, string> }>)[locale];
    for (const slug of data.cities) expect(findCityBySlug(slug)?.canonicalSlug, slug).toBe(slug);
    const local = Object.values(data.guides);
    expect(new Set(local).size).toBe(local.length);
    const english = new Set(guides.map((guide) => guide.slug));
    for (const slug of Object.keys(data.guides)) expect(english.has(slug), slug).toBe(true);
  });
});
