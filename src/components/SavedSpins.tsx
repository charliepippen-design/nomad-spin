import { motion } from 'framer-motion';
import { useSpinStore } from '@/store/useSpinStore';
import { Bookmark, MapPin, Trash2, RotateCcw } from 'lucide-react';

export default function SavedSpins() {
  const { savedSpins, removeSavedSpin, redeploySpin } = useSpinStore();

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
          MISSION ARCHIVE ({savedSpins.length})
        </h3>
      </div>
      <div className="space-y-1">
        {savedSpins.map((entry, index) => (
          <div
            key={entry.city.id + '-' + index}
            className="flex items-center gap-3 p-3 rounded-sm glass glass-hover transition-colors group"
          >
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-foreground/80 truncate tracking-wider">
                MISSION #{String(index + 1).padStart(3, '0')}: {entry.city.name.toUpperCase()}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {entry.city.country} · ${entry.city.costUSD}/mo · {entry.timestamp}
              </p>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider mr-1">
              PENDING
            </span>
            <button
              onClick={() => redeploySpin(index)}
              className="p-1.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
              title="Re-deploy with same filters"
            >
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </button>
            <button
              onClick={() => removeSavedSpin(index)}
              className="p-1.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
