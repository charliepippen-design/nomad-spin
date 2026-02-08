import { motion } from 'framer-motion';
import { MapPin, DollarSign, Wifi, Shield, ChevronRight } from 'lucide-react';
import type { ScoredCity } from '@/lib/scoring';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + rank * 0.15 }}
      className="gradient-border-wrap rounded-sm"
    >
      <div className="bg-black/80 backdrop-blur-[60px] rounded-sm p-4">
        <div className="flex items-center gap-3">
          <ScoreRingSmall score={score} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-mono font-light tracking-[0.12em] text-foreground truncate uppercase">
              {city.name} <span className="text-muted-foreground">// {city.countryCode}</span>
            </h3>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
              <MapPin className="w-2.5 h-2.5" />
              <span className="text-[9px] font-mono tracking-wider">{city.country} · {city.region}</span>
            </div>
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[8px] font-mono tracking-[0.15em] rounded-sm border border-border/50 bg-white/[0.03] text-muted-foreground uppercase">
              {reason}
            </span>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-px mt-3 bg-border/10 rounded-sm overflow-hidden">
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
          className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-sm border border-border/50 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all text-[9px] font-mono tracking-[0.15em] text-muted-foreground hover:text-foreground uppercase"
        >
          VIEW FULL DOSSIER <ChevronRight className="w-3 h-3" />
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
      {/* Primary result */}
      {primaryContent}

      {/* Runner-up cards */}
      {runners.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground/60 uppercase text-center">
            ALTERNATIVE TARGETS
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
