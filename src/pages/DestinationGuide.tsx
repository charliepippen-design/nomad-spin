import { useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, DollarSign, Wifi, Shield, Plane, Globe, Heart, Users, Zap, ArrowLeft, ExternalLink, Bookmark } from 'lucide-react';
import { cities } from '@/data/cities';
import { slugify } from '@/lib/slugify';
import { getCityImageUrl } from '@/data/cityImages';
import { generateAffiliateLinks } from '@/utils/affiliateEngine';
import { generateBadges } from '@/lib/badges';
import { useCityEnrichment } from '@/hooks/useCityEnrichment';
import { useSpinStore } from '@/store/useSpinStore';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import GuideSection from '@/components/GuideSection';

export default function DestinationGuide() {
  const { citySlug } = useParams<{ citySlug: string }>();

  const city = useMemo(
    () => cities.find((c) => slugify(c.name) === citySlug),
    [citySlug]
  );

  const { enrichedCity } = useCityEnrichment(city ?? null);
  const displayCity = enrichedCity || city;

  const { savedSpins, saveCity, removeSavedSpin, preferences } = useSpinStore();
  const auth = useAuth();
  const cloudSync = useCloudSync(auth.user?.id);
  const savedIndex = savedSpins.findIndex(s => s.city?.id === city?.id);
  const isSaved = savedIndex !== -1;

  if (!city || !displayCity) {
    return <Navigate to="/" replace />;
  }

  const heroUrl = getCityImageUrl(city.id, city.region, 1200);
  const affiliateLinks = generateAffiliateLinks(city);
  const badges = generateBadges(city);

  const canonicalUrl = `https://www.digitalnomadspin.com/destinations/${slugify(city.name)}`;
  const pageTitle = `${city.name}, ${city.country} — Digital Nomad Guide | Nomad Spin`;
  const pageDescription = `Everything you need to know about living in ${city.name} as a digital nomad. Cost: $${city.costUSD}/mo, Internet: ${city.internetMbps}Mbps, Safety: ${city.safety}/10.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${city.name}, ${city.country}`,
    description: `Digital nomad guide to ${city.name}, ${city.country}. Monthly cost from $${city.costUSD}.`,
    geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng },
  };

  return (
    <div className="noise-overlay min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={heroUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={heroUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <header className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroUrl} alt={`${city.name}, ${city.country}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:pb-8 max-w-3xl mx-auto w-full">
          <Link to="/" className="inline-flex items-center gap-1 text-[10px] font-mono tracking-[0.2em] text-white/60 hover:text-white transition-colors uppercase mb-4">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <h1 className="font-mono text-2xl md:text-4xl tracking-[0.15em] text-white uppercase">
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
        <GuideSection title="Why Go" id="why-go">
          {displayCity.pros.length > 0 ? (
            <ul className="space-y-2">
              {displayCity.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400/70 mt-0.5 shrink-0" />
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
                <span key={v} className="px-2.5 py-1 rounded-lg border border-border/40 bg-white/[0.02] text-[10px] font-mono tracking-wider text-muted-foreground">
                  {v}
                </span>
              ))}
            </div>
          )}
        </GuideSection>

        <GuideSection title="Best Neighborhoods" id="neighborhoods">
          <p className="text-muted-foreground/70 italic">
            Neighborhood deep-dives are coming soon. In the meantime, look for areas with good coworking density and expat communities.
          </p>
        </GuideSection>

        <GuideSection title="Where to Stay" id="where-to-stay">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StayTier tier="Budget" price={`$${Math.round(displayCity.financials.airbnbMedian * 0.6)}/night`} desc="Hostels, guesthouses, and budget Airbnbs. Good for short scouting stays." />
            <StayTier tier="Mid-Range" price={`$${displayCity.financials.airbnbMedian}/night`} desc="Private apartments with Wi-Fi. The sweet spot for most nomads." />
            <StayTier tier="High-End" price={`$${Math.round(displayCity.financials.airbnbMedian * 1.8)}/night`} desc="Serviced apartments or boutique hotels with coworking amenities." />
          </div>
          <a
            href={affiliateLinks.accommodation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono tracking-wider text-emerald-400 hover:bg-emerald-500/20 transition-colors uppercase"
          >
            Find a place to stay in {city.name} <ExternalLink className="w-3 h-3" />
          </a>
        </GuideSection>

        <GuideSection title="Coworking & Wi-Fi" id="coworking">
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

        <GuideSection title="Getting There" id="getting-there">
          <div className="rounded-lg border border-border/30 bg-card p-5 flex items-start gap-4">
            <Plane className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-foreground font-mono text-sm">{displayCity.nearestAirport.name} ({displayCity.nearestAirport.code})</p>
              <p className="text-xs text-muted-foreground mt-1">{displayCity.nearestAirport.distKm} km from city center</p>
              <p className="text-xs text-muted-foreground mt-2">
                Visa: <strong className="text-foreground">{displayCity.meta.visaType}</strong> · Up to {displayCity.meta.visaDays} days for most nationalities.
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
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 mt-4">
                <p className="text-[9px] font-mono tracking-[0.15em] text-amber-400/80 uppercase mb-2">Local Laws & Regulations</p>
                {displayCity.legalNotes.map((note, i) => (
                  <p key={i} className="text-[11px] text-amber-200/60 font-mono leading-relaxed mb-1">• {note}</p>
                ))}
              </div>
            )}
          </div>
        </GuideSection>
      </main>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-xs text-muted-foreground mb-4">Not sure where to go next?</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-primary/10 border border-primary/30 text-sm font-mono tracking-wider text-primary hover:bg-primary/20 transition-colors uppercase"
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

function StayTier({ tier, price, desc }: { tier: string; price: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border/30 bg-card p-5 flex flex-col gap-2">
      <p className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase">{tier}</p>
      <p className="text-lg font-mono text-foreground">{price}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
