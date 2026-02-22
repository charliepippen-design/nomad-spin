import { useState } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockCities } from '@/data/mockCities';
import CityCard from './CityCard';
import ComparisonMatrix from './ComparisonMatrix';

interface CityWallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CityWallModal({ isOpen, onClose }: CityWallModalProps) {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedCities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectedCityData = mockCities.filter((c) => selectedCities.includes(c.id));

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-2xl overflow-y-auto overflow-x-hidden animate-in fade-in duration-300">
      {/* Sticky header */}
      <div className="sticky top-0 z-[105] bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-3 md:px-8 py-3 md:py-4">
          <div className="min-w-0">
            <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight truncate">
              Explore Destinations
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground font-mono tracking-wider mt-0.5">
              {mockCities.length} cities · Tap to compare
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 sm:gap-2 p-1.5 sm:p-2 md:p-4 w-full pb-28">
        {mockCities.map((city) => (
          <CityCard
            key={city.id}
            city={city}
            isSelected={selectedCities.includes(city.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>

      {/* Floating action bar */}
      <AnimatePresence>
        {selectedCities.length > 0 && !isComparing && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-white text-black px-3 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 sm:gap-4 max-w-[calc(100vw-2rem)]"
          >
            <span className="text-xs sm:text-sm font-mono whitespace-nowrap">
              {selectedCities.length} {selectedCities.length === 1 ? 'city' : 'cities'}
            </span>
            <button
              onClick={() => setIsComparing(true)}
              className="flex items-center gap-1.5 sm:gap-2 bg-black text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono hover:bg-black/80 transition-colors whitespace-nowrap"
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Compare
            </button>
            <button
              onClick={() => setSelectedCities([])}
              className="text-[10px] sm:text-xs text-black/50 hover:text-black transition-colors font-mono"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Matrix */}
      <AnimatePresence>
        {isComparing && selectedCityData.length > 0 && (
          <ComparisonMatrix
            cities={selectedCityData}
            onBack={() => setIsComparing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
