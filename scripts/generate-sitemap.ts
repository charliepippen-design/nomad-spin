import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cities } from '../src/data/cities';
import { guides } from '../src/data/guides';
import { slugify } from '../src/lib/slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.digitalnomadspin.com';

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/guides', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-of-use', changefreq: 'yearly', priority: '0.3' },
];

const guideEntries: SitemapEntry[] = guides.map((guide) => ({
  path: `/guides/${guide.slug}`,
  lastmod: guide.date.split('T')[0],
  changefreq: 'monthly',
  priority: '0.8',
}));

const cityEntries: SitemapEntry[] = cities.map((city) => ({
  path: `/destinations/${slugify(city.name)}`,
  changefreq: 'weekly',
  priority: '0.7',
}));

const entries = [...staticEntries, ...guideEntries, ...cityEntries];

function generateSitemap(items: SitemapEntry[]) {
  const urls = items
    .map((e) => {
      const lines = [
        '  <url>',
        `    <loc>${BASE_URL}${e.path}</loc>`,
      ];
      if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority) lines.push(`    <priority>${e.priority}</priority>`);
      lines.push('  </url>');
      return lines.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
const sitemap = generateSitemap(entries);
fs.writeFileSync(outputPath, sitemap);
console.log(`sitemap.xml written with ${entries.length} entries`);
