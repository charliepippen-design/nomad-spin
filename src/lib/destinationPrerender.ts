import type { City } from '@/data/cities';
import { destinationFaq, destinationFaqBodyHtml, destinationFaqJsonLd } from '@/lib/destinationFaq';
import {
  dataLabel,
  destinationFieldGuideHtml,
  destinationIntro,
  destinationJsonLd,
  formatMonths,
  hubRelatedGuides,
  plainNumber,
} from '@/lib/destinationSeo';
import { visaPathSentence } from '@/lib/visaCopy';
import {
  cityLinkLabel,
  destinationBreadcrumbJsonLd,
  nearbyCities,
  sameCountryCities,
  type CityLink,
} from '@/lib/cityNeighbors';
import { canonicalDestinationPath } from '@/lib/subAreaDestinations';
import { DATASET_UPDATED, DATASET_UPDATED_LABEL } from '@/data/datasetMeta';
import {
  rewriteSubAreaDestinationHrefs,
  subAreaBySlug,
  subAreaParentNoticeHtml,
} from '@/lib/subAreaDestinations';
import { DEFAULT_LOCALE, type Locale } from '../i18n/config';
import { guideForLocale, localizeCity } from '../i18n/content';
import { getT } from '../i18n/dictionary';
import { formatDate } from '../i18n/format';
import { absoluteUrl, localizeHref } from '../i18n/paths';

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const LINK_STYLE = 'style="color:#34d399"';

/**
 * Turns the marked spans of a translated sentence into HTML:
 * "<link>How the data is built</link>" -> the element returned by tags.link.
 * The sentence comes from the dictionary; values put into it are escaped by the caller.
 */
function htmlTags(text: string, tags: Record<string, (inner: string) => string>): string {
  return text.replace(/<(\w+)>(.*?)<\/\1>/g, (match, name: string, inner: string) =>
    tags[name] ? tags[name](inner) : match,
  );
}

/**
 * Crawlable destination body. Sub-area pages add a parent-hub link near the top.
 * Links are written as English paths and sent to the page in `locale` when it exists.
 */
