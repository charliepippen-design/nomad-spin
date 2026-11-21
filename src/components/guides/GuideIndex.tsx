import { Link } from '@/i18n/Link';
import { ArrowUpRight } from 'lucide-react';
import type { Guide } from '@/data/guides';
import type { City } from '@/data/cities';
import { findCityBySlug } from '@/lib/citySlug';
import { getCityImageAlt, getCityImageUrl, getCityPhoto } from '@/data/cityImages';
import { cityAttribution } from '@/hooks/useCityImage';
import UnsplashCredit from '@/components/UnsplashAttribution';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { cityDisplayName } from '@/i18n/content';
import { countryName, formatDate as formatLocaleDate, formatNumber } from '@/i18n/format';

/**
 * Shared presentation for guide indexes (homepage block and /guides).
 * A "city guide" is a living-in guide whose first related destination resolves
 * to a city in the dataset; everything else is an essay.
 */

export interface CityGuide {
  guide: Guide;
  city: City;
  hasPhoto: boolean;
}

/**
 * English slug of a guide. A translated guide (LocalizedGuide) carries it in
 * `sourceSlug`; its own `slug` is the translated one. Links are always written
 * as `/guides/<english slug>` and the localized Link picks the right URL.
 */
export function guideEnSlug(guide: Guide): string {
  return (guide as Guide & { sourceSlug?: string }).sourceSlug ?? guide.slug;
}

export function splitGuides(guides: readonly Guide[]): { cityGuides: CityGuide[]; essays: Guide[] } {
  const cityGuides: CityGuide[] = [];
  const essays: Guide[] = [];
  for (const guide of guides) {
    const slug = guideEnSlug(guide).startsWith('living-in-') ? guide.relatedDestinations?.[0] : undefined;
    const city = slug ? findCityBySlug(slug)?.city : undefined;
    if (city) cityGuides.push({ guide, city, hasPhoto: getCityPhoto(city.id) !== null });
    else essays.push(guide);
  }
  return { cityGuides, essays };
}

const usd = (n: number, locale: Locale) => `$${formatNumber(n, locale)}`;

/** "8 min read" -> "8 min". Other languages rebuild it from the number. */
function shortReadTime(readTime: string, locale: Locale, minutes: (n: string) => string): string {
  if (locale === DEFAULT_LOCALE) return readTime.replace(' read', '');
  const n = readTime.match(/\d+/)?.[0];
  return n ? minutes(n) : readTime;
}

export function SectionRule({ title, count, id }: { title: string; count?: number; id?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-3">
      <h2 id={id} className="font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground">
        {title}
      </h2>
      {count !== undefined ? <p className="text-sm tabular-nums text-muted-foreground">{count}</p> : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

/** Photo card for a city living guide. Falls back to a typographic panel when no curated photo exists. */
export function CityGuideCard({ guide, city, hasPhoto }: CityGuide) {
  const t = useT();
  const locale = useLocale();
  const cityName = cityDisplayName(city, locale);
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
      <div className="relative aspect-[16/10] overflow-hidden">
        {hasPhoto ? (
          <>
            <img
              src={getCityImageUrl(city.id, city.region, 640)}
              alt={getCityImageAlt(city.name, city.country, city.id)}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute right-2 top-2 z-10 rounded bg-black/45 px-1.5 py-0.5 backdrop-blur-sm">
              <UnsplashCredit attribution={cityAttribution(city.id)} className="text-white/75" compact />
            </div>
          </>
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-popover to-background"
          >
            <span className="font-display text-7xl font-extrabold tracking-tighter text-foreground/10">
              {city.countryCode}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col p-5 pt-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {countryName(city.countryCode, city.country, locale)}
        </p>
        <h3 className="mb-4 mt-1 text-2xl text-foreground">
          <Link
            to={`/guides/${guideEnSlug(guide)}`}
            aria-label={guide.title}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-primary"
          >
            {t('guides.card.livingIn', { city: cityName })}
          </Link>
        </h3>
        <dl className="mt-auto flex items-center gap-5 border-t border-border pt-3 text-sm">
          <Fact label={t('guides.card.monthly')} value={usd(city.costUSD, locale)} />
          <Fact label={t('guides.card.internet')} value={`${city.internetMbps} Mbps`} />
          <Fact
            label={t('guides.card.read')}
            value={shortReadTime(guide.readTime, locale, (n) => t('guides.card.minutes', { n }))}
          />
        </dl>
      </div>
    </li>
  );
}

/** One ruled line: city, country, monthly cost. */
export function CityGuideRow({ guide, city }: CityGuide) {
  const t = useT();
  const locale = useLocale();
  return (
    <li className="border-b border-border">
      <Link to={`/guides/${guideEnSlug(guide)}`} aria-label={guide.title} className="group flex items-baseline justify-between gap-4 py-3.5">
        <span className="min-w-0">
          <span className="font-display text-base font-semibold text-foreground group-hover:text-primary">{cityDisplayName(city, locale)}</span>
          <span className="ml-2 text-sm text-muted-foreground">{countryName(city.countryCode, city.country, locale)}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-sm tabular-nums text-muted-foreground">
          {t('guides.card.perMonth', { price: usd(city.costUSD, locale) })}
          <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </span>
      </Link>
    </li>
  );
}

function formatDate(guide: Guide, locale: Locale): string {
  return formatLocaleDate((guide.updated ?? guide.date).slice(0, 10), locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Numbered editorial row for essays and frameworks.
 * `lang` marks a row whose guide is shown in another language than the page (an English guide on a translated index).
 */
export function EssayRow({
  guide,
  index,
  showDate = false,
  lang,
}: {
  guide: Guide;
  index: number;
  showDate?: boolean;
  lang?: string;
}) {
  const locale = useLocale();
  return (
    <li className="border-b border-border">
      <Link
        lang={lang}
        hrefLang={lang}
        to={`/guides/${guideEnSlug(guide)}`}
        className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-6 md:grid-cols-[4rem_1fr_auto] md:gap-x-6"
      >
        <span className="dns-num text-2xl text-muted-foreground/50 md:text-3xl" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="min-w-0">
          <span className="block font-display text-xl font-bold leading-snug tracking-tight text-foreground group-hover:text-primary md:text-2xl">
            {guide.title}
          </span>
          <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed text-muted-foreground">{guide.excerpt}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-2 text-sm text-muted-foreground sm:flex">
          {showDate ? `${formatDate(guide, locale)} · ` : ''}
          {guide.readTime}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </span>
      </Link>
    </li>
  );
}
