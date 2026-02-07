import { motion } from 'framer-motion';
import { DollarSign, Wifi, Shield, Plane, Clock, Sun, Users } from 'lucide-react';
import type { City } from '@/data/cities';

interface CityTooltipProps {
  city: City;
  x: number;
  y: number;
}

export default function CityTooltip({ city, x, y }: CityTooltipProps) {
  // Position tooltip so it doesn't overflow screen edges
  const tooltipStyle: React.CSSProperties = {
    left: Math.min(x + 16, window.innerWidth - 320),
    top: Math.max(y - 10, 8),
    maxWidth: 300,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[80] pointer-events-none"
      style={tooltipStyle}
    >
      <div className="gradient-border-wrap rounded-lg">
        <div className="bg-black/95 backdrop-blur-[60px] rounded-lg p-4 space-y-3">
          {/* Header */}
          <div>
            <h3 className="font-mono text-sm tracking-[0.15em] text-foreground uppercase">
              {city.name}
            </h3>
            <p className="font-mono text-[10px] text-muted-foreground tracking-[0.1em]">
              {city.country} · {city.region}
            </p>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-2">
            <MetricRow icon={<DollarSign className="w-3 h-3" />} label="COST/MO" value={`$${city.financials.costNomadSingle}`} />
            <MetricRow icon={<Wifi className="w-3 h-3" />} label="INTERNET" value={`${city.infra.internetSpeedAvg} Mbps`} />
            <MetricRow icon={<Shield className="w-3 h-3" />} label="SAFETY" value={`${city.safety}/10`} />
            <MetricRow icon={<Sun className="w-3 h-3" />} label="AVG TEMP" value={`${city.weather.tempAvgC}°C`} />
            <MetricRow icon={<Plane className="w-3 h-3" />} label="VISA" value={`${city.meta.visaDays}d`} />
            <MetricRow icon={<Clock className="w-3 h-3" />} label="TIMEZONE" value={city.meta.timeZoneUtc} />
            <MetricRow icon={<Users className="w-3 h-3" />} label="COMMUNITY" value={`${city.vibeMetrics.communitySize}/10`} />
            <MetricRow icon={<Wifi className="w-3 h-3" />} label="COWORKING" value={city.infra.coworkingDensity} />
          </div>

          {/* Vibes */}
          <div className="flex flex-wrap gap-1">
            {city.vibe.map(v => (
              <span key={v} className="px-1.5 py-0.5 rounded-sm bg-white/[0.06] border border-white/[0.08] font-mono text-[8px] tracking-[0.1em] text-muted-foreground uppercase">
                {v}
              </span>
            ))}
          </div>

          {/* Top pro */}
          {city.pros[0] && (
            <p className="font-mono text-[9px] text-muted-foreground/70 tracking-wider italic">
              ✦ {city.pros[0]}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MetricRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground/60">{icon}</span>
      <div className="min-w-0">
        <p className="font-mono text-[7px] text-muted-foreground/50 tracking-[0.15em]">{label}</p>
        <p className="font-mono text-[10px] text-foreground tracking-wider truncate">{value}</p>
      </div>
    </div>
  );
}