export function destinationBodyHtml(source: City, slug: string, locale: Locale = DEFAULT_LOCALE): string {
  const t = getT(locale);
  const city = localizeCity(source, locale);
  const href = (enPath: string) => esc(localizeHref(enPath, locale));
  const link = (enPath: string) => (inner: string) => `<a href="${href(enPath)}" ${LINK_STYLE}>${inner}</a>`;
  const intro = destinationIntro(source, locale);
  const pros = city.pros.slice(0, 5).map((p) => `<li>${esc(p)}</li>`).join('');
  const cons = city.cons.slice(0, 3).map((c) => `<li>${esc(c)}</li>`).join('');
  const vibes = (city.vibe ?? []).map((v) => `<li>${esc(dataLabel('vibe', v, locale))}</li>`).join('');
  const landscapes = (city.landscape ?? []).map((l) => `<li>${esc(dataLabel('landscape', l, locale))}</li>`).join('');
  const best = formatMonths(city.weather?.bestMonths, locale);
  const rainy = formatMonths(city.weather?.rainyMonths, locale);
  const related = hubRelatedGuides(source);
  const fieldGuideHtml = destinationFieldGuideHtml(source, locale);
  const subArea = subAreaBySlug(slug);
  const noticeHtml = subArea ? subAreaParentNoticeHtml(subArea, locale) : '';
  const faqHtml = destinationFaqBodyHtml(subArea ? [] : destinationFaq(source, locale), locale);
  const estimate = ` ${t('city.pre.estimate')}`;
  const airbnbEstimate = city.formulaEstimates?.airbnbMedian || city.dataSource === 'estimated' ? estimate : '';
  const internetValue = t(
    city.formulaEstimates?.internetReliability ? 'city.pre.internetValueEstimate' : 'city.pre.internetValue',
    { mbps: plainNumber(city.internetMbps, locale), score: plainNumber(city.infra.internetReliability, locale) },
  );
  const powerEstimate = city.formulaEstimates?.powerGridStability ? estimate : '';
  const noticeBlock = noticeHtml ? `${noticeHtml}\n  ` : '';
  const nearby = nearbyCities(source, 6);
  const sameCountry = sameCountryCities(source, 8, nearby);
  const usd = (value: number) => `$${plainNumber(value, locale)}`;
  const linkList = (title: string, links: CityLink[]) =>
    links.length
      ? `<h2>${esc(title)}</h2><ul>${links
          .map((entry) => {
            const label = cityLinkLabel(entry, locale);
            const meta = t('city.pre.linkMeta', {
              km: plainNumber(entry.km, locale),
              cost: plainNumber(entry.city.costUSD, locale),
            });
            return `<li><a href="${href(canonicalDestinationPath(entry.slug))}" ${LINK_STYLE}>${esc(label.name)}, ${esc(label.country)}</a> ${meta}</li>`;
          })
          .join('')}</ul>`
      : '';
  const relatedHtml = related.length
    ? `<h2>${esc(t('city.pre.relatedGuides'))}</h2><ul>${related
        .map((guide) => {
          const shown = guideForLocale(guide, locale);
          const excerpt = rewriteSubAreaDestinationHrefs(shown.excerpt);
          return `<li><a href="${esc(absoluteUrl(`/guides/${guide.slug}`, locale))}" ${LINK_STYLE}>${esc(shown.title)}</a>: ${esc(excerpt)}</li>`;
        })
        .join('')}</ul>`
    : '';
  const datasetLabel = locale === DEFAULT_LOCALE ? DATASET_UPDATED_LABEL : formatDate(DATASET_UPDATED, locale);
  const datasetHtml = htmlTags(t('city.pre.dataset', { date: esc(datasetLabel) }), {
    time: (inner) => `<time datetime="${DATASET_UPDATED}">${inner}</time>`,
    link: link('/methodology'),
  });
  const findBaseHtml = htmlTags(t('city.pre.findBaseText', { city: esc(city.name) }), {
    spin: link('/'),
    compare: link('/compare'),
    base: link('/find-your-base'),
    guides: link('/guides'),
  });
  const stat = (label: string, value: string) => `<li><strong>${esc(label)}</strong> ${value}</li>`;
  const score = (value: number) => `${plainNumber(value, locale)}/10`;

  return `
<main id="seo-destination" style="max-width:42rem;margin:2rem auto;padding:0 1.25rem;font-family:ui-sans-serif,system-ui,sans-serif;color:#e5e7eb;background:#0b0f14">
  <p><a href="${href('/')}" ${LINK_STYLE}>${esc(t('city.breadcrumb.home'))}</a> / <a href="${href('/destinations')}" ${LINK_STYLE}>${esc(t('city.breadcrumb.destinations'))}</a> / ${esc(city.name)} · <a href="${href('/guides')}" ${LINK_STYLE}>${esc(t('city.pre.guides'))}</a></p>
  <h1>${esc(city.name)}, ${esc(city.country)}</h1>
  ${noticeBlock}${fieldGuideHtml}
  <p>${esc(intro)}</p>
  <h2>${esc(t('city.pre.keyStats'))}</h2>
  <ul>
    ${stat(t('city.pre.cost'), usd(city.costUSD))}
    ${stat(t('city.pre.longTerm'), usd(city.financials.costLongTerm))}
    ${stat(t('city.pre.airbnb'), `${usd(city.financials.airbnbMedian)}${esc(airbnbEstimate)}`)}
    ${stat(t('city.pre.internet'), esc(internetValue))}
    ${stat(t('city.pre.power'), `${score(city.infra.powerGridStability)}${esc(powerEstimate)}`)}
    ${stat(t('city.pre.coworking'), esc(dataLabel('density', city.infra.coworkingDensity, locale)))}
    ${stat(
      t('city.pre.safety'),
      esc(
        t('city.pre.safetyValue', {
          safety: plainNumber(city.safety, locale),
          female: plainNumber(city.vibeMetrics.femaleSafety, locale),
        }),
      ),
    )}
    ${stat(t('city.pre.visa'), esc(visaPathSentence(city.meta, locale)))}
    ${stat(t('city.pre.timezone'), esc(city.meta.timeZoneUtc || t('city.pre.na')))}
    ${stat(t('city.pre.language'), esc(city.language ? dataLabel('language', city.language, locale) : t('city.pre.na')))}
    ${stat(t('city.pre.region'), esc(dataLabel('region', city.region, locale)))}
    ${best ? stat(t('city.pre.bestMonths'), esc(best)) : ''}
    ${rainy ? stat(t('city.pre.rainyMonths'), esc(rainy)) : ''}
    ${city.weather?.tempAvgC != null ? stat(t('city.pre.avgTemp'), `${plainNumber(city.weather.tempAvgC, locale)}°C`) : ''}
  </ul>
  ${vibes ? `<h2>${esc(t('city.pre.vibeTags'))}</h2><ul>${vibes}</ul>` : ''}
  ${landscapes ? `<h2>${esc(t('city.pre.landscape'))}</h2><ul>${landscapes}</ul>` : ''}
  ${pros ? `<h2>${esc(t('city.pre.whyGo'))}</h2><ul>${pros}</ul>` : ''}
  ${cons ? `<h2>${esc(t('city.pre.tradeOffs'))}</h2><ul>${cons}</ul>` : ''}
  ${faqHtml}
  ${relatedHtml}
  ${linkList(t('city.pre.nearby'), nearby)}
  ${linkList(t('city.pre.otherCities', { country: city.country }), sameCountry)}
  <p>${datasetHtml}</p>
  <h2>${esc(t('city.pre.findBase'))}</h2>
  <p>${findBaseHtml}</p>
  <p><a href="${esc(absoluteUrl(`/destinations/${slug}`, locale))}" ${LINK_STYLE}>${esc(t('city.pre.openFull', { city: city.name }))}</a>.</p>
</main>`;
}

/**
 * Place JSON-LD, plus FAQPage and breadcrumb on indexable destination pages.
 * `pageUrl` is the page's absolute URL, already in `locale`.
 */
export function destinationPageJsonLd(
  city: City,
  pageUrl: string,
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): object | object[] {
  const place = destinationJsonLd(city, pageUrl, locale);
  if (subAreaBySlug(slug)) return place;
  return [
    place,
    destinationFaqJsonLd(city, pageUrl, locale),
    destinationBreadcrumbJsonLd(city, pageUrl, locale),
  ];
}
