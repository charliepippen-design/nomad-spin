import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { guides as staticGuides, type Guide } from '../src/data/guides';
import { allCitySlugs } from '../src/lib/citySlug';
import {
  destinationMetaDescription,
  destinationPageTitle,
} from '../src/lib/destinationSeo';
import { destinationBodyHtml, destinationPageJsonLd } from '../src/lib/destinationPrerender';
import { canonicalDestinationPath, destinationRobotsContent, insertRobotsMeta } from '../src/lib/subAreaDestinations';
import { guideBodyHtml, guidesIndexBodyHtml, guideTitleTag, guidesIndexDescription, guidesIndexTitle } from '../src/lib/guideHtml';
import { guideFaqJsonLd } from '../src/lib/guideFaq';
import { guideArticleJsonLd, guideBreadcrumbJsonLd, guidesIndexBreadcrumbJsonLd } from '../src/lib/guideJsonLd';
import { homeBodyHtml, homeDescription, homeTitle } from '../src/lib/homeSeo';
import { citiesByRegion, regionLabel } from '../src/lib/destinationIndex';
import { citySocialImage, guideSocialImage } from '../src/lib/socialImage';
import { esc, injectAlternates, injectSeo } from '../src/lib/prerenderHead';
import { buildNotFoundHtml } from './not-found-page';
import { staticPageBodyHtml, staticPagesPrerender } from '../src/lib/staticPagesPrerender';
import { DEFAULT_LOCALE, LOCALE_INFO, PUBLISHED_LOCALES, type Locale } from '../src/i18n/config';
import { getT, loadLocale } from '../src/i18n/dictionary';
import { localizedGuides } from '../src/i18n/content';
import { absoluteUrl, alternatesFor, localizeHref, localizePath } from '../src/i18n/paths';
import { cityDisplayName } from '../src/i18n/content';
import { countryName, formatNumber } from '../src/i18n/format';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.digitalnomadspin.com';

// ── Supabase client (optional live guides) ─────────────────────────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function toSlug(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/--+/g, '-');
}

function stripMarkdownAndHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*`_~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerptFromContent(content: string): string {
  const plain = stripMarkdownAndHtml(content);
  if (plain.length <= 160) return plain;
  return plain.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

function calcReadTime(content: string): string {
  const words = stripMarkdownAndHtml(content).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

async function fetchLiveGuides(): Promise<Guide[]> {
  if (!supabase) {
    console.warn('⚠️  No Supabase credentials — using static guides only');
    return staticGuides;
  }
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('id, city, title, content, created_at')
      .order('created_at', { ascending: false });
    if (error || !data) throw error ?? new Error('No data');
    const liveGuides: Guide[] = data.map((row: { id: number; city: string; title: string; content: string; created_at: string }) => ({
      id: String(row.id),
      slug: toSlug(row.city),
      title: row.title,
      excerpt: excerptFromContent(row.content),
      date: row.created_at,
      readTime: calcReadTime(row.content),
      content: row.content,
    }));
    const liveSlugSet = new Set(liveGuides.map((g) => g.slug));
    const fallbacks = staticGuides.filter((g) => !liveSlugSet.has(g.slug));
    console.log(`✅ Fetched ${liveGuides.length} live guide(s) from Supabase + ${fallbacks.length} static fallback(s)`);
    return [...liveGuides, ...fallbacks];
  } catch (err) {
    console.warn('⚠️  Supabase fetch failed — falling back to static guides:', err);
    return staticGuides;
  }
}

const distDir = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

console.log('🚀 Starting Post-Build SEO HTML Generation...');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ Error: dist/index.html not found. Please run this after vite build.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

function writeRoute(route: string, html: string, filename = 'index.html') {
  const targetDir = path.join(distDir, route);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, filename), html);
  console.log(`✅ Generated: /${route === '' ? filename : `${route}/${filename}`}`);
}


function destinationsIndexBodyHtml(locale: Locale = DEFAULT_LOCALE): string {
  const t = getT(locale);
  const english = locale === DEFAULT_LOCALE;
  const sections = citiesByRegion('', locale)
    .map((group) => {
      const items = group.cities
        .map(({ city, slug }) => {
          const href = localizeHref(canonicalDestinationPath(slug), locale);
          const name = cityDisplayName(city, locale);
          const country = countryName(city.countryCode, city.country, locale);
          const cost = english ? String(city.costUSD) : formatNumber(city.costUSD, locale);
          return `<li><a href="${esc(href)}" style="color:#007a52">${esc(name)}, ${esc(country)}</a> ($${cost}${esc(t('data.metric.perMonth'))})</li>`;
        })
        .join('');
      return `<h2>${esc(regionLabel(group.region, locale))}</h2><ul>${items}</ul>`;
    })
    .join('');

  return `
