import type { City } from '@/data/cities';
import {
  destinationFieldGuideHtml,
  destinationIntro,
  formatMonths,
  hubRelatedGuides,
} from '@/lib/destinationSeo';
import { visaPathSentence } from '@/lib/visaCopy';
import {
  rewriteSubAreaDestinationHrefs,
  subAreaBySlug,
  subAreaParentNoticeHtml,
} from '@/lib/subAreaDestinations';

const BASE_URL = 'https://www.digitalnomadspin.com';

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Crawlable destination body. Sub-area pages add a parent-hub link near the top. */
export function destinationBodyHtml(city: City, slug: string): string {
  const intro = destinationIntro(city);
  const pros = city.pros.slice(0, 5).map((p) => `<li>${esc(p)}</li>`).join('');
  const cons = city.cons.slice(0, 3).map((c) => `<li>${esc(c)}</li>`).join('');
  const vibes = (city.vibe ?? []).map((v) => `<li>${esc(v)}</li>`).join('');
  const landscapes = (city.landscape ?? []).map((l) => `<li>${esc(l)}</li>`).join('');
  const best = formatMonths(city.weather?.bestMonths);
  const rainy = formatMonths(city.weather?.rainyMonths);
  const related = hubRelatedGuides(city);
  const fieldGuideHtml = destinationFieldGuideHtml(city);
  const subArea = subAreaBySlug(slug);
  const noticeHtml = subArea ? subAreaParentNoticeHtml(subArea) : '';
  const noticeBlock = noticeHtml ? `${noticeHtml}\n  ` : '';
  const relatedHtml = related.length
    ? `<h2>Related guides</h2><ul>${related
        .map((guide) => {
          const excerpt = rewriteSubAreaDestinationHrefs(guide.excerpt);
          return `<li><a href="${BASE_URL}/guides/${esc(guide.slug)}" style="color:#34d399">${esc(guide.title)}</a>: ${esc(excerpt)}</li>`;
        })
        .join('')}</ul>`
    : '';

  return `
<main id="seo-destination" style="max-width:42rem;margin:2rem auto;padding:0 1.25rem;font-family:ui-sans-serif,system-ui,sans-serif;color:#e5e7eb;background:#0b0f14">
  <p><a href="/" style="color:#34d399">← Spin the globe</a> · <a href="/guides" style="color:#34d399">Guides</a></p>
  <h1>${esc(city.name)}, ${esc(city.country)}</h1>
  ${noticeBlock}${fieldGuideHtml}
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
    <li><strong>Timezone:</strong> ${esc(city.meta.timeZoneUtc || 'n/a')}</li>
    <li><strong>Language:</strong> ${esc(city.language || 'n/a')}</li>
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
  <p>Compare ${esc(city.name)} against your budget, internet, and safety floors, then <a href="/" style="color:#34d399">spin the globe</a> for a match, or browse more <a href="/guides" style="color:#34d399">nomad guides</a>.</p>
  <p><a href="${BASE_URL}/destinations/${slug}" style="color:#34d399">Open the full ${esc(city.name)} destination page</a>.</p>
</main>`;
}
