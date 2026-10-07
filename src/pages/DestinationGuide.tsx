import { useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, DollarSign, Wifi, Shield, Plane, Globe, Heart, Users, Zap, ExternalLink, Bookmark } from 'lucide-react';
import { findCityBySlug } from '@/lib/citySlug';
import { editorialGuideForDestination, guidesForDestination } from '@/data/guides';
import NotFound from '@/pages/NotFound';
import { getCityImageUrl } from '@/data/cityImages';
import { generateAffiliateLinks } from '@/utils/affiliateEngine';
import { generateBadges } from '@/lib/badges';
import { useCityEnrichment } from '@/hooks/useCityEnrichment';
import { useSpinStore } from '@/store/useSpinStore';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import GuideSection from '@/components/GuideSection';
import {
  destinationIntro,
  destinationMetaDescription,
  destinationPageTitle,
  destinationJsonLd,
  formatMonths,
} from '@/lib/destinationSeo';
import { visaPathSentence } from '@/lib/visaCopy';

export default function DestinationGuide() {
  const { citySlug } = useParams<{ citySlug: string }>();

  const resolved = useMemo(() => findCityBySlug(citySlug), [citySlug]);
  const city = resolved?.city;

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
  const pageUrl = `${BASE_URL}/destinations/${citySlug}`;
  const title = destinationPageTitle(city);
  const description = destinationMetaDescription(city);
  const intro = destinationIntro(city);
  const jsonLd = destinationJsonLd(city, pageUrl);
  const bestMonths = formatMonths(city.weather?.bestMonths);
  const rainyMonths = formatMonths(city.weather?.rainyMonths);
  const editorial = editorialGuideForDestination(resolved.canonicalSlug);

  return (
    <div className="page-content min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={heroUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={heroUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <header className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroUrl} alt={`${city.name}, ${city.country}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:pb-8 max-w-3xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl text-white leading-tight">
            {city.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="w-3 h-3" />
              <span className="text-xs font-mono tracking-wider">{city.country} · {city.region}</span>
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-[0.15em] uppercase transition-colors border backdrop-blur-sm ${
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

      {/* Key Stats Bar */}
      <div className="border-b border-border/30 bg-card">
        <div className="max-w-3xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatChip icon={<DollarSign className="w-3.5 h-3.5" />} label="Monthly Cost" value={`$${city.costUSD}`} />
          <StatChip icon={<Wifi className="w-3.5 h-3.5" />} label="Internet" value={`${city.internetMbps} Mbps`} />
          <StatChip icon={<Shield className="w-3.5 h-3.5" />} label="Safety" value={`${city.safety}/10`} />
          <StatChip icon={<Globe className="w-3.5 h-3.5" />} label="Visa" value={`${city.meta.visaDays} days`} />
        </div>
        {city.meta.visaNote && (
          <p className="max-w-3xl mx-auto px-6 pb-4 text-xs text-muted-foreground leading-relaxed">
            {visaPathSentence(city.meta)}
          </p>
        )}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 pt-6 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span key={badge.label} className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono tracking-wider rounded-lg border ${badge.color}`}>
              {badge.emoji} {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 divide-y divide-border/20">
        <GuideSection title="Overview" id="overview">
          <p className="text-sm text-muted-foreground leading-relaxed">{intro}</p>
          {(bestMonths || rainyMonths) && (
            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bestMonths && (
                <div className="rounded-lg border border-border/30 bg-card p-4">
                  <dt className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-1">Best months</dt>
                  <dd className="text-sm font-mono text-foreground">{bestMonths}</dd>
                </div>
              )}
              {rainyMonths && (
                <div className="rounded-lg border border-border/30 bg-card p-4">
                  <dt className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-1">Rainy months</dt>
                  <dd className="text-sm font-mono text-foreground">{rainyMonths}</dd>
                </div>
              )}
              {city.weather?.tempAvgC != null && (
                <div className="rounded-lg border border-border/30 bg-card p-4">
                  <dt className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-1">Avg temperature</dt>
                  <dd className="text-sm font-mono text-foreground">{city.weather.tempAvgC}°C</dd>
                </div>
              )}
              <div className="rounded-lg border border-border/30 bg-card p-4">
                <dt className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-1">Visa</dt>
                <dd className="text-sm font-mono text-foreground">
                  {city.meta.visaType} · {city.meta.visaDays} days
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
                <span key={v} className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 text-[10px] font-mono tracking-wider text-muted-foreground">
                  {v}
                </span>
              ))}
            </div>
          )}
        </GuideSection>

        <GuideSection title="Field guide" id="field-guide">
          {editorial ? (
            <p>
              <Link to={`/guides/${editorial.slug}`} className="text-primary underline underline-offset-4">
                {editorial.title}
              </Link>
            </p>
          ) : (
            <p>No field guide yet</p>
          )}
        </GuideSection>

        <GuideSection title="Where to stay" id="where-to-stay">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Median nightly stay</p>
            <p className="font-mono text-2xl text-foreground mt-2">${city.financials.airbnbMedian}/night</p>
            {city.dataSource === 'estimated' ? (
              <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground mt-2">Estimate</p>
            ) : null}
          </div>
          <a
            href={affiliateLinks.accommodation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary/10 border border-primary/30 text-sm text-primary hover:bg-primary/20 transition-colors"
          >
            Find a place to stay in {city.name} <ExternalLink className="w-3 h-3" />
          </a>
        </GuideSection>

        <GuideSection title="Coworking and Wi-Fi" id="coworking">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/30 bg-card p-4">
              <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-1">Avg Speed</p>
              <p className="text-lg font-mono text-foreground">{displayCity.infra.internetSpeedAvg} Mbps</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-card p-4">
              <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-1">Reliability</p>
              <p className="text-lg font-mono text-foreground">{displayCity.infra.internetReliability}/10</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-card p-4">
              <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-1">Coworking</p>
              <p className="text-lg font-mono text-foreground">{displayCity.infra.coworkingDensity}</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-card p-4">
              <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-1">Power Grid</p>
              <p className="text-lg font-mono text-foreground">{displayCity.infra.powerGridStability}/10</p>
            </div>
          </div>
        </GuideSection>

        <GuideSection title="Getting there" id="getting-there">
          <div className="rounded-lg border border-border/30 bg-card p-5 flex items-start gap-4">
            <Plane className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-foreground font-mono text-sm">{displayCity.nearestAirport.name} ({displayCity.nearestAirport.code})</p>
              <p className="text-xs text-muted-foreground mt-1">{displayCity.nearestAirport.distKm} km from city center</p>
              <p className="text-xs text-muted-foreground mt-2">
                Visa: <span className="text-foreground">{visaPathSentence(displayCity.meta)}</span>
              </p>
            </div>
          </div>
          <a
            href={affiliateLinks.flights.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-xs font-mono tracking-wider text-primary/70 hover:text-primary transition-colors"
          >
            Search flights to {city.name} <ExternalLink className="w-3 h-3" />
          </a>
        </GuideSection>

        <GuideSection title="Safety" id="safety">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-foreground/60" />
                <span className="text-foreground font-mono">{displayCity.safety}/10</span>
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
                <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-2">Local laws</p>
                {displayCity.legalNotes.map((note, i) => (
                  <p key={i} className="text-sm text-foreground/80 leading-relaxed mb-1">{note}</p>
                ))}
              </div>
            )}
          </div>
        </GuideSection>
      </main>

      {/* Related guides */}
      {(() => {
        const related = guidesForDestination(resolved.canonicalSlug);
        if (related.length === 0) return null;
        return (
          <div className="max-w-3xl mx-auto px-6 py-10 border-t border-border/20">
            <p className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase mb-4">Related guides</p>
            <ul className="space-y-3">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link
                    to={`/guides/${g.slug}`}
                    className="block rounded-lg border border-border/30 bg-card px-5 py-4 hover:border-primary/40 transition-colors"
                  >
                    <span className="text-sm font-mono text-foreground">{g.title}</span>
                    <span className="block text-xs text-muted-foreground mt-1">{g.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

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

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[9px] font-mono tracking-wider text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-mono text-foreground">{value}</p>
      </div>
    </div>
  );
}

