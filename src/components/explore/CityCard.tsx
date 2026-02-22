import { useState, useCallback } from 'react';
import { Wifi, Check } from 'lucide-react';
import type { MockCity } from '@/data/mockCities';

const COUNTRY_FALLBACKS: Record<string, string> = {
  Paraguay: 'https://images.unsplash.com/photo-1629853380026-6b2191b29cc3?w=1080&fit=crop&auto=format&q=80',
  Vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1080&fit=crop&auto=format&q=80',
  Portugal: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1080&fit=crop&auto=format&q=80',
  Colombia: 'https://images.unsplash.com/photo-1624204719282-dae70e53ccb4?w=1080&fit=crop&auto=format&q=80',
  Thailand: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1080&fit=crop&auto=format&q=80',
  Argentina: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1080&fit=crop&auto=format&q=80',
  Georgia: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1080&fit=crop&auto=format&q=80',
  Mexico: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=1080&fit=crop&auto=format&q=80',
  'South Africa': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1080&fit=crop&auto=format&q=80',
  Hungary: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=1080&fit=crop&auto=format&q=80',
  Malaysia: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1080&fit=crop&auto=format&q=80',
};

const GLOBAL_FALLBACK = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&fit=crop&auto=format&q=80';

interface CityCardProps {
  city: MockCity;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export default function CityCard({ city, isSelected, onToggleSelect }: CityCardProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Tier 1: city.imageUrl (stable Unsplash CDN)
  // Tier 2: country-level fallback
  // Tier 3: global aerial fallback
  const src =
    retryCount === 0
      ? city.imageUrl
      : retryCount === 1
        ? COUNTRY_FALLBACKS[city.country] ?? GLOBAL_FALLBACK
        : GLOBAL_FALLBACK;

  const handleError = useCallback(() => {
    setRetryCount((r) => Math.min(r + 1, 2));
    setLoaded(false);
  }, []);

  return (
    <div
      className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer transition-all select-none ${
        isSelected
          ? 'border-2 border-blue-500 ring-1 ring-blue-500/40'
          : 'border border-white/10 hover:border-white/40'
      }`}
      onClick={() => onToggleSelect(city.id)}
    >
      {/* Shimmer skeleton — visible until image loads */}
      {!loaded && (
        <div className="absolute inset-0 z-[1] bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      )}

      {/* Full-bleed background image */}
      <img
        src={src}
        alt={city.name}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`absolute inset-0 w-full h-full object-cover aspect-[3/4] transition-transform duration-700 group-hover:scale-110 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none z-[2]" />

      {/* Selection checkbox */}
      <div
        className={`absolute top-2 left-2 z-20 w-5 h-5 rounded border flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-primary border-primary'
            : 'border-white/30 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100'
        }`}
      >
        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>

      {/* Rank */}
      <div className="absolute top-2 left-9 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white z-10">
        #{city.rank}
      </div>

      {/* Wifi */}
      <div className="absolute top-2 right-2 flex items-center gap-1 text-white z-10">
        <Wifi className="w-3 h-3" />
        <span className="text-[10px] font-bold">{city.internetMbps} Mbps</span>
      </div>

      {/* City info */}
      <div className="absolute bottom-2 left-2 flex flex-col z-10">
        <span className="text-white font-bold text-sm leading-tight">{city.name}</span>
        <span className="text-white/70 text-[10px]">{city.country}</span>
      </div>

      {/* Cost & Weather */}
      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 z-10">
        <span className="text-[10px] bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded text-white">
          {city.weatherIcon} {city.tempC}°C
        </span>
        <span className="text-xs font-extrabold text-white">${city.monthlyCost}/mo</span>
      </div>
    </div>
  );
}
