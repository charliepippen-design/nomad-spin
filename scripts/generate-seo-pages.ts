import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { guides as staticGuides, type Guide } from '../src/data/guides';
import { allCitySlugs } from '../src/lib/citySlug';
import type { City } from '../src/data/cities';
import {
  destinationIntro,
  destinationMetaDescription,
  destinationPageTitle,
  destinationJsonLd,
  relatedGuidesForCity,
  formatMonths,
} from '../src/lib/destinationSeo';
import { visaPathSentence } from '../src/lib/visaCopy';
import { buildNotFoundHtml } from './not-found-page';

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

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectSeo(
  html: string,
  opts: {
    title: string;
    description: string;
    url: string;
    ogType?: string;
    image?: string;
    jsonLd?: object | object[];
  }
): string {
  const desc = esc(opts.description);
  const title = esc(opts.title);
  const url = esc(opts.url);
  const ogType = opts.ogType ?? 'website';
  const image = esc(opts.image ?? `${BASE_URL}/og-preview.png`);
  const jsonLdBlock = opts.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(opts.jsonLd).replace(/</g, '\\u003c')}</script>`
    : '';

  let out = html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${desc}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${desc}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${ogType}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${desc}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);

  // Drop the homepage WebSite/Organization graph so destination pages don't claim to be the homepage.
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLdBlock || '');
  return out;
}

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

function destinationBodyHtml(city: City, slug: string): string {
  const intro = destinationIntro(city);
  const pros = city.pros.slice(0, 5).map((p) => `<li>${esc(p)}</li>`).join('');
  const cons = city.cons.slice(0, 3).map((c) => `<li>${esc(c)}</li>`).join('');
  const vibes = (city.vibe ?? []).map((v) => `<li>${esc(v)}</li>`).join('');
  const landscapes = (city.landscape ?? []).map((l) => `<li>${esc(l)}</li>`).join('');
  const best = formatMonths(city.weather?.bestMonths);
  const rainy = formatMonths(city.weather?.rainyMonths);
  const related = relatedGuidesForCity(city);
  const relatedHtml = related.length
    ? `<h2>Related guides</h2><ul>${related
        .map(
          (g) =>
            `<li><a href="${BASE_URL}/guides/${esc(g.slug)}" style="color:#34d399">${esc(g.title)}</a> — ${esc(g.excerpt)}</li>`
        )
        .join('')}</ul>`
    : '';

  return `
<main id="seo-destination" style="max-width:42rem;margin:2rem auto;padding:0 1.25rem;font-family:ui-sans-serif,system-ui,sans-serif;color:#e5e7eb;background:#0b0f14">
  <p><a href="/" style="color:#34d399">← Spin the globe</a> · <a href="/guides" style="color:#34d399">Guides</a></p>
  <h1>${esc(city.name)}, ${esc(city.country)}</h1>
  <p>${esc(intro)}</p>
  <h2>Key stats for digital nomads</h2>
  <ul>
    <li><strong>Cost of living (solo / month):</strong> $${city.costUSD}</li>
    <li><strong>Long-term monthly estimate:</strong> $${city.financials.costLongTerm}</li>
    <li><strong>Median Airbnb (night):</strong> $${city.financials.airbnbMedian}</li>
    <li><strong>Internet:</strong> ${city.internetMbps} Mbps (reliability ${city.infra.internetReliability}/10)</li>
    <li><strong>Power grid stability:</strong> ${city.infra.powerGridStability}/10</li>
    <li><strong>Coworking density:</strong> ${esc(city.infra.coworkingDensity)}</li>
    <li><strong>Safety:</strong> ${city.safety}/10 (female safety ${city.vibeMetrics.femaleSafety}/10)</li>
    <li><strong>Visa:</strong> ${esc(visaPathSentence(city.meta))}</li>
    <li><strong>Timezone:</strong> ${esc(city.meta.timeZoneUtc || '—')}</li>
    <li><strong>Language:</strong> ${esc(city.language || '—')}</li>
    <li><strong>Region:</strong> ${esc(city.region)}</li>
    ${best ? `<li><strong>Best months:</strong> ${esc(best)}</li>` : ''}
    ${rainy ? `<li><strong>Rainy months:</strong> ${esc(rainy)}</li>` : ''}
    ${city.weather?.tempAvgC != null ? `<li><strong>Avg temperature:</strong> ${city.weather.tempAvgC}°C</li>` : ''}
  </ul>
  ${vibes ? `<h2>Vibe tags</h2><ul>${vibes}</ul>` : ''}
  ${landscapes ? `<h2>Landscape</h2><ul>${landscapes}</ul>` : ''}
  ${pros ? `<h2>Why go</h2><ul>${pros}</ul>` : ''}
  ${cons ? `<h2>Trade-offs</h2><ul>${cons}</ul>` : ''}
  ${relatedHtml}
  <h2>Find your next base</h2>
  <p>Compare ${esc(city.name)} against your budget, internet, and safety floors — then <a href="/" style="color:#34d399">spin the globe</a> for a match, or browse more <a href="/guides" style="color:#34d399">nomad guides</a>.</p>
  <p><a href="${BASE_URL}/destinations/${slug}" style="color:#34d399">Open the full ${esc(city.name)} destination page</a>.</p>
