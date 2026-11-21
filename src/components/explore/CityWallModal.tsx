import { useMemo, useState } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cities, type City } from '@/data/cities';
import CityCard from './CityCard';
import ComparisonMatrix from './ComparisonMatrix';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { cityDisplayName } from '@/i18n/content';
import { countryName } from '@/i18n/format';

interface CityWallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGION_LABELS: Record<City['region'], string> = {
  Asia: 'Asia',
  Europe: 'Europe',
  LATAM: 'LATAM',
  Africa: 'Africa',
  Oceania: 'Oceania',
  'North America': 'North America',
};

const REGIONS = ['All', ...Object.keys(REGION_LABELS)] as ['All', ...City['region'][]];
type RegionFilter = (typeof REGIONS)[number];

const exploreCities: City[] = [...cities].sort((a, b) =>
  a.name.localeCompare(b.name) || a.country.localeCompare(b.country)
);

export default function CityWallModal({ isOpen, onClose }: CityWallModalProps) {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<RegionFilter>('All');
  const t = useT();
  const locale = useLocale();

  // Other languages sort and search by the translated names (the English ones still match).
  const localCities = useMemo(() => {
    if (locale === 'en') return exploreCities;
    const named = exploreCities.map((city) => ({
      city,
      name: cityDisplayName(city, locale),
      country: countryName(city.countryCode, city.country, locale),
    }));
    return named
      .sort((a, b) => a.name.localeCompare(b.name, locale) || a.country.localeCompare(b.country, locale))
      .map((entry) => entry.city);
  }, [locale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localCities.filter((city) => {
      if (region !== 'All' && city.region !== region) return false;
      if (!q) return true;
      if (city.name.toLowerCase().includes(q) || city.country.toLowerCase().includes(q)) return true;
      if (locale === 'en') return false;
      return (
        cityDisplayName(city, locale).toLowerCase().includes(q) ||
        countryName(city.countryCode, city.country, locale).toLowerCase().includes(q)
      );
    });
  }, [query, region, locale, localCities]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedCities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectedCityData = localCities.filter((c) => selectedCities.includes(c.id));

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl overflow-y-auto overflow-x-hidden animate-in fade-in duration-300">
      <div className="sticky top-0 z-[105] bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 px-3 md:px-8 py-3 md:py-4">
          <div className="min-w-0">
            <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight truncate">
              {t('globe.wall.title')}
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground font-mono tracking-wider mt-0.5">
              {t('globe.wall.count', { shown: filtered.length, total: exploreCities.length })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shrink-0"
            aria-label={t('globe.wall.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row gap-2 px-3 md:px-8 pb-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('globe.wall.searchPlaceholder')}
            className="flex-1 min-w-0 rounded-lg border border-border bg-white/[0.04] px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-white/30"
            aria-label={t('globe.wall.searchLabel')}
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionFilter)}
            className="rounded-lg border border-border bg-white/[0.04] px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-white/30"
            aria-label={t('globe.wall.filterRegion')}
          >
            {REGIONS.map((item) => (
              <option key={item} value={item}>
                {t.dyn(`globe.region.${item}`, item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-16 text-center text-xs font-mono text-muted-foreground">
          {t('globe.wall.empty')}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 sm:gap-2 p-1.5 sm:p-2 md:p-4 w-full pb-28">
          {filtered.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              isSelected={selectedCities.includes(city.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedCities.length > 0 && !isComparing && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-popover text-foreground border border-border px-3 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 sm:gap-4 max-w-[calc(100vw-2rem)]"
          >
            <span className="text-xs sm:text-sm font-mono whitespace-nowrap">
              {t.n('globe.wall.selected', selectedCities.length)}
            </span>
            <button
              onClick={() => setIsComparing(true)}
              className="flex items-center gap-1.5 sm:gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono hover:bg-popover/95 transition-colors whitespace-nowrap"
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t('globe.wall.compare')}
            </button>
            <button
              onClick={() => setSelectedCities([])}
              className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              {t('globe.wall.clear')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
