import { cities } from '@/data/cities';
import { DATASET_UPDATED } from '@/data/datasetMeta';
import { BELOW_MINIMUM_CAP, CRITERIA, CRITERION_LABEL, DEFAULT_WEIGHTS } from '@/lib/matching';
import type { Locale } from '../i18n/config';
import { getT, type TFunction } from '../i18n/dictionary';
import { formatDate, formatNumber } from '../i18n/format';
import { localizeHref } from '../i18n/paths';

/**
 * Crawlable HTML for the pages that have no data-driven prerender of their own.
 * scripts/generate-seo-pages.ts writes one HTML file per entry, with its own
 * title, description, canonical, H1 and text, so the raw HTML (no JavaScript)
 * is not the home page. React replaces the body on mount.
 *
 * The text comes from the dictionary (src/locales/<locale>/static|legal|methodology.json),
 * so each language gets its own copy and its links lead to the pages in that language.
 * Outside React, await loadLocale(locale) before asking for a language other than English.
 *
 * Title, description and H1 must match the React page. src/test/staticPagesPrerender.test.tsx
 * renders each page and fails when they drift.
 */
export interface StaticPagePrerender {
  /** English path without the leading slash, e.g. "compare", whatever the language. */
  route: string;
  title: string;
  description: string;
  h1: string;
  /** Inner HTML placed after the H1. Trusted, hand-written markup. */
  body: string;
}

const A = 'style="color:#55E6B0"';

/** Month the legal pages were last revised. Keep in step with PrivacyPolicy.tsx and TermsOfUse.tsx. */
const LEGAL_UPDATED = '2026-11-01';

/** What a page body needs: the translator plus helpers bound to the language. */
interface Ctx {
  locale: Locale;
  t: TFunction;
  /** Number in the format of the language. */
  n: (value: number) => string;
  /** Anchor to a page of this site, given as an English path. */
  a: (href: string, label: string) => string;
  /** Dictionary text to HTML: <b> becomes <strong>, each tag named in `links` becomes an anchor. */
  html: (text: string, links?: Record<string, string>) => string;
}

function context(locale: Locale): Ctx {
  const a = (href: string, label: string) => `<a href="${localizeHref(href, locale)}" ${A}>${label}</a>`;
  return {
    locale,
    t: getT(locale),
    n: (value) => formatNumber(value, locale),
    a,
    html: (text, links = {}) =>
      text.replace(/<(\w+)>(.*?)<\/\1>/gs, (_match, tag: string, inner: string) => {
        if (tag === 'b') return `<strong>${inner}</strong>`;
        return links[tag] ? a(links[tag], inner) : inner;
      }),
  };
}

/** Dictionary text without its <b> / <link> marks. */
const plain = (text: string) => text.replace(/<\/?\w+>/g, '');