</main>`;
}

function guideBodyHtml(guide: Guide): string {
  return `
<main id="seo-guide" style="max-width:42rem;margin:2rem auto;padding:0 1.25rem;font-family:ui-sans-serif,system-ui,sans-serif;color:#e5e7eb;background:#0b0f14">
  <p><a href="/guides" style="color:#34d399">← Guides</a> · <a href="/" style="color:#34d399">Spin the globe</a></p>
  <h1>${esc(guide.title)}</h1>
  <p>${esc(guide.excerpt)}</p>
  <p>${esc(guide.readTime)} · Published ${esc(guide.date.split('T')[0])}</p>
  <p><a href="${BASE_URL}/guides/${guide.slug}" style="color:#34d399">Open the full guide</a></p>
</main>`;
}

function withVisibleBody(html: string, body: string): string {
  // Put crawlable content INSIDE #root. React replace()s it on mount for users;
  // crawlers that don't run JS still see title, meta, JSON-LD and the visible stats.
  return html.replace(/<div id="root"><\/div>/, `<div id="root">${body}</div>`);
}

(async () => {
  // Real 404 (noindex, no canonical). Vercel serves dist/404.html with HTTP 404
  // when /guides/:slug or /destinations/:slug has no prerendered file.
  // Other SPA routes still rewrite to index.html.
  fs.writeFileSync(path.join(distDir, '404.html'), buildNotFoundHtml());
  console.log('✅ Generated noindex 404 page: /404.html');

  const guides = await fetchLiveGuides();

  // Static core pages
  createHtmlFile('about', 'About Us – Nomad Spin', 'Learn about Nomad Spin and how we help digital nomads find their perfect base.');
  createHtmlFile('guides', 'Digital Nomad Guides & Analysis – Nomad Spin', 'Read our curated guides, tax analyses, and deep dives for digital nomads and remote workers.');
  createHtmlFile('contact', 'Contact Us – Nomad Spin', 'Get in touch with the Nomad Spin team.');
  createHtmlFile('privacy-policy', 'Privacy Policy – Nomad Spin', 'Read our privacy policy and how we protect your data.');
  createHtmlFile('terms-of-use', 'Terms of Use – Nomad Spin', 'Read our terms of service.');

  // 3. Guide pages
  console.log(`\n📚 Generating ${guides.length} guide pages...`);
  for (const guide of guides) {
    const title = `${guide.seoTitle ?? guide.title} – Nomad Spin Guides`;
    const url = `${BASE_URL}/guides/${guide.slug}`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      url,
      datePublished: guide.date,
      dateModified: guide.updated ?? guide.date,
      description: guide.excerpt,
      author: { '@type': 'Organization', name: 'Nomad Spin', url: BASE_URL },
      publisher: { '@type': 'Organization', name: 'Nomad Spin', logo: `${BASE_URL}/favicon.svg` },
    };
    writeRoute(
      `guides/${guide.slug}`,
      withVisibleBody(
        injectSeo(baseHtml, { title, description: guide.excerpt, url, ogType: 'article', jsonLd }),
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
    const jsonLd = destinationJsonLd(city, url);
    writeRoute(
      `destinations/${slug}`,
      withVisibleBody(
        injectSeo(baseHtml, { title, description, url, jsonLd }),
        destinationBodyHtml(city, slug)
      )
    );
  }

  // 5. Sitemap is produced by scripts/generate-sitemap.ts (prebuild) into public/sitemap.xml
  //    and copied to dist by Vite. Do NOT overwrite it here.

  console.log('\n✨ Post-Build Generation Complete!');
})();
