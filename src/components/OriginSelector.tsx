import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, ChevronDown, Crosshair, Search } from 'lucide-react';
import { origins, cityToOrigin, type Origin } from '@/data/origins';
import { cities } from '@/data/cities';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsMobile } from '@/hooks/use-mobile';

const STORAGE_KEY = 'nomadspin_origin_city_slug';

interface OriginSelectorProps {
  value: Origin | null;
  onChange: (origin: Origin | null) => void;
}

export default function OriginSelector({ value, onChange }: OriginSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();

  const handleOriginFound = useCallback((origin: Origin) => {
    onChange(origin);
    localStorage.setItem(STORAGE_KEY, origin.id);
  }, [onChange]);

  const geo = useGeolocation(handleOriginFound);

  const allSearchableOrigins = useMemo(() => {
    const originIds = new Set(origins.map(o => o.id));
    const citiesAsOrigins = cities
      .filter(c => !originIds.has(c.id))
      .map(c => cityToOrigin(c));
    return [...origins, ...citiesAsOrigins];
  }, []);

  useEffect(() => {
    if (value) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = allSearchableOrigins.find(o => o.id === stored);
      if (found) onChange(found);
    }
  }, []);

  const handleSelect = useCallback((origin: Origin) => {
    onChange(origin);
    setOpen(false);
    setSearch('');
  }, [onChange]);

  const hasOrigin = value && value.id !== 'anywhere';
  const displayName = geo.acquiredCity
    ? (isMobile ? geo.acquiredCity.slice(0, 8) : `Located: ${geo.acquiredCity}`)
    : hasOrigin
      ? (isMobile ? value.name.slice(0, 8).toUpperCase() : `BASE: ${value.name.toUpperCase()}`)
      : (isMobile ? 'BASE' : 'LOCATION: ANYWHERE');

  return (
    <div className="relative flex items-center gap-1">
      {/* Locate Me mini-button */}
      <button
        onClick={geo.locate}
        disabled={geo.locating}
        className="p-1.5 rounded-lg border border-border/40 bg-white/[0.03] hover:bg-white/[0.06] transition-all text-muted-foreground"
        title="Detect my location"
      >
        <Crosshair className={`w-3 h-3 ${geo.locating ? 'animate-spin' : ''}`} />
      </button>

      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg border border-border/40 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
        title="Filter recommendations based on your current base or target region"
      >
        <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        <span className={`text-[10px] font-mono tracking-wider max-w-[60px] md:max-w-[120px] truncate ${geo.acquiredCity ? 'text-primary' : 'text-muted-foreground'}`}>
          {displayName}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch(''); }} />
          <div className="absolute right-0 top-full mt-1 z-50 w-60 max-h-72 overflow-hidden rounded-sm border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl flex flex-col">
            <div className="sticky top-0 bg-background/95 border-b border-border/50 p-2">
              <div className="flex items-center gap-2 px-2">
                <Search className="w-3 h-3 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cities..."
                  className="flex-1 bg-transparent text-[10px] font-mono tracking-wider text-foreground placeholder:text-muted-foreground outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {(search.trim()
                ? allSearchableOrigins.filter(o =>
                    o.name.toLowerCase().includes(search.toLowerCase()) ||
                    o.country.toLowerCase().includes(search.toLowerCase())
                  )
                : allSearchableOrigins
              ).map((origin) => (
                <button
                  key={origin.id}
                  onClick={() => handleSelect(origin)}
                  className={`w-full text-left px-3 py-2 text-[10px] font-mono tracking-wider hover:bg-white/[0.06] transition-colors flex items-center gap-2 ${
                    value?.id === origin.id ? 'text-primary bg-primary/[0.06]' : 'text-muted-foreground'
                  }`}
                >
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{origin.name}</span>
                  {origin.country && (
                    <span className="text-muted-foreground/50 ml-auto flex-shrink-0">{origin.country}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
