import { ArrowLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MockCity } from '@/data/mockCities';
import NomadImage from '@/components/common/NomadImage';

interface ComparisonMatrixProps {
  cities: MockCity[];
  onBack: () => void;
}

function generateSafety(id: string): number {
  // Deterministic dummy safety score based on city id
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 5) + 5; // 5–9 range
}

function MetricRow({
  label,
  icon,
  values,
  bestIndex,
}: {
  label: string;
  icon: string;
  values: string[];
  bestIndex: number;
}) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(140px, 1fr))` }}>
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex flex-col items-center py-3 sm:py-4 border-b border-white/[0.06] ${
            i > 0 ? 'border-l border-white/[0.06]' : ''
          }`}
        >
          <span className="text-[8px] sm:text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-1">
            {icon} {label}
          </span>
          <span
            className={`text-sm sm:text-lg font-bold font-mono ${
              i === bestIndex ? 'text-emerald-400' : 'text-foreground'
            }`}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ComparisonMatrix({ cities, onBack }: ComparisonMatrixProps) {
  const costs = cities.map((c) => c.monthlyCost);
  const speeds = cities.map((c) => c.internetMbps);
  const safeties = cities.map((c) => generateSafety(c.id));

  const cheapestIdx = costs.indexOf(Math.min(...costs));
  const fastestIdx = speeds.indexOf(Math.max(...speeds));
  const safestIdx = safeties.indexOf(Math.max(...safeties));

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-3xl overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-[125] bg-black/70 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-3 md:px-8 py-3 md:py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            Back
          </button>
          <h2 className="text-sm sm:text-lg md:text-xl font-bold text-foreground tracking-tight font-mono uppercase">
            Compare
          </h2>
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Matrix */}
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 md:px-8 py-4 md:py-6 overflow-x-auto">
        {/* City headers */}
        <div
          className="grid gap-0 mb-0"
          style={{ gridTemplateColumns: `repeat(${cities.length}, minmax(140px, 1fr))` }}
        >
          {cities.map((city, i) => (
            <div
              key={city.id}
              className={`relative aspect-[4/3] overflow-hidden ${
                i > 0 ? 'border-l border-white/[0.06]' : ''
              }`}
            >
              <NomadImage
                src={city.imageUrl}
                cityName={city.name}
                countryName={city.country}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10">
                <p className="text-white font-bold text-xs sm:text-base leading-tight truncate">{city.name}</p>
                <p className="text-white/60 text-[10px] sm:text-xs truncate">{city.country}</p>
              </div>
              <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-white/20 backdrop-blur-md px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold text-white">
                #{city.rank}
              </div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-b-xl overflow-hidden">
          <MetricRow
            label="Monthly Cost"
            icon="💰"
            values={costs.map((c) => `$${c.toLocaleString()}`)}
            bestIndex={cheapestIdx}
          />
          <MetricRow
            label="Internet"
            icon="🌐"
            values={speeds.map((s) => `${s} Mbps`)}
            bestIndex={fastestIdx}
          />
          <MetricRow
            label="Weather"
            icon="🌡️"
            values={cities.map((c) => `${c.weatherIcon} ${c.tempC}°C`)}
            bestIndex={-1}
          />
          <MetricRow
            label="Safety"
            icon="🛡️"
            values={safeties.map((s) => `${s}/10`)}
            bestIndex={safestIdx}
          />
        </div>
      </div>
    </motion.div>
  );
}
