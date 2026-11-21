/**
 * Reads translated content from content/cities/<locale>/ and content/guides/<locale>/.
 * Shared by sync-locales.ts (build) and i18n-status.ts (translation workflow).
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cities, type City } from '../src/data/cities';
import { guides as englishGuides, type Guide } from '../src/data/guides';
import type { Locale } from '../src/i18n/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CONTENT_ROOT = path.resolve(__dirname, '../content');

export interface CityFile {
  /** "published" goes live. Anything else ("draft", "review") is ignored by the build. */
  status: string;
  /** Hash of the English text this was translated from (set by `i18n-status --stamp`). */
  source_hash?: string;
  name?: string;
  pros: string[];
  cons: string[];
  legalNotes?: string[];
  taxation?: { incomeTax?: string; notes?: string };
  visaNote?: string;
}

export interface GuideFile {
  status: string;
  source_hash?: string;
  /** Slug of the guide in this language. Lowercase letters, digits and dashes. */
  slug: string;
  title: string;
  seo?: { meta_title?: string; short_title?: string; meta_description?: string };
}

function sha(value: string): string {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 12);
}

/** Changes whenever the English text a city translation covers changes. */
export function citySourceHash(city: City): string {
  return sha(
    JSON.stringify({
      name: city.name,
      pros: city.pros,
      cons: city.cons,
      legalNotes: city.legalNotes,
      taxation: city.taxation,
      visaNote: city.meta.visaNote ?? null,
    }),
  );
}

/** Changes whenever the English guide changes. */
export function guideSourceHash(guide: Guide): string {
  return sha(JSON.stringify({ title: guide.title, excerpt: guide.excerpt, content: guide.content }));
}

export const cityById = new Map(cities.map((city) => [city.id, city]));
export const guideBySlug = new Map(englishGuides.map((guide) => [guide.slug, guide]));

function listJson(dir: string): string[] {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith('.json')).sort() : [];
}

export interface CityEntry {
  id: string;
  file: string;
  data: CityFile;
  city: City;
  stale: boolean;
}

/** Every city file of a language, checked against the English record. Throws on a malformed file. */
export function readCityFiles(locale: Locale): CityEntry[] {
  const dir = path.join(CONTENT_ROOT, 'cities', locale);
  return listJson(dir).map((name) => {
    const file = path.join(dir, name);
    const id = name.replace(/\.json$/, '');
    const city = cityById.get(id);
    if (!city) throw new Error(`${file}: no city with id "${id}"`);
    const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as CityFile;
    const sameLength = (key: 'pros' | 'cons' | 'legalNotes') => {
      const translated = data[key];
      if (key === 'legalNotes' && translated === undefined && city.legalNotes.length === 0) return;
      if (!Array.isArray(translated) || translated.length !== city[key].length || translated.some((line) => !line || !line.trim())) {
        throw new Error(`${file}: "${key}" must have ${city[key].length} non-empty line(s), like the English record`);
      }
    };
    sameLength('pros');
    sameLength('cons');
    sameLength('legalNotes');
    if (city.meta.visaNote && !data.visaNote?.trim()) throw new Error(`${file}: "visaNote" is missing (the English record has one)`);
    if (city.taxation.notes && !data.taxation?.notes?.trim()) throw new Error(`${file}: "taxation.notes" is missing (the English record has one)`);
    return { id, file, data, city, stale: !!data.source_hash && data.source_hash !== citySourceHash(city) };
  });
}

export interface GuideEntry {
  sourceSlug: string;
  file: string;
  data: GuideFile;
  markdown: string;
  source: Guide;
  stale: boolean;
}

/** Every guide of a language, paired with the English guide it translates. Throws on a malformed file. */
export function readGuideFiles(locale: Locale): GuideEntry[] {
  const dir = path.join(CONTENT_ROOT, 'guides', locale);
  const seen = new Map<string, string>();
  return listJson(dir).map((name) => {
    const file = path.join(dir, name);
    const sourceSlug = name.replace(/\.json$/, '');
    const source = guideBySlug.get(sourceSlug);
    if (!source) throw new Error(`${file}: no English guide with slug "${sourceSlug}"`);
    const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as GuideFile;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug ?? '')) throw new Error(`${file}: invalid "slug"`);
    if (!data.title?.trim()) throw new Error(`${file}: "title" is missing`);
    const clash = seen.get(data.slug);
    if (clash) throw new Error(`${file}: slug "${data.slug}" is already used by ${clash}`);
    seen.set(data.slug, file);
    const mdPath = file.replace(/\.json$/, '.md');
    if (!fs.existsSync(mdPath)) throw new Error(`Missing markdown for ${file}`);
    // The article page renders the title as <h1>; drop a leading markdown H1 to avoid duplicates.
    const markdown = fs.readFileSync(mdPath, 'utf-8').replace(/^﻿?#\s[^\n]*\n+/, '').trim() + '\n';
    return { sourceSlug, file, data, markdown, source, stale: !!data.source_hash && data.source_hash !== guideSourceHash(source) };
  });
}
