import { motion } from 'framer-motion';
import { useSpinStore } from '@/store/useSpinStore';
import { Bookmark, MapPin } from 'lucide-react';

export default function SavedSpins() {
  const { savedSpins } = useSpinStore();

  if (savedSpins.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto mt-8 px-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Bookmark className="w-3 h-3 text-muted-foreground" />
        <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          SAVED ({savedSpins.length})
        </h3>
      </div>
      <div className="space-y-1">
        {savedSpins.map((city) => (
          <div
            key={city.id}
            className="flex items-center gap-3 p-3 rounded-sm glass glass-hover transition-colors"
          >
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-foreground/80 truncate tracking-wider">{city.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{city.country} · ${city.costUSD}/mo</p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{city.safety}/10</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