function methodologyBody({ locale, t, n, html }: Ctx): string {
  const total = cities.length;
  const estimated = cities.filter((c) => c.dataSource === 'estimated').length;
  const formula = (key: 'costLongTerm' | 'airbnbMedian' | 'internetReliability' | 'powerGridStability') =>
    cities.filter((c) => c.formulaEstimates?.[key]).length;
  const weightTotal = CRITERIA.reduce((sum, key) => sum + DEFAULT_WEIGHTS[key], 0);
  const weights = CRITERIA.map(
    (key) =>
      `<li>${t('methodology.prerender.match.weight', {
        label: t.dyn(`tools.criterion.${key}`, CRITERION_LABEL[key]),
        percent: Math.round((DEFAULT_WEIGHTS[key] / weightTotal) * 100),
      })}</li>`,
  ).join('');
  const cap = Math.round(BELOW_MINIMUM_CAP * 100);
  return `
  <p>${t('methodology.intro')}</p>
  <p>${t('methodology.prerender.counts', { total: n(total), editorial: n(total - estimated), estimated: n(estimated) })}</p>
  <h2>${t('methodology.kinds.title')}</h2>
  <p>${t('methodology.prerender.kinds.intro')}</p>
  <ul>
    <li>${html(t('methodology.prerender.kinds.editorial', { count: n(total - estimated) }))}</li>
    <li>${html(t('methodology.prerender.kinds.estimated', { estimated: n(estimated), total: n(total) }))}</li>
    <li>${html(t('methodology.prerender.kinds.formula'))}</li>
  </ul>
  <h2>${t('methodology.prerender.cost.title')}</h2>
  <p>${t('methodology.prerender.cost.body')}</p>
  <h2>${t('methodology.formulas.title')}</h2>
  <ul>
    <li>${t('methodology.prerender.formulas.longStay', { count: n(formula('costLongTerm')) })}</li>
    <li>${t('methodology.prerender.formulas.nightly', { count: n(formula('airbnbMedian')) })}</li>
    <li>${t('methodology.prerender.formulas.reliability', { count: n(formula('internetReliability')) })}</li>
    <li>${t('methodology.prerender.formulas.power', { count: n(formula('powerGridStability')) })}</li>
  </ul>
  <h2>${t('methodology.gaps.title')}</h2>
  <p>${t('methodology.prerender.gaps', { date: formatDate(DATASET_UPDATED, locale) })}</p>
  <h2>${t('methodology.compare.title')}</h2>
  <p>${html(t('methodology.prerender.compare'), { link: '/compare' })}</p>
  <h2>${t('methodology.match.title')}</h2>
  <p>${t('methodology.prerender.match.p1', { cap })}</p>
  <ul>${weights}</ul>
  <p>${html(t('methodology.prerender.match.p2'), { link: '/find-your-base' })}</p>
  <h2>${t('methodology.visa.title')}</h2>
  <p>${t('methodology.prerender.visa')}</p>
  <p>${html(t('methodology.prerender.wrong'), { link: '/contact' })}</p>`;
}

/**
 * The static pages in one language. `route` stays the English one ("about");
 * title, description, H1 and body are in `locale`.
 */
