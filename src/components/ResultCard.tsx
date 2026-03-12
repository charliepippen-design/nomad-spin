import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wifi, Shield, DollarSign, Bookmark, RotateCcw, Share2, AlertTriangle, Zap, Globe, Clock, ExternalLink, Info, CheckCircle2, Sparkles, Plane, Languages, AlertOctagon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import UnsplashAttribution from '@/components/UnsplashAttribution';
import { City } from '@/data/cities';
import { Button } from '@/components/ui/button';
import HealthBar from '@/components/HealthBar';
import DeploymentGrid from '@/components/DeploymentGrid';
import { generateAffiliateLinks } from '@/utils/affiliateEngine';
import { trackSpinCompleted } from '@/utils/analytics';
import { useCityImage } from '@/hooks/useCityImage';
import { generateBadges } from '@/lib/badges';
import confetti from 'canvas-confetti';
import type { ScoredCity } from '@/lib/scoring';

interface ResultCardProps {
  city: City;
  matchScore: number;
  matchReason?: string;
  intel: string[];
  risks: string[];
  originCity?: string;
  flightInfo?: ScoredCity['flightInfo'];
  onSave: () => void;
  onRespin: () => void;
  onShare: () => void;
}

function DataSourceIndicator({ source }: { source: 'verified' | 'estimated' }) {
  if (source === 'verified') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-0.5 text-emerald-400/70">
              <CheckCircle2 className="w-2.5 h-2.5" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] text-xs">
            Manually verified data from trusted sources.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 text-amber-400/70">
            <Sparkles className="w-2.5 h-2.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-xs">
          AI-estimated data. May not reflect current conditions.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AnimatedScore({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 600);
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return <span>{value}</span>;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <motion.circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.6 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-mono font-light text-foreground tracking-wider">
          <AnimatedScore target={score} />
        </span>
        <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">match</span>
      </div>
    </div>
  );
}