<main id="seo-destinations" style="max-width:48rem;margin:2rem auto;padding:0 1.25rem;font-family:Georgia,'Source Serif 4',serif;font-weight:400;line-height:1.6;color:#1c1917;background:#fff">
  <h1>${esc(t('tools.dest.h1'))}</h1>
  <p>${esc(t('tools.dest.prerenderIntro'))}</p>
  ${sections}
</main>`;
}

function withVisibleBody(html: string, body: string): string {
  // Put crawlable content INSIDE #root. React replace()s it on mount for users;
  // crawlers that don't run JS still see title, meta, JSON-LD and the visible stats.
  return html.replace(/<div id="root"><\/div>/, `<div id="root">${body}</div>`);
}

(async () => {
  // Real 404 (noindex, no canonical). Vercel serves dist/404.html with HTTP 404
  // when no static file matches and the path is not an allowlisted SPA route.
  // Unknown /guides and /destinations slugs stay filesystem-only, same as before.
  fs.writeFileSync(path.join(distDir, '404.html'), buildNotFoundHtml());
  console.log('✅ Generated noindex 404 page: /404.html');

  const liveGuides = await fetchLiveGuides();

  for (const locale of PUBLISHED_LOCALES) {
    await loadLocale(locale);
    const english = locale === DEFAULT_LOCALE;
    // English pages keep the head they always had; other languages state theirs.
    const lang = english ? undefined : { htmlLang: LOCALE_INFO[locale].htmlLang, ogLocale: LOCALE_INFO[locale].ogLocale };
    /** Folder of an English path in this language, or null when the page is not translated. */
    const routeOf = (enPath: string): string | null => {
      const localized = localizePath(enPath, locale);
      return localized === null ? null : localized.replace(/^\//, '');
    };
    if (!english) console.log(`\n🌐 Language: ${locale}`);

    // Home: keep the WebSite/Organization JSON-LD already in index.html, add a crawlable body.
    if (english) {
      writeRoute('', injectAlternates(withVisibleBody(baseHtml, homeBodyHtml(staticGuides)), alternatesFor('/')));
    } else {
      const homeUrl = absoluteUrl('/', locale);
      const graph = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(baseHtml)![1]);
      for (const node of graph['@graph'] ?? []) {
        if (node['@type'] !== 'WebSite') continue;
        node.url = homeUrl;
        node.description = homeDescription(locale);
        node.inLanguage = LOCALE_INFO[locale].htmlLang;
      }
      writeRoute(
        routeOf('/')!,
        withVisibleBody(
          injectSeo(baseHtml, {
            title: homeTitle(locale),
            description: homeDescription(locale),
            url: homeUrl,
            jsonLd: graph,
            lang,
            alternates: alternatesFor('/'),
          }),
          homeBodyHtml(staticGuides, locale),
        ),
      );
    }

    // Static core pages
    // Each gets its own title, description, canonical, H1 and text in the raw HTML.
    for (const page of staticPagesPrerender(locale)) {
      const enPath = `/${page.route}`;
      const url = absoluteUrl(enPath, locale);
      writeRoute(
        routeOf(enPath)!,
        withVisibleBody(
          injectSeo(baseHtml, {
            title: page.title,
            description: page.description,
            url,
            jsonLd: {
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: page.title,
              url,
              description: page.description,
              ...(english ? {} : { inLanguage: LOCALE_INFO[locale].htmlLang }),
            },
            lang,
            alternates: alternatesFor(enPath),
          }),
          staticPageBodyHtml(page, locale),
        ),
      );
    }

    const guidesUrl = absoluteUrl('/guides', locale);
    writeRoute(
      routeOf('/guides')!,
      withVisibleBody(
        injectSeo(baseHtml, {
          title: guidesIndexTitle(locale),
          description: guidesIndexDescription(locale),
          url: guidesUrl,
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: guidesIndexTitle(locale),
              url: guidesUrl,
              description: guidesIndexDescription(locale),
              ...(english ? {} : { inLanguage: LOCALE_INFO[locale].htmlLang }),
            },
            guidesIndexBreadcrumbJsonLd(locale),
          ],
          lang,
          alternates: alternatesFor('/guides'),
        }),
        english ? guidesIndexBodyHtml(staticGuides) : guidesIndexBodyHtml(localizedGuides(locale), locale, staticGuides),
      ),
    );

    const destinationsIndexUrl = absoluteUrl('/destinations', locale);
    const t = getT(locale);
    writeRoute(
      routeOf('/destinations')!,
      withVisibleBody(
        injectSeo(baseHtml, {
          title: t('tools.dest.metaTitle'),
          description: t('tools.dest.metaDescription'),
          url: destinationsIndexUrl,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: t('tools.dest.h1'),
            url: destinationsIndexUrl,
            description: t('tools.dest.metaDescription'),
            ...(english ? {} : { inLanguage: LOCALE_INFO[locale].htmlLang }),
          },
          lang,
          alternates: alternatesFor('/destinations'),
        }),
        destinationsIndexBodyHtml(locale),
      ),
    );

    // Guide pages. English: live + static guides. Other languages: the translated guides only.
    const guides: (Guide & { sourceSlug?: string })[] = english ? liveGuides : localizedGuides(locale);
    console.log(`\n📚 Generating ${guides.length} guide pages...`);
    for (const guide of guides) {
      const enSlug = guide.sourceSlug ?? guide.slug;
      const enPath = `/guides/${enSlug}`;
      const route = english ? `guides/${guide.slug}` : routeOf(enPath);
      if (!route) continue;
      const title = guideTitleTag(guide, locale);
      const url = english ? `${BASE_URL}/guides/${guide.slug}` : absoluteUrl(enPath, locale);
      const faqJsonLd = guideFaqJsonLd(guide, locale);
      const image = guideSocialImage(enSlug);
      const jsonLd = [guideArticleJsonLd(guide, url, image.url, locale), guideBreadcrumbJsonLd(guide, url, locale), ...(faqJsonLd ? [faqJsonLd] : [])];
      writeRoute(
        route,
        withVisibleBody(
          injectSeo(baseHtml, { title, description: guide.excerpt, url, ogType: 'article', image, jsonLd, lang, alternates: alternatesFor(enPath) }),
          guideBodyHtml(guide, locale)
        )
      );
    }

    // Destination pages: one HTML shell per city with title/meta/canonical/JSON-LD + visible stats.
    // Other languages: only the cities whose text is translated.
    const destinations = allCitySlugs().filter(({ slug }) => routeOf(`/destinations/${slug}`) !== null);
    console.log(`\n🌍 Generating ${destinations.length} destination pages...`);
    for (const { city, slug } of destinations) {
      const enPath = `/destinations/${slug}`;
      const title = destinationPageTitle(city, locale);
      const description = destinationMetaDescription(city, locale);
      const url = absoluteUrl(enPath, locale);
      const jsonLd = destinationPageJsonLd(city, url, slug, locale);
      // Self canonical stays on this URL. noindex sub-area pages do not canonical to the parent hub.
      const head = insertRobotsMeta(
        injectSeo(baseHtml, { title, description, url, image: citySocialImage(city.id), jsonLd, lang, alternates: alternatesFor(enPath) }),
        destinationRobotsContent(slug),
      );
      writeRoute(
        routeOf(enPath)!,
        withVisibleBody(head, destinationBodyHtml(city, slug, locale)),
      );
    }
  }

  // Sitemap is produced by scripts/generate-sitemap.ts (prebuild) into public/sitemap.xml
  //    and copied to dist by Vite. Do NOT overwrite it here.

  console.log('\n✨ Post-Build Generation Complete!');
})();
