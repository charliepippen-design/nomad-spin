import { motion } from 'framer-motion';
import { MapPin, DollarSign, Wifi, Shield, ChevronRight } from 'lucide-react';
import type { ScoredCity } from '@/lib/scoring';
import { getCityThumbnailUrl } from '@/data/cityImages';
import { generateBadges } from '@/lib/badges';

interface ScoreRingSmallProps {
  score: number;
}

function ScoreRingSmall({ score }: ScoreRingSmallProps) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <motion.circle
          cx="32" cy="32" r="28"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-mono font-light text-foreground tracking-wider">{score}</span>
        <span className="text-[6px] font-mono text-muted-foreground uppercase tracking-[0.15em]">match</span>
      </div>
    </div>
  );
}

interface RunnerUpCardProps {
  scored: ScoredCity;
  rank: number;
  onSelect: () => void;
}

function RunnerUpCard({ scored, rank, onSelect }: RunnerUpCardProps) {
  const { city, score, reason } = scored;
  const badges = generateBadges(city).slice(0, 2);
  const thumbUrl = getCityThumbnailUrl(city.id, city.region);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + rank * 0.15 }}
      className="rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
    >
      {/* Thumbnail strip */}
      <div className="relative h-24 overflow-hidden">
        <img
          src={thumbUrl}
          alt={`${city.name}, ${city.country}`}
          loading="lazy"
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-sm font-mono font-light tracking-[0.12em] text-white truncate uppercase drop-shadow-lg">
            {city.name} <span className="text-white/60">// {city.countryCode}</span>
          </h3>
          <div className="flex items-center gap-1.5 text-white/60 mt-0.5">
            <MapPin className="w-2.5 h-2.5" />
            <span className="text-[9px] font-mono tracking-wider">{city.country} · {city.region}</span>
          </div>
        </div>
      </div>

      <div className="bg-black/80 backdrop-blur-[60px] p-4">
        <div className="flex items-center gap-3">
          <ScoreRingSmall score={score} />
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2 py-0.5 text-[8px] font-mono tracking-[0.15em] rounded-md border border-border/50 bg-white/[0.03] text-muted-foreground uppercase">
              {reason}
            </span>
            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {badges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-mono tracking-wider rounded-md border ${badge.color}`}
                  >
                    {badge.emoji} {badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-px mt-3 bg-border/10 rounded-lg overflow-hidden">
          <div className="flex items-center gap-1.5 p-2 bg-white/[0.02]">
            <DollarSign className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[10px] font-mono text-foreground">${city.costUSD}/mo</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-white/[0.02]">
            <Wifi className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[10px] font-mono text-foreground">{city.internetMbps}Mbps</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-white/[0.02]">
            <Shield className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[10px] font-mono text-foreground">{city.safety}/10</span>
          </div>
        </div>

        {/* View full dossier */}
        <button
          onClick={onSelect}
          className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border/50 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all text-[9px] font-mono tracking-[0.15em] text-muted-foreground hover:text-foreground uppercase"
        >
          VIEW DETAILS <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

interface TopResultsGridProps {
  topResults: ScoredCity[];
  onSelectResult: (index: number) => void;
  primaryContent: React.ReactNode;
}

export default function TopResultsGrid({ topResults, onSelectResult, primaryContent }: TopResultsGridProps) {
  const runners = topResults.slice(1, 3);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {primaryContent}

      {runners.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground/60 uppercase text-center">
            OTHER GREAT MATCHES
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {runners.map((scored, i) => (
              <RunnerUpCard
                key={scored.city.id}
                scored={scored}
                rank={i + 2}
                onSelect={() => onSelectResult(i + 1)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
