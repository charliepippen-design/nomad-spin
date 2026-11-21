import { useEffect, useMemo } from 'react';
import { Navigate as RouterNavigate, useParams } from 'react-router-dom';
import { Link, Navigate } from '@/i18n/Link';
import { Helmet } from 'react-helmet-async';
import { MapPin, DollarSign, Wifi, Shield, Plane, Globe, Heart, Users, Zap, ExternalLink, Bookmark, GitCompareArrows, ArrowUpRight } from 'lucide-react';
import { findCityBySlug } from '@/lib/citySlug';
import { editorialGuideForDestination } from '@/data/guides';
import NotFound from '@/pages/NotFound';
import { getCityImageUrl, getCityImageAlt, getCityPhoto } from '@/data/cityImages';
import UnsplashCredit from '@/components/UnsplashAttribution';
import { cityAttribution } from '@/hooks/useCityImage';
import { citySocialImage } from '@/lib/socialImage';
import { generateAffiliateLinks, SPONSORED_REL } from '@/utils/affiliateEngine';
import { trackAffiliateClick, trackEvent } from '@/utils/analytics';
import { cityLinkLabel, destinationBreadcrumbJsonLd, nearbyCities, sameCountryCities, type CityLink } from '@/lib/cityNeighbors';
import { canonicalDestinationPath } from '@/lib/subAreaDestinations';
import { DATASET_UPDATED, DATASET_UPDATED_LABEL } from '@/data/datasetMeta';
import { generateBadges } from '@/lib/badges';
import { useCityEnrichment } from '@/hooks/useCityEnrichment';
import { useSpinStore } from '@/store/useSpinStore';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { comparePath } from '@/lib/compare';
import GuideSection from '@/components/GuideSection';
import {
  dataLabel,
  destinationIntro,
  destinationMetaDescription,
  destinationPageTitle,
  destinationJsonLd,
  formatMonths,
  hubRelatedGuides,
  livingGuideForCity,
  plainNumber,
} from '@/lib/destinationSeo';
import { destinationFaq, destinationFaqJsonLd, type DestinationFaqItem } from '@/lib/destinationFaq';
import { visaChipValue, visaPathSentence, visaTypeLabel } from '@/lib/visaCopy';
import {
  SUB_AREA_ROBOTS,
  rewriteSubAreaDestinationHrefs,
  subAreaBySlug,
  subAreaParentNotice,
} from '@/lib/subAreaDestinations';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { guideForLocale, isCityTranslated, localizeCity } from '@/i18n/content';
import { formatDate, formatNumber } from '@/i18n/format';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { rich } from '@/i18n/rich';
import { LocaleLinks, canonicalUrl } from '@/i18n/seo';

