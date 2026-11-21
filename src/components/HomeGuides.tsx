import { Link } from '@/i18n/Link';
import { ArrowRight } from 'lucide-react';
import type { Guide } from '@/data/guides';
import { homeGuidesLink, homeH1, homeIntro } from '@/lib/homeSeo';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { cityDisplayName, guideForLocale, localizedGuide } from '@/i18n/content';
import { CityGuideCard, CityGuideRow, EssayRow, SectionRule, splitGuides } from '@/components/guides/GuideIndex';

/** Photo cards shown before the rest of the city guides drop to compact rows. */
const FEATURED_COUNT = 6;

/**
 * Homepage editorial block: the page <h1>, the intro, and every guide link.
 * Carries the same links as the prerendered #seo-home block, laid out as a
 * magazine index instead of a bare list.
 */
export default function HomeGuides({ guides }: { guides: readonly Guide[] }) {
  const t = useT();
  const locale = useLocale();
  const guidesLink = homeGuidesLink(locale);
  // Title and excerpt in the reader's language when the guide is translated. The English
  // slug is kept: the cards link to /guides/<english slug> and Link localizes the URL.
  const shown = guides
    // Another language lists only the guides it has; the guides index links the English ones, labelled.
    .filter((guide) => locale === 'en' || localizedGuide(guide.slug, locale) !== null)
    .map((guide) => ({ ...guideForLocale(guide, locale), slug: guide.slug, relatedDestinations: guide.relatedDestinations }));
  const { cityGuides, essays } = splitGuides(shown);
  // Photo cards lead; guides without a curated photo join the compact list.
  const featured = cityGuides.filter((entry) => entry.hasPhoto).slice(0, FEATURED_COUNT);
  const featuredSlugs = new Set(featured.map((entry) => entry.guide.slug));
  const rest = cityGuides
    .filter((entry) => !featuredSlugs.has(entry.guide.slug))
    .sort((a, b) => cityDisplayName(a.city, locale).localeCompare(cityDisplayName(b.city, locale)));

  return (
    <section id="home-intro" className="relative z-10 border-t border-border bg-background py-16 md:py-24">
      <div className="dns-container">
        {/* Masthead */}
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-end md:gap-16">
          <div>
            <p className="dns-eyebrow">{t('home.guides.eyebrow')}</p>
            <h1 className="mt-3 text-4xl leading-[1.08] text-foreground md:text-5xl">{homeH1(locale)}</h1>
          </div>
          <div>
            <p className="text-base leading-relaxed text-muted-foreground">{homeIntro(locale)}</p>
            <Link
              to={guidesLink.href}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {guidesLink.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {featured.length > 0 && (
          <div className="mt-12 md:mt-16">
            <SectionRule title={t('home.guides.living')} count={cityGuides.length} />
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((entry) => (
                <CityGuideCard key={entry.guide.slug} {...entry} />
              ))}
            </ul>
          </div>
        )}

        {rest.length > 0 && (
          <ul className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((entry) => (
              <CityGuideRow key={entry.guide.slug} {...entry} />
            ))}
          </ul>
        )}

        {essays.length > 0 && (
          <div className="mt-14 md:mt-20">
            <SectionRule title={t('home.guides.essays')} count={essays.length} />
            <ol className="mt-2">
              {essays.map((guide, i) => (
                <EssayRow key={guide.slug} guide={guide} index={i} />
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