export function staticPagesPrerender(locale: Locale = 'en'): StaticPagePrerender[] {
  const ctx = context(locale);
  const { t, n, a, html } = ctx;
  const updated = formatDate(LEGAL_UPDATED, locale, { year: 'numeric', month: 'long' });
  const value = (key: 'discovery' | 'numbers' | 'gaps') =>
    `<li><strong>${t(`static.about.value.${key}.title`)}.</strong> ${t(`static.about.value.${key}.desc`)}</li>`;
  const tool = (name: string, key: 'vercel' | 'gtm' | 'ga4' | 'impact') =>
    `<li><strong>${name}.</strong> ${t(`legal.privacy.prerender.tool.${key}`)}</li>`;
  return [
    {
      route: 'compare',
      title: t('tools.cmp.metaTitle'),
      description: t('tools.cmp.metaDescription'),
      h1: t('tools.cmp.h1'),
      body: `
  <p>${t('static.prerender.compare.p1')}</p>
  <p>${t('static.prerender.compare.p2')}</p>
  <p>${html(t('static.prerender.compare.examples'), { link1: '/compare?cities=lisbon,porto', link2: '/compare?cities=chiang-mai,bangkok' })}</p>
  <p>${a('/destinations', t('static.prerender.compare.browseAll', { count: n(cities.length) }))} · ${a('/find-your-base', t('static.prerender.compare.findYourBase'))} · ${a('/methodology', t('static.prerender.compare.methodology'))}</p>`,
    },
    {
      route: 'find-your-base',
      title: t('tools.fyb.metaTitle'),
      description: t('tools.fyb.metaDescription'),
      h1: t('tools.fyb.h1'),
      body: `
  <p>${t('static.prerender.findYourBase.p1', { count: n(cities.length) })}</p>
  <p>${t('static.prerender.findYourBase.p2')}</p>
  <p>${a('/compare', t('static.prerender.findYourBase.compare'))} · ${a('/destinations', t('static.prerender.findYourBase.destinations'))} · ${a('/methodology', t('static.prerender.findYourBase.methodology'))}</p>`,
    },
    {
      route: 'methodology',
      title: t('methodology.title'),
      description: t('methodology.description'),
      h1: t('methodology.h1'),
      body: methodologyBody(ctx),
    },
    {
      route: 'about',
      title: t('static.about.title'),
      description: t('static.about.description'),
      h1: t('static.about.h1'),
      body: `
  <p>${t('static.about.intro')}</p>
  <p>${plain(t('static.about.database'))}</p>
  <ul>
    ${value('discovery')}
    ${value('numbers')}
    ${value('gaps')}
  </ul>
  <p>${a('/methodology', t('static.about.methodologyLink'))} · ${a('/contact', t('static.about.prerender.contactLink'))} · ${a('/destinations', t('static.prerender.shell.destinations'))} · ${a('/guides', t('static.prerender.shell.guides'))}</p>`,
    },
    {
      route: 'contact',
      title: t('static.contact.title'),
      description: t('static.contact.description'),
      h1: t('static.contact.h1'),
      body: `
  <p>${t('static.contact.prerender.intro')}</p>
  <p>${t('static.contact.prerender.report')}</p>
  <p>${a('/methodology', t('static.contact.prerender.methodologyLink'))} · ${a('/about', t('static.contact.prerender.aboutLink'))}</p>`,
    },
    {
      route: 'privacy-policy',
      title: t('legal.privacy.title'),
      description: t('legal.privacy.description'),
      h1: t('legal.privacy.h1'),
      body: `
  <p>${html(t('legal.lastUpdated', { date: updated }))}</p>
  <h2>${t('legal.privacy.s1.title')}</h2>
  <p>${t('legal.privacy.s1.body')}</p>
  <h2>${t('legal.privacy.s2.title')}</h2>
  <p>${t('legal.privacy.s2.body')}</p>
  <h2>${t('legal.privacy.s3.title')}</h2>
  <p>${t('legal.privacy.s3.intro')}</p>
  <ul>
    ${tool('Vercel Web Analytics', 'vercel')}
    ${tool('Google Tag Manager', 'gtm')}
    ${tool('Google Analytics 4', 'ga4')}
    ${tool('Impact', 'impact')}
  </ul>
  <h2>${t('legal.privacy.s4.title')}</h2>
  <p>${t('legal.privacy.prerender.s4')}</p>
  <h2>${t('legal.privacy.s5.title')}</h2>
  <p>${t('legal.privacy.prerender.s5')}</p>
  <h2>${t('legal.privacy.s6.title')}</h2>
  <p>${t('legal.privacy.prerender.s6')}</p>
  <h2>${t('legal.privacy.s7.title')}</h2>
  <p>${html(t('legal.privacy.prerender.s7'), { link: '/contact' })}</p>`,
    },
    {
      route: 'terms-of-use',
      title: t('legal.terms.title'),
      description: t('legal.terms.description'),
      h1: t('legal.terms.h1'),
      body: `
  <p>${html(t('legal.lastUpdated', { date: updated }))}</p>
  <p>${t('legal.terms.prerender.p1')}</p>
  <p>${t('legal.terms.prerender.p2')}</p>
  <p>${t('legal.terms.s4.body')}</p>
  <p>${t('legal.terms.prerender.asIs')} ${a('/contact', t('legal.contactUs'))} · ${a('/privacy-policy', t('legal.privacy.h1'))}</p>`,
    },
  ];
}

/** Body shell in the site palette, so the first paint before React mounts is not a white flash. */
export function staticPageBodyHtml(page: StaticPagePrerender, locale: Locale = 'en'): string {
  const { t, a } = context(locale);
  return `
<main id="seo-static" style="max-width:46rem;margin:2rem auto;padding:0 1.25rem;font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#F4F7FA;background:#080D16">
  <p>${a('/', 'Nomad Spin')} · ${a('/destinations', t('static.prerender.shell.destinations'))} · ${a('/guides', t('static.prerender.shell.guides'))}</p>
  <h1>${page.h1}</h1>${page.body}
</main>`;
}