export default function DestinationGuide() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const t = useT();
  const locale = useLocale();

  const resolved = useMemo(() => findCityBySlug(citySlug), [citySlug]);
  const city = resolved?.city;

  // A city page exists in another language only once its text is translated.
  // Until then the reader is sent to the English page (which never redirects back).
  const untranslated = !!city && locale !== DEFAULT_LOCALE && !isCityTranslated(city.id, locale);

  // One profile view per city page opened.
  const viewedId = city && resolved?.canonicalSlug === citySlug && !untranslated ? city.id : null;
  useEffect(() => {
    if (viewedId) trackEvent('destination_profile_view', { city: viewedId, city_slug: citySlug });
  }, [viewedId, citySlug]);

  const { enrichedCity } = useCityEnrichment(city ?? null);
  const displayCity = enrichedCity || city;

  const { savedSpins, saveCity, removeSavedSpin, preferences } = useSpinStore();
  const auth = useAuth();
  const cloudSync = useCloudSync(auth.user?.id);
  const savedIndex = savedSpins.findIndex(s => s.city?.id === city?.id);
  const isSaved = savedIndex !== -1;

  if (!resolved || !city || !displayCity) {
    return <NotFound />;
  }

  // Legacy or alias slug (e.g. pre-accent-fix "medell-n") → canonical URL.
  if (resolved.canonicalSlug !== citySlug) {
    return <Navigate to={`/destinations/${resolved.canonicalSlug}`} replace />;
  }

  if (untranslated) {
    return <RouterNavigate to={`/destinations/${resolved.canonicalSlug}`} replace />;
  }

  // `city` keeps the English record (ids, numbers, analytics); the `local*` copies carry the text on screen.
  const localCity = localizeCity(city, locale);
  const localDisplay = localizeCity(displayCity, locale);
  const num = (value: number) => plainNumber(value, locale);

  const heroUrl = getCityImageUrl(city.id, city.region, 1200);
  const affiliateLinks = generateAffiliateLinks(city);
  const badges = generateBadges(city, locale);

  const enPath = `/destinations/${citySlug}`;
  const { url: ogImage, alt: ogImageAlt } = citySocialImage(city.id);
  const pageUrl = canonicalUrl(enPath, locale);
  const title = destinationPageTitle(city, locale);
  const description = destinationMetaDescription(city, locale);
  const intro = destinationIntro(city, locale);
  const jsonLd = destinationJsonLd(city, pageUrl, locale);
  const bestMonths = formatMonths(city.weather?.bestMonths, locale);
  const rainyMonths = formatMonths(city.weather?.rainyMonths, locale);
  const editorialSource = livingGuideForCity(city) ?? editorialGuideForDestination(resolved.canonicalSlug);
  const editorial = editorialSource ? { slug: editorialSource.slug, title: guideForLocale(editorialSource, locale).title } : null;
  const subArea = subAreaBySlug(resolved.canonicalSlug);
  const parentNotice = subArea ? subAreaParentNotice(subArea, locale) : null;
  const faqItems = subArea ? [] : destinationFaq(city, locale);
  const faqJsonLd = subArea ? null : destinationFaqJsonLd(city, pageUrl, locale);
  const breadcrumbJsonLd = destinationBreadcrumbJsonLd(city, pageUrl, locale);
  const nearby = nearbyCities(city, 6);
  const sameCountry = sameCountryCities(city, 8, nearby);
  const visaChip = visaChipValue(city.countryCode, city.meta.visaType, city.meta.visaDays, locale);
  const datasetLabel = locale === DEFAULT_LOCALE ? DATASET_UPDATED_LABEL : formatDate(DATASET_UPDATED, locale);
  const methodologyLink = (children: string) => (
    <Link to="/methodology" className="underline underline-offset-4 hover:text-foreground">
      {children}
    </Link>
  );

  return (
    <div className="page-content min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        {subArea ? <meta name="robots" content={SUB_AREA_ROBOTS} /> : null}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={ogImageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={ogImageAlt} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        {faqJsonLd ? <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script> : null}
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <LocaleLinks enPath={enPath} />

      {/* Hero */}
      <header className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroUrl} alt={getCityImageAlt(localCity.name, localCity.country, city.id)} className="w-full h-full object-cover" />
        {getCityPhoto(city.id) && (
          <div className="absolute top-2 right-2 z-10 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5">
            <UnsplashCredit attribution={cityAttribution(city.id)} className="text-white/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:pb-8 max-w-3xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl text-white leading-tight">
            {localCity.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="w-3 h-3" />
              <span className="text-sm font-medium">{localCity.country} · {dataLabel('region', city.region, locale)}</span>
            </div>
            <button
              onClick={() => {
                if (isSaved) {
                  removeSavedSpin(savedIndex);
                  if (auth.isAuthenticated) cloudSync.removeSpin(city.id);
                } else {
                  saveCity(city);
                  if (auth.isAuthenticated) {
                    cloudSync.saveSpin({
                      city,
                      timestamp: new Date().toLocaleDateString(),
                      preferences,
                    });
                  }
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border backdrop-blur-sm ${
                isSaved
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-primary' : ''}`} />
              {isSaved ? t('city.page.saved') : t('city.page.save')}
            </button>
          </div>
        </div>
      </header>

      {parentNotice ? (
        <p className="max-w-3xl mx-auto px-6 pt-4 text-sm text-muted-foreground">
          {rich(
            t(parentNotice.livingGuideSlug ? 'city.subArea.noticeLiving' : 'city.subArea.notice', {
              parent: parentNotice.parentName,
            }),
            {
              link: (children) => (
                <Link
                  to={`/destinations/${parentNotice.parentSlug}`}
                  className="text-primary underline underline-offset-4"
                >
                  {children}
                </Link>
              ),
              living: (children) => (
                <Link
                  to={`/guides/${parentNotice.livingGuideSlug}`}
                  className="text-primary underline underline-offset-4"
                >
                  {children}
                </Link>
              ),
            },
          )}
        </p>
      ) : null}

      {/* Key Stats Bar */}
      <div className="border-b border-border/30 bg-card">
        <div className="max-w-3xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatChip icon={<DollarSign className="w-3.5 h-3.5" />} label={t('city.page.stat.monthlyCost')} value={`$${num(city.costUSD)}`} />
          <StatChip icon={<Wifi className="w-3.5 h-3.5" />} label={t('city.page.stat.internet')} value={`${num(city.internetMbps)} Mbps`} />
          <StatChip icon={<Shield className="w-3.5 h-3.5" />} label={t('city.page.stat.safety')} value={`${num(city.safety)}/10`} />
          <StatChip icon={<Globe className="w-3.5 h-3.5" />} label={t('city.page.stat.visa')} value={visaChip} />
        </div>
        {localCity.meta.visaNote && (
          <p className="max-w-3xl mx-auto px-6 pb-4 text-xs text-muted-foreground leading-relaxed">
            {visaPathSentence(localCity.meta, locale)}
          </p>
        )}
      </div>

      {/* Breadcrumb and dataset date */}
      <div className="max-w-3xl mx-auto px-6 pt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <nav aria-label={t('city.breadcrumb.aria')}>
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link to="/" className="hover:text-foreground">{t('city.breadcrumb.home')}</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/destinations" className="hover:text-foreground">{t('city.breadcrumb.destinations')}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">{localCity.name}</li>
          </ol>
        </nav>
        <p>
          {rich(t('city.page.datasetUpdated', { date: datasetLabel }), {
            time: (children) => <time dateTime={DATASET_UPDATED}>{children}</time>,
          })}
        </p>
      </div>

      {/* Decision actions */}
      <div className="max-w-3xl mx-auto px-6 pt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link to={comparePath([city])} className="dns-btn-secondary !py-2">
          <GitCompareArrows className="w-4 h-4" /> {t('city.page.compare', { city: localCity.name })}
        </Link>
        <Link to="/find-your-base" className="text-sm font-semibold text-primary hover:underline">
          {t('city.page.findSimilar')}
        </Link>
        <p className="basis-full text-xs text-muted-foreground">
          {rich(t(city.dataSource === 'estimated' ? 'city.page.dataEstimated' : 'city.page.dataEditorial'), {
            link: methodologyLink,
          })}
        </p>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 pt-6 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span key={badge.label} className="dns-chip">
              {badge.emoji} {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 divide-y divide-border">
        <GuideSection title={t('city.page.overview')} id="overview">
          <p className="text-sm text-muted-foreground leading-relaxed">{intro}</p>
          {(bestMonths || rainyMonths) && (
            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bestMonths && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">{t('city.page.bestMonths')}</dt>
                  <dd className="text-base font-semibold text-foreground">{bestMonths}</dd>
                </div>
              )}
              {rainyMonths && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">{t('city.page.rainyMonths')}</dt>
                  <dd className="text-base font-semibold text-foreground">{rainyMonths}</dd>
                </div>
              )}
              {city.weather?.tempAvgC != null && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">{t('city.page.avgTemp')}</dt>
                  <dd className="text-base font-semibold text-foreground">{num(city.weather.tempAvgC)}°C</dd>
                </div>
              )}
              <div className="rounded-xl border border-border bg-card p-4">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">{t('city.page.stat.visa')}</dt>
                <dd className="text-base font-semibold text-foreground">
                  {visaTypeLabel(city.meta.visaType, locale)} · {visaChip}
                  {localCity.meta.visaNote && (
                    <span className="block mt-1 text-xs font-sans text-muted-foreground leading-relaxed">{localCity.meta.visaNote}</span>
                  )}
                </dd>
              </div>
            </dl>
          )}
        </GuideSection>

        <GuideSection title={t('city.page.whyGo')} id="why-go">
          {localDisplay.pros.length > 0 ? (
            <ul className="space-y-2">
              {localDisplay.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('city.page.noPros')}</p>
          )}
          {displayCity.vibe.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {displayCity.vibe.map((v) => (
                <span key={v} className="dns-chip capitalize">
                  {dataLabel('vibe', v, locale)}
                </span>
              ))}
            </div>
          )}
        </GuideSection>

        <GuideSection title={t('city.fieldGuide.title')} id="field-guide">
          {editorial ? (
            <p>
              <Link
                to={`/guides/${editorial.slug}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 font-display text-lg font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {editorial.title}
                <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
              </Link>
            </p>
          ) : (
            <p>{t('city.page.noFieldGuide')}</p>
          )}
        </GuideSection>

        <GuideSection title={t('city.page.whereToStay')} id="where-to-stay">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('city.page.medianNightly')}</p>
            <p className="dns-num mt-2 text-4xl text-foreground">{t('city.page.perNight', { price: num(city.financials.airbnbMedian) })}</p>
            {city.dataSource === 'estimated' || city.formulaEstimates?.airbnbMedian ? (
              <p className="mt-2 inline-flex rounded border border-warning/40 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-warning">{t('city.page.estimate')}</p>
            ) : null}
          </div>
          <a
            href={affiliateLinks.accommodation.url}
            target="_blank"
            rel={SPONSORED_REL}
            onClick={() =>
              trackAffiliateClick(
                affiliateLinks.accommodation.partner,
                'accommodation',
                city.name,
                affiliateLinks.accommodation.url,
                // Analytics label: kept in English in every language.
                `Find a place to stay in ${city.name}`,
                { placement: 'destination_stay' },
              )
            }
            className="dns-btn-primary mt-6"
          >
            {t('city.page.findStay', { city: localCity.name })} <ExternalLink className="w-3 h-3" />
          </a>
          <p className="mt-2 text-[10px] text-muted-foreground">
            {t('city.page.affiliateNote')}
          </p>
        </GuideSection>

        <GuideSection title={t('city.page.coworking')} id="coworking">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">{t('city.page.avgSpeed')}</p>
              <p className="dns-num text-2xl text-foreground">{num(displayCity.infra.internetSpeedAvg)} Mbps</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">{t('city.page.reliability')}</p>
              <p className="dns-num text-2xl text-foreground">{num(displayCity.infra.internetReliability)}/10</p>
              {city.formulaEstimates?.internetReliability ? (
                <p className="mt-1.5 inline-flex rounded border border-warning/40 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-warning">{t('city.page.estimate')}</p>
              ) : null}
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">{t('city.page.coworkingLabel')}</p>
              <p className="dns-num text-2xl text-foreground">{dataLabel('density', displayCity.infra.coworkingDensity, locale)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">{t('city.page.powerGrid')}</p>
              <p className="dns-num text-2xl text-foreground">{num(displayCity.infra.powerGridStability)}/10</p>
              {city.formulaEstimates?.powerGridStability ? (
                <p className="mt-1.5 inline-flex rounded border border-warning/40 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-warning">{t('city.page.estimate')}</p>
              ) : null}
            </div>
          </div>
          {affiliateLinks.vpn.url ? (
            <>
              <p className="mt-4 text-xs text-muted-foreground">
                {t('city.page.vpnPitch')}{' '}
                <a
                  href={affiliateLinks.vpn.url}
                  target="_blank"
                  rel={SPONSORED_REL}
                  onClick={() => trackAffiliateClick('NordVPN', 'vpn', city.name, affiliateLinks.vpn.url, affiliateLinks.vpn.label, { placement: 'destination_nordvpn' })}
                  className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                >
                  {t('city.page.vpnCta')} <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {t('city.page.affiliateNote')}
              </p>
            </>
          ) : null}
        </GuideSection>

        <GuideSection title={t('city.page.gettingThere')} id="getting-there">
          <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
            <Plane className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-base font-semibold text-foreground">{displayCity.nearestAirport.name} ({displayCity.nearestAirport.code})</p>
              <p className="text-xs text-muted-foreground mt-1">{t('city.page.airportDistance', { km: num(displayCity.nearestAirport.distKm) })}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('city.page.visaLabel')} <span className="text-foreground">{visaPathSentence(localDisplay.meta, locale)}</span>
              </p>
            </div>
          </div>
          {affiliateLinks.flights.url ? (
            <a
              href={affiliateLinks.flights.url}
              target="_blank"
              rel={SPONSORED_REL}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {t('city.page.searchFlights', { city: localCity.name })} <ExternalLink className="w-3 h-3" />
            </a>
          ) : null}
        </GuideSection>

        <GuideSection title={t('city.page.safety')} id="safety">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-foreground/60" />
                <span className="dns-num text-xl text-foreground">{num(displayCity.safety)}/10</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-foreground/60" />
                <span className="text-xs text-muted-foreground">{t('city.page.femaleSafety', { score: num(displayCity.vibeMetrics.femaleSafety) })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-foreground/60" />
                <span className="text-xs text-muted-foreground">{t('city.page.lgbt', { score: num(displayCity.vibeMetrics.lgbtFriendly) })}</span>
              </div>
            </div>
            {localDisplay.legalNotes && localDisplay.legalNotes.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 mt-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">{t('city.page.localLaws')}</p>
                {localDisplay.legalNotes.map((note, i) => (
                  <p key={i} className="text-sm text-foreground/80 leading-relaxed mb-1">{note}</p>
                ))}
              </div>
            )}
          </div>
        </GuideSection>

        {faqItems.length > 0 ? (
          <GuideSection title={t('city.faq.title')} id="faq">
            {faqItems.map((item) => (
              <details key={item.q} className="group border-b border-border pb-4 [&:not(:first-child)]:pt-0">
                <summary className="cursor-pointer list-none font-display text-base font-semibold text-foreground marker:hidden hover:text-primary">
                  {item.q}
                </summary>
                <p className="mt-2">
                  <FaqAnswer item={item} />
                </p>
              </details>
            ))}
          </GuideSection>
        ) : null}
      </main>

      {/* Related guides */}
      {(() => {
        const related = hubRelatedGuides(city);
        if (related.length === 0) return null;
        return (
          <div className="max-w-3xl mx-auto px-6 py-10 border-t border-border/20">
            <p className="mb-4 border-b border-border pb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground">{t('city.page.relatedGuides')}</p>
            <ul className="space-y-3">
              {related.map((g) => {
                // The guide in the reader's language when it is translated; the link keeps the English path.
                const shown = guideForLocale(g, locale);
                return (
                  <li key={g.slug}>
                    <Link
                      to={`/guides/${g.slug}`}
                      className="block rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 transition-colors"
                    >
                      <span className="font-display text-base font-bold text-foreground">{shown.title}</span>
                      <span className="block text-xs text-muted-foreground mt-1">{rewriteSubAreaDestinationHrefs(shown.excerpt)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })()}

      {/* More cities: internal links built from the dataset */}
      <div className="max-w-3xl mx-auto px-6 py-10 border-t border-border/20 space-y-10">
        <CityLinkList title={t('city.page.nearby')} links={nearby} showCountry />
        {sameCountry.length > 0 ? <CityLinkList title={t('city.page.otherCities', { country: localCity.country })} links={sameCountry} /> : null}
        <p className="text-xs text-muted-foreground">
          {rich(t('city.page.distanceNote'), {
            link: (children) => (
              <Link to="/destinations" className="underline underline-offset-4 hover:text-foreground">{children}</Link>
            ),
          })}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-xs text-muted-foreground mb-4">{t('city.page.notSure')}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t('city.page.spin')}
        </Link>
      </div>
    </div>
  );
}

function CityLinkList({ title, links, showCountry = false }: { title: string; links: CityLink[]; showCountry?: boolean }) {
  const t = useT();
  const locale = useLocale();
  if (links.length === 0) return null;
  return (
    <section>
      <h2 className="border-b border-border pb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground">{title}</h2>
      <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
        {links.map((link) => {
          const label = cityLinkLabel(link, locale);
          return (
            <li key={link.slug} className="min-w-0 border-b border-border">
              <Link to={canonicalDestinationPath(link.slug)} className="group flex items-baseline justify-between gap-4 py-3">
                <span className="min-w-0 truncate">
                  <span className="font-display text-base font-semibold text-foreground group-hover:text-primary">{label.name}</span>
                  {showCountry ? <span className="ml-2 text-sm text-muted-foreground">{label.country}</span> : null}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  {t('city.page.cityMeta', {
                    km: formatNumber(link.km, locale),
                    cost: formatNumber(link.city.costUSD, locale),
                  })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FaqAnswer({ item }: { item: DestinationFaqItem }) {
  if (item.officialLinks.length === 0) return <>{item.a}</>;
  const nodes: React.ReactNode[] = [];
  let rest = item.a;
  item.officialLinks.forEach((link, index) => {
    const at = rest.indexOf(link.phrase);
    if (at < 0) return;
    if (at > 0) nodes.push(rest.slice(0, at));
    nodes.push(
      <a
        key={`${link.href}-${index}`}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-4"
      >
        {link.phrase}
      </a>,
    );
    rest = rest.slice(at + link.phrase.length);
  });
  if (rest) nodes.push(rest);
  return <>{nodes}</>;
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="dns-num text-xl text-foreground">{value}</p>
      </div>
    </div>
  );
}