export default function ResultCard({ city, matchScore, matchReason, intel, risks, originCity, flightInfo, onSave, onRespin, onShare }: ResultCardProps) {
  const affiliateLinks = generateAffiliateLinks(city, originCity);
  const badges = generateBadges(city);
  const { imageUrl: heroImageUrl, attribution } = useCityImage(city.id, city.name, city.country, city.region, 800);
  const dataSource = city.dataSource || 'verified';

  useEffect(() => {
    trackSpinCompleted(city.name, city.country, matchScore, city.region);

    const timer = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#4488ff', '#888888'],
        gravity: 1.2,
        ticks: 120,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [city.id, matchScore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto overflow-hidden"
    >
      <div className="rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={heroImageUrl}
            alt={`${city.name}, ${city.country}`}
            loading="lazy"
            onError={(e) => {
              const fallback = `https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&h=448&fit=crop&auto=format&q=80`;
              if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
          {/* Unsplash attribution — top-right overlay */}
          {attribution && (
            <div className="absolute top-2 right-2 z-20 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5">
              <UnsplashAttribution attribution={attribution} className="text-white/70" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-4">
            <div className="flex items-end gap-2 sm:gap-4">
              <ScoreRing score={matchScore} />
              <div className="flex-1 min-w-0 pb-1 bg-black/30 backdrop-blur-sm rounded-lg px-2.5 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-lg sm:text-2xl md:text-4xl font-mono font-medium tracking-[0.1em] sm:tracking-[0.15em] text-white truncate uppercase"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6)' }}
                  >
                    {city.name} <span className="text-white/80 hidden sm:inline">// {city.countryCode}</span>
                  </motion.h2>
                  <DataSourceIndicator source={dataSource} />
                </div>
                <div className="flex items-center gap-2 text-white/80 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[11px] font-mono tracking-wider">{city.country} · {city.region}</span>
                  <span className="text-[11px] font-mono tracking-wider text-white/50">{city.meta.timeZoneUtc}</span>
                </div>
                {city.language && (
                  <div className="flex items-center gap-1.5 text-white/50 mt-0.5">
                    <Languages className="w-2.5 h-2.5" />
                    <span className="text-[10px] font-mono tracking-wider">{city.language}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-[60px]">
          {/* Smart Badges */}
          {badges.length > 0 && (
            <div className="px-6 pt-4 flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono tracking-wider rounded-lg border ${badge.color}`}
                >
                  {badge.emoji} {badge.label}
                </span>
              ))}
            </div>
          )}

          {/* Flight Info */}
          {flightInfo && (
            <div className="mx-6 mt-3 flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border/30 bg-white/[0.02]">
              <Plane className="w-4 h-4 text-primary/60" />
              <div className="flex-1 flex items-center gap-4 text-[10px] font-mono text-foreground/60">
                <span>~{flightInfo.hours}h flight</span>
                <span>~${flightInfo.costEstimate} est.</span>
                <span className="text-muted-foreground/40">{flightInfo.distKm.toLocaleString()} km</span>
              </div>
            </div>
          )}

          {/* Tactical Data Grid */}
          <div className="grid grid-cols-2 gap-px bg-border/10 mx-6 mt-4 rounded-lg overflow-hidden">
            <StatItem icon={<DollarSign className="w-3.5 h-3.5" />} label="TOTAL COST" value={`$${city.financials.costNomadSingle.toLocaleString()}/mo`} tooltip="Estimated total monthly living cost for a single digital nomad (rent, food, transport, etc.)." source={dataSource} />
            <StatItem icon={<Wifi className="w-3.5 h-3.5" />} label="AVG. INTERNET" value={`${city.infra.internetSpeedAvg} Mbps`} tooltip="Average download speed from fixed broadband and coworking spaces." source={dataSource} />
            <StatItem icon={<Shield className="w-3.5 h-3.5" />} label="SAFETY" value={`${city.safety}/10`} tooltip="Composite safety score (1–10) based on crime rates, political stability, and traveler reports." source={dataSource} />
            <StatItem icon={<Globe className="w-3.5 h-3.5" />} label="TYPICAL STAY" value={`${city.meta.visaDays} days`} tooltip="Approximate maximum stay for many nationalities; actual rules depend on your passport." source={dataSource} />
            <StatItem icon={<DollarSign className="w-3.5 h-3.5" />} label="ACCOM. (NIGHTLY)" value={`$${city.financials.airbnbMedian}/night`} tooltip="Approximate median nightly price for a 1-bedroom or studio on Airbnb / similar platforms." source={dataSource} />
            <StatItem icon={<Clock className="w-3.5 h-3.5" />} label="LONG-TERM COST" value={`$${city.financials.costLongTerm.toLocaleString()}/mo`} tooltip="Estimated monthly cost for stays of 3+ months, including lower rent and local pricing." source={dataSource} />
          </div>

          {/* Visa CTA */}
          <a
            href={affiliateLinks.visa.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-6 mt-3 flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-border/40 bg-white/[0.03] hover:bg-white/[0.07] hover:border-border/60 transition-all group pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
              <span className="text-xs font-mono font-medium text-foreground/70 group-hover:text-foreground tracking-wide transition-colors">
                Check visa options for {city.country}
              </span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-foreground/70 transition-colors" />
          </a>

          {/* Divider */}
          <div className="mx-6 mt-4 border-t border-white/[0.06]" />

          {/* Health Bars */}
          <div className="px-6 py-5 space-y-3">
            <HealthBar label="BANDWIDTH" value={city.infra.internetReliability} delay={0.8} />
            <HealthBar label="SAFETY" value={Math.round(city.safety)} delay={0.9} />
            <HealthBar label="NIGHTLIFE" value={city.vibeMetrics.nightlife} delay={1.0} />
            <HealthBar label="COMMUNITY" value={city.vibeMetrics.communitySize} delay={1.1} />
            <HealthBar label="POWER GRID" value={city.infra.powerGridStability} delay={1.2} />
          </div>

          {/* Intel + Risks */}
          <div className="px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/30">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] text-muted-foreground mb-2 uppercase">
                <Zap className="w-3 h-3" /> WHY THIS CITY
              </div>
              {intel.map((item, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="text-[11px] text-foreground/60 mb-1.5 font-mono leading-relaxed"
                >
                  + {item}
                </motion.p>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] text-muted-foreground mb-2 uppercase">
                <AlertTriangle className="w-3 h-3" /> THINGS TO KNOW
              </div>
              {risks.length > 0 ? risks.map((risk, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.1 }}
                  className="text-[11px] text-destructive/70 mb-1.5 font-mono leading-relaxed"
                >
                  ⚠ {risk}
                </motion.p>
              )) : (
                <p className="text-[11px] text-foreground/40 font-mono">No concerns noted</p>
              )}
            </div>
          </div>

          {/* Legal Notes Section */}
          {city.legalNotes && city.legalNotes.length > 0 && (
            <div className="mx-6 mb-3">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-400/80" />
                  <span className="text-[9px] font-mono tracking-[0.2em] text-amber-400/80 uppercase">LOCAL LAWS & REGULATIONS</span>
                </div>
                {city.legalNotes.map((note, i) => (
                  <p key={i} className="text-[11px] text-amber-200/60 font-mono leading-relaxed mb-1">
                    • {note}
                  </p>
                ))}
                <p className="text-[9px] text-muted-foreground/40 font-mono mt-2 italic">
                  Laws vary by region. Always verify current regulations before traveling.
                </p>
              </div>
            </div>
          )}

          {/* Primary CTA — Find Stays */}
          <div className="px-6 pt-2 space-y-2">
            <motion.a
              href={affiliateLinks.accommodation.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-mono font-semibold text-sm tracking-wider transition-all hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] active:scale-[0.98]"
            >
              Find a place to stay in {city.name} <ExternalLink className="w-3.5 h-3.5" />
            </motion.a>
          <a
            href={`/destinations/${city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 text-[10px] font-mono tracking-[0.15em] text-primary/70 hover:text-primary transition-colors uppercase"
          >
            Read full {city.name} guide →
          </a>
          </div>

          {/* Secondary Links — Deployment Grid */}
          <div className="px-6 py-3 border-t border-border/30 mt-3">
            <DeploymentGrid links={affiliateLinks} cityName={city.name} />
          </div>

          {/* Action Row */}
          <div className="px-6 py-4 border-t border-border/30 flex gap-2">
            <Button onClick={onSave} variant="outline" className="flex-1 gap-2 rounded-lg border-border text-foreground/60 hover:bg-white/5 hover:text-foreground text-[10px] font-mono tracking-[0.15em]">
              <Bookmark className="w-3 h-3" /> SAVE
            </Button>
            <Button onClick={onRespin} variant="outline" className="flex-1 gap-2 rounded-lg border-border text-foreground/60 hover:bg-white/5 hover:text-foreground text-[10px] font-mono tracking-[0.15em]">
              <RotateCcw className="w-3 h-3" /> SPIN AGAIN
            </Button>
            <Button onClick={onShare} variant="outline" className="gap-2 rounded-lg border-border text-foreground/60 hover:bg-white/5 hover:text-foreground text-[10px] font-mono tracking-[0.15em]">
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ icon, label, value, tooltip, source }: { icon: React.ReactNode; label: string; value: string; tooltip?: string; source?: 'verified' | 'estimated' }) {
  return (
    <div className="flex items-center gap-2.5 p-3.5 bg-white/[0.02]">
      <span className="text-muted-foreground/80">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="text-[9px] font-mono font-medium text-foreground/60 tracking-[0.12em] truncate uppercase">{label}</p>
          {source && <DataSourceIndicator source={source} />}
          {tooltip && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground/40 hover:text-foreground/60 transition-colors pointer-events-auto" aria-label={`Info about ${label}`}>
                    <Info className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-base font-mono font-semibold text-foreground tabular-nums">{value}</p>
      </div>
    </div>
  );
}
