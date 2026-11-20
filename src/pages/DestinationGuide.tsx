import { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
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
import { destinationBreadcrumbJsonLd, nearbyCities, sameCountryCities, type CityLink } from '@/lib/cityNeighbors';
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
  destinationIntro,
  destinationMetaDescription,
  destinationPageTitle,
  destinationJsonLd,
  formatMonths,
  hubRelatedGuides,
  livingGuideForCity,
} from '@/lib/destinationSeo';
import { destinationFaq, destinationFaqJsonLd, type DestinationFaqItem } from '@/lib/destinationFaq';
import { visaChipValue, visaPathSentence } from '@/lib/visaCopy';
import {
  SUB_AREA_ROBOTS,
  rewriteSubAreaDestinationHrefs,
  subAreaBySlug,
  subAreaParentNotice,
} from '@/lib/subAreaDestinations';

export default function DestinationGuide() {
  const { citySlug } = useParams<{ citySlug: string }>();

  const resolved = useMemo(() => findCityBySlug(citySlug), [citySlug]);
  const city = resolved?.city;

  // One profile view per city page opened.
  const viewedId = city && resolved?.canonicalSlug === citySlug ? city.id : null;
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

  const heroUrl = getCityImageUrl(city.id, city.region, 1200);
  const affiliateLinks = generateAffiliateLinks(city);
  const badges = generateBadges(city);

  const BASE_URL = 'https://www.digitalnomadspin.com';
  const { url: ogImage, alt: ogImageAlt } = citySocialImage(city.id);
  const pageUrl = `${BASE_URL}/destinations/${citySlug}`;
  const title = destinationPageTitle(city);
  const description = destinationMetaDescription(city);
  const intro = destinationIntro(city);
  const jsonLd = destinationJsonLd(city, pageUrl);
  const bestMonths = formatMonths(city.weather?.bestMonths);
  const rainyMonths = formatMonths(city.weather?.rainyMonths);
  const editorial = livingGuideForCity(city) ?? editorialGuideForDestination(resolved.canonicalSlug);
  const subArea = subAreaBySlug(resolved.canonicalSlug);
  const parentNotice = subArea ? subAreaParentNotice(subArea) : null;
  const faqItems = subArea ? [] : destinationFaq(city);
  const faqJsonLd = subArea ? null : destinationFaqJsonLd(city, pageUrl);
  const breadcrumbJsonLd = destinationBreadcrumbJsonLd(city, pageUrl);
  const nearby = nearbyCities(city, 6);
  const sameCountry = sameCountryCities(city, 8, nearby);

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

      {/* Hero */}
      <header className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroUrl} alt={getCityImageAlt(city.name, city.country, city.id)} className="w-full h-full object-cover" />
        {getCityPhoto(city.id) && (
          <div className="absolute top-2 right-2 z-10 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5">
            <UnsplashCredit attribution={cityAttribution(city.id)} className="text-white/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:pb-8 max-w-3xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl text-white leading-tight">
            {city.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="w-3 h-3" />
              <span className="text-sm font-medium">{city.country} · {city.region}</span>
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
              {isSaved ? 'Saved' : 'Save City'}
            </button>
          </div>
        </div>
      </header>

      {parentNotice ? (
        <p className="max-w-3xl mx-auto px-6 pt-4 text-sm text-muted-foreground">
          Part of the {parentNotice.parentName} area. See the full{' '}
          <Link
            to={`/destinations/${parentNotice.parentSlug}`}
            className="text-primary underline underline-offset-4"
          >
            {parentNotice.parentName} guide
          </Link>
          {parentNotice.livingGuideSlug ? (
            <>
              {' '}
              and the{' '}
              <Link
                to={`/guides/${parentNotice.livingGuideSlug}`}
                className="text-primary underline underline-offset-4"
              >
                living guide
              </Link>
            </>
          ) : null}
          .
        </p>
      ) : null}

      {/* Key Stats Bar */}
      <div className="border-b border-border/30 bg-card">
        <div className="max-w-3xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatChip icon={<DollarSign className="w-3.5 h-3.5" />} label="Monthly Cost" value={`$${city.costUSD}`} />
          <StatChip icon={<Wifi className="w-3.5 h-3.5" />} label="Internet" value={`${city.internetMbps} Mbps`} />
          <StatChip icon={<Shield className="w-3.5 h-3.5" />} label="Safety" value={`${city.safety}/10`} />
          <StatChip icon={<Globe className="w-3.5 h-3.5" />} label="Visa" value={visaChipValue(city.countryCode, city.meta.visaType, city.meta.visaDays)} />
        </div>
        {city.meta.visaNote && (
          <p className="max-w-3xl mx-auto px-6 pb-4 text-xs text-muted-foreground leading-relaxed">
            {visaPathSentence(city.meta)}
          </p>
        )}
      </div>

      {/* Breadcrumb and dataset date */}
      <div className="max-w-3xl mx-auto px-6 pt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/destinations" className="hover:text-foreground">Destinations</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">{city.name}</li>
          </ol>
        </nav>
        <p>
          Dataset last updated <time dateTime={DATASET_UPDATED}>{DATASET_UPDATED_LABEL}</time>
        </p>
      </div>

      {/* Decision actions */}
      <div className="max-w-3xl mx-auto px-6 pt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link to={comparePath([city])} className="dns-btn-secondary !py-2">
          <GitCompareArrows className="w-4 h-4" /> Compare {city.name} with another city
        </Link>
        <Link to="/find-your-base" className="text-sm font-semibold text-primary hover:underline">
          Find cities like this
        </Link>
        <p className="basis-full text-xs text-muted-foreground">
          {city.dataSource === 'estimated'
            ? 'This city’s record is an estimate and has not been checked by hand. '
            : 'Figures are editorial values, not live measurements. '}
          <Link to="/methodology" className="underline underline-offset-4 hover:text-foreground">
            How the data is built
          </Link>
          .
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
        <GuideSection title="Overview" id="overview">
          <p className="text-sm text-muted-foreground leading-relaxed">{intro}</p>
          {(bestMonths || rainyMonths) && (
            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bestMonths && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Best months</dt>
                  <dd className="text-base font-semibold text-foreground">{bestMonths}</dd>
                </div>
              )}
              {rainyMonths && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Rainy months</dt>
                  <dd className="text-base font-semibold text-foreground">{rainyMonths}</dd>
                </div>
              )}
              {city.weather?.tempAvgC != null && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Avg temperature</dt>
                  <dd className="text-base font-semibold text-foreground">{city.weather.tempAvgC}°C</dd>
                </div>
              )}
              <div className="rounded-xl border border-border bg-card p-4">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Visa</dt>
                <dd className="text-base font-semibold text-foreground">
                  {city.meta.visaType} · {visaChipValue(city.countryCode, city.meta.visaType, city.meta.visaDays)}
                  {city.meta.visaNote && (
                    <span className="block mt-1 text-xs font-sans text-muted-foreground leading-relaxed">{city.meta.visaNote}</span>
                  )}
                </dd>
              </div>
            </dl>
          )}
        </GuideSection>

        <GuideSection title="Why Go" id="why-go">
          {displayCity.pros.length > 0 ? (
            <ul className="space-y-2">
              {displayCity.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>A great destination for digital nomads looking for a mix of affordability, culture, and connectivity.</p>
          )}
          {displayCity.vibe.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {displayCity.vibe.map((v) => (
                <span key={v} className="dns-chip capitalize">
                  {v}
                </span>
              ))}
            </div>
          )}
        </GuideSection>

        <GuideSection title="Field guide" id="field-guide">
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
            <p>No field guide yet</p>
          )}
        </GuideSection>

        <GuideSection title="Where to stay" id="where-to-stay">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Median nightly stay</p>
            <p className="dns-num mt-2 text-4xl text-foreground">${city.financials.airbnbMedian}/night</p>
            {city.dataSource === 'estimated' || city.formulaEstimates?.airbnbMedian ? (
              <p className="mt-2 inline-flex rounded border border-warning/40 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-warning">Estimate</p>
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
                `Find a place to stay in ${city.name}`,
                { placement: 'destination_stay' },
              )
            }
            className="dns-btn-primary mt-6"
          >
            Find a place to stay in {city.name} <ExternalLink className="w-3 h-3" />
          </a>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Affiliate link: Nomad Spin may earn a commission at no extra cost to you.
          </p>
        </GuideSection>

        <GuideSection title="Coworking and Wi-Fi" id="coworking">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Avg Speed</p>
              <p className="dns-num text-2xl text-foreground">{displayCity.infra.internetSpeedAvg} Mbps</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Reliability</p>
              <p className="dns-num text-2xl text-foreground">{displayCity.infra.internetReliability}/10</p>
              {city.formulaEstimates?.internetReliability ? (
                <p className="mt-1.5 inline-flex rounded border border-warning/40 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-warning">Estimate</p>
              ) : null}
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Coworking</p>
              <p className="dns-num text-2xl text-foreground">{displayCity.infra.coworkingDensity}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Power Grid</p>
              <p className="dns-num text-2xl text-foreground">{displayCity.infra.powerGridStability}/10</p>
              {city.formulaEstimates?.powerGridStability ? (
                <p className="mt-1.5 inline-flex rounded border border-warning/40 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-warning">Estimate</p>
              ) : null}
            </div>
          </div>
          {affiliateLinks.vpn.url ? (
            <>
              <p className="mt-4 text-xs text-muted-foreground">
                Working on cafe or coworking Wi-Fi? NordVPN encrypts your connection on shared networks.{' '}
                <a
                  href={affiliateLinks.vpn.url}
                  target="_blank"
                  rel={SPONSORED_REL}
                  onClick={() => trackAffiliateClick('NordVPN', 'vpn', city.name, affiliateLinks.vpn.url, affiliateLinks.vpn.label, { placement: 'destination_nordvpn' })}
                  className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                >
                  Get NordVPN <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Affiliate link: Nomad Spin may earn a commission at no extra cost to you.
              </p>
            </>
          ) : null}
        </GuideSection>

        <GuideSection title="Getting there" id="getting-there">
          <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
            <Plane className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-base font-semibold text-foreground">{displayCity.nearestAirport.name} ({displayCity.nearestAirport.code})</p>
              <p className="text-xs text-muted-foreground mt-1">{displayCity.nearestAirport.distKm} km from city center</p>
              <p className="text-xs text-muted-foreground mt-2">
                Visa: <span className="text-foreground">{visaPathSentence(displayCity.meta)}</span>
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
              Search flights to {city.name} <ExternalLink className="w-3 h-3" />
            </a>
          ) : null}
        </GuideSection>

        <GuideSection title="Safety" id="safety">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-foreground/60" />
                <span className="dns-num text-xl text-foreground">{displayCity.safety}/10</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-foreground/60" />
                <span className="text-xs text-muted-foreground">Female Safety: {displayCity.vibeMetrics.femaleSafety}/10</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-foreground/60" />
                <span className="text-xs text-muted-foreground">LGBTQ+: {displayCity.vibeMetrics.lgbtFriendly}/10</span>
              </div>
            </div>
            {displayCity.legalNotes && displayCity.legalNotes.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 mt-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">Local laws</p>
                {displayCity.legalNotes.map((note, i) => (
                  <p key={i} className="text-sm text-foreground/80 leading-relaxed mb-1">{note}</p>
                ))}
              </div>
            )}
          </div>
        </GuideSection>

        {faqItems.length > 0 ? (
          <GuideSection title="Quick answers" id="faq">
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
            <p className="mb-4 border-b border-border pb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground">Related guides</p>
            <ul className="space-y-3">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link
                    to={`/guides/${g.slug}`}
                    className="block rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 transition-colors"
                  >
                    <span className="font-display text-base font-bold text-foreground">{g.title}</span>
                    <span className="block text-xs text-muted-foreground mt-1">{rewriteSubAreaDestinationHrefs(g.excerpt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {/* More cities: internal links built from the dataset */}
      <div className="max-w-3xl mx-auto px-6 py-10 border-t border-border/20 space-y-10">
        <CityLinkList title="Nearby cities" links={nearby} showCountry />
        {sameCountry.length > 0 ? <CityLinkList title={`Other cities in ${city.country}`} links={sameCountry} /> : null}
        <p className="text-xs text-muted-foreground">
          Distances are straight lines between city centres, rounded to 10 km.{' '}
          <Link to="/destinations" className="underline underline-offset-4 hover:text-foreground">All destinations</Link>
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-xs text-muted-foreground mb-4">Not sure where to go next?</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Spin for a new city
        </Link>
      </div>
    </div>
  );
}

function CityLinkList({ title, links, showCountry = false }: { title: string; links: CityLink[]; showCountry?: boolean }) {
  if (links.length === 0) return null;
  return (
    <section>
      <h2 className="border-b border-border pb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground">{title}</h2>
      <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
        {links.map(({ city, slug, km }) => (
          <li key={slug} className="min-w-0 border-b border-border">
            <Link to={canonicalDestinationPath(slug)} className="group flex items-baseline justify-between gap-4 py-3">
              <span className="min-w-0 truncate">
                <span className="font-display text-base font-semibold text-foreground group-hover:text-primary">{city.name}</span>
                {showCountry ? <span className="ml-2 text-sm text-muted-foreground">{city.country}</span> : null}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                {km.toLocaleString('en-US')} km · ${city.costUSD.toLocaleString('en-US')}/mo
              </span>
            </Link>
          </li>
        ))}
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

