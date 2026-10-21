import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { guides as staticGuides } from '../src/data/guides';
import { allCitySlugs } from '../src/lib/citySlug';
import {
  destinationMetaDescription,
  destinationPageTitle,
} from '../src/lib/destinationSeo';
import { destinationBodyHtml, destinationPageJsonLd } from '../src/lib/destinationPrerender';
import { canonicalDestinationPath, destinationRobotsContent, insertRobotsMeta } from '../src/lib/subAreaDestinations';
import { GUIDES_INDEX_DESCRIPTION, guideBodyHtml, guidesIndexBodyHtml, guideTitleTag } from '../src/lib/guideHtml';
import { guideFaqJsonLd } from '../src/lib/guideFaq';
import { guideArticleJsonLd, guideBreadcrumbJsonLd, guidesIndexBreadcrumbJsonLd } from '../src/lib/guideJsonLd';
import { homeBodyHtml } from '../src/lib/homeSeo';
import { citiesByRegion, regionLabel } from '../src/lib/destinationIndex';
import { citySocialImage, guideSocialImage } from '../src/lib/socialImage';
import { esc, injectSeo } from '../src/lib/prerenderHead';
import { buildNotFoundHtml } from './not-found-page';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.digitalnomadspin.com';

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

function createHtmlFile(route: string, title: string, description: string, extras: { ogType?: string; jsonLd?: object } = {}) {
  const url = `${BASE_URL}/${route}`;
  writeRoute(route, injectSeo(baseHtml, { title, description, url, ...extras }));
}

function destinationsIndexBodyHtml(): string {
  const sections = citiesByRegion()
    .map((group) => {
      const items = group.cities
        .map(
          ({ city, slug }) =>
            `<li><a href="${esc(canonicalDestinationPath(slug))}" style="color:#007a52">${esc(city.name)}, ${esc(city.country)}</a> ($${city.costUSD}/mo)</li>`,
        )
        .join('');
      return `<h2>${esc(regionLabel(group.region))}</h2><ul>${items}</ul>`;
    })
    .join('');

  return `
<main id="seo-destinations" style="max-width:48rem;margin:2rem auto;padding:0 1.25rem;font-family:Georgia,'Source Serif 4',serif;font-weight:400;line-height:1.6;color:#1c1917;background:#fff">
  <h1>Destinations</h1>
  <p>City pages from the Nomad Spin dataset, grouped by region.</p>
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

  // Static guides only: same slugs as the sitemap, /guides and llms.txt.
  const guides = staticGuides;

  // Home (/): keep the WebSite/Organization JSON-LD already in index.html, add a crawlable body.
  // Other routes keep using the untouched baseHtml read above.
  writeRoute('', withVisibleBody(baseHtml, homeBodyHtml(staticGuides)));

  // Static core pages
  createHtmlFile('about', 'About Us | Nomad Spin', 'Learn about Nomad Spin and how we help digital nomads find their perfect base.');
  const guidesIndexTitle = 'Digital Nomad Guides & Analysis | Nomad Spin';
  const guidesIndexDescription = GUIDES_INDEX_DESCRIPTION;
  writeRoute(
    'guides',
    withVisibleBody(
      injectSeo(baseHtml, {
        title: guidesIndexTitle,
        description: guidesIndexDescription,
        url: `${BASE_URL}/guides`,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: guidesIndexTitle,
            url: `${BASE_URL}/guides`,
            description: guidesIndexDescription,
          },
          guidesIndexBreadcrumbJsonLd(),
        ],
      }),
      guidesIndexBodyHtml(staticGuides),
    ),
  );
  createHtmlFile('contact', 'Contact Us | Nomad Spin', 'Get in touch with the Nomad Spin team.');
  createHtmlFile('privacy-policy', 'Privacy Policy | Nomad Spin', 'Read our privacy policy and how we protect your data.');
  createHtmlFile('terms-of-use', 'Terms of Use | Nomad Spin', 'Read our terms of service.');

  const destinationsIndexUrl = `${BASE_URL}/destinations`;
  const destinationsIndexTitle = 'Destinations | Nomad Spin';
  const destinationsIndexDescription =
    'Browse digital nomad cities by region. Each page lists cost, internet, safety, and visa notes from the Nomad Spin dataset.';
  writeRoute(
    'destinations',
    withVisibleBody(
      injectSeo(baseHtml, {
        title: destinationsIndexTitle,
        description: destinationsIndexDescription,
        url: destinationsIndexUrl,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Destinations',
          url: destinationsIndexUrl,
          description: destinationsIndexDescription,
        },
      }),
      destinationsIndexBodyHtml(),
    ),
  );

  // 3. Guide pages
  console.log(`\n📚 Generating ${guides.length} guide pages...`);
  for (const guide of guides) {
    const title = guideTitleTag(guide);
    const url = `${BASE_URL}/guides/${guide.slug}`;
    const faqJsonLd = guideFaqJsonLd(guide);
    const image = guideSocialImage(guide.slug);
    const jsonLd = [guideArticleJsonLd(guide, url, image.url), guideBreadcrumbJsonLd(guide, url), ...(faqJsonLd ? [faqJsonLd] : [])];
    writeRoute(
      `guides/${guide.slug}`,
      withVisibleBody(
        injectSeo(baseHtml, { title, description: guide.excerpt, url, ogType: 'article', image, jsonLd }),
        guideBodyHtml(guide)
      )
    );
  }

  // 4. Destination pages — one HTML shell per city with title/meta/canonical/JSON-LD + visible stats
  const destinations = allCitySlugs();
  console.log(`\n🌍 Generating ${destinations.length} destination pages...`);
  for (const { city, slug } of destinations) {
    const title = destinationPageTitle(city);
    const description = destinationMetaDescription(city);
    const url = `${BASE_URL}/destinations/${slug}`;
    const jsonLd = destinationPageJsonLd(city, url, slug);
    // Self canonical stays on this URL. noindex sub-area pages do not canonical to the parent hub.
    const head = insertRobotsMeta(
      injectSeo(baseHtml, { title, description, url, image: citySocialImage(city.id), jsonLd }),
      destinationRobotsContent(slug),
    );
    writeRoute(
      `destinations/${slug}`,
      withVisibleBody(head, destinationBodyHtml(city, slug)),
    );
  }

  // 5. Sitemap is produced by scripts/generate-sitemap.ts (prebuild) into public/sitemap.xml
  //    and copied to dist by Vite. Do NOT overwrite it here.

  console.log('\n✨ Post-Build Generation Complete!');
})();
