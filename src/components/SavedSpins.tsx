import { motion, AnimatePresence } from 'framer-motion';
import { useSpinStore } from '@/store/useSpinStore';
import { Bookmark, MapPin, Trash2 } from 'lucide-react';

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
        <Bookmark className="w-4 h-4 text-accent" />
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Saved Destinations ({savedSpins.length})
        </h3>
      </div>
      <div className="space-y-2">
        {savedSpins.map((city) => (
          <div
            key={city.id}
            className="flex items-center gap-3 p-3 rounded-lg glass border border-border/50 hover:border-primary/30 transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{city.name}</p>
              <p className="text-xs text-muted-foreground">{city.country} · ${city.costUSD}/mo</p>
            </div>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{city.safety}/10</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
