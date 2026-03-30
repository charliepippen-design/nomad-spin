import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Provide __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Supabase client ────────────────────────────────────────────────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ── Static fallback guides ─────────────────────────────────────────────────
import { guides as staticGuides } from '../src/data/guides';

// ── Helpers ────────────────────────────────────────────────────────────────
function toSlug(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/--+/g, '-');
}

function stripMarkdownAndHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ') // strip HTML
    .replace(/[#*`_~]/g, '') // strip simple md symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip links [text](url) -> text
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

// ── Fetch live guides ──────────────────────────────────────────────────────
async function fetchLiveGuides() {
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
    const liveGuides = data.map((row: { id: number; city: string; title: string; content: string; created_at: string }) => ({
      id: String(row.id),
      slug: toSlug(row.city),
      title: row.title,
      excerpt: excerptFromContent(row.content),
      date: row.created_at,
      readTime: calcReadTime(row.content),
      content: row.content,
    }));
    // Merge: live takes precedence, static fills gaps
    const liveSlugSet = new Set(liveGuides.map(g => g.slug));
    const fallbacks = staticGuides.filter(g => !liveSlugSet.has(g.slug));
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

function createHtmlFile(route: string, title: string, description: string, filename: string = 'index.html') {
  const targetDir = path.join(distDir, route);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const desc = description.replace(/"/g, '&quot;');
  const customHtml = baseHtml
    .replace(/<title>.*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${desc}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${desc}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${desc}" />`);

  fs.writeFileSync(path.join(targetDir, filename), customHtml);
  console.log(`✅ Generated: /${route === '' ? filename : route + '/' + filename}`);
}

// ── Main ───────────────────────────────────────────────────────────────────
(async () => {
  const guides = await fetchLiveGuides();

  // 1. SPA fallback
  fs.copyFileSync(indexHtmlPath, path.join(distDir, '404.html'));
  console.log('✅ Generated SPA fallback: /404.html');

  // 2. Static core pages
  createHtmlFile('about', 'About Us – Nomad Spin', 'Learn about Nomad Spin and how we help digital nomads find their perfect base.');
  createHtmlFile('guides', 'Digital Nomad Guides & Analysis – Nomad Spin', 'Read our curated guides, tax analyses, and deep dives for digital nomads and remote workers.');
  createHtmlFile('contact', 'Contact Us – Nomad Spin', 'Get in touch with the Nomad Spin team.');
  createHtmlFile('privacy-policy', 'Privacy Policy – Nomad Spin', 'Read our privacy policy and how we protect your data.');
  createHtmlFile('terms-of-use', 'Terms of Use – Nomad Spin', 'Read our terms of service.');

  // 3. Guide pages
  console.log(`\n📚 Generating ${guides.length} guide pages...`);
  guides.forEach((guide) => {
    createHtmlFile(`guides/${guide.slug}`, `${guide.title} – Nomad Spin Guides`, guide.excerpt);
  });

  // 4. Sitemap
  console.log('\n🗺️ Generating sitemap.xml...');
  const today = new Date().toISOString().split('T')[0];
  const baseUrl = 'https://digitalnomadspin.com';

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/guides</loc>
    <lastmod>${today}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>
`;

  guides.forEach((guide) => {
    const lastmod = guide.date ? guide.date.split('T')[0] : today;
    sitemapXml += `  <url>
    <loc>${baseUrl}/guides/${guide.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.8</priority>
  </url>\n`;
  });

  sitemapXml += `</urlset>`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
  console.log('✅ Generated: /sitemap.xml');

  console.log('\n✨ Post-Build Generation Complete!');
})();
