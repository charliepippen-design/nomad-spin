import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapPin, ChevronDown, LocateFixed, Loader2, Search } from 'lucide-react';
import { origins, cityToOrigin, type Origin } from '@/data/origins';
import { cities } from '@/data/cities';
import { useGeolocation } from '@/hooks/useGeolocation';
import { findOriginById } from '@/lib/originLookup';

const STORAGE_KEY = 'nomadspin_origin_city_slug';

/** Text of the trigger after "Leaving from:". */
export function originLabel(value: Origin | null): string {
  if (!value) return 'choose';
  return value.id === 'anywhere' ? 'anywhere' : value.name;
}

interface OriginSelectorProps {
  value: Origin | null;
  onChange: (origin: Origin | null) => void;
  className?: string;
}

/**
 * "Leaving from" picker. The same component sits in the site header and in the
 * home drawer; both read and write the origin kept in useSpinStore.
 * The browser is asked for the position only when the visitor picks "Use my location".
 */
export default function OriginSelector({ value, onChange, className = '' }: OriginSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const choose = useCallback((origin: Origin) => {
    onChange(origin);
    try {
      localStorage.setItem(STORAGE_KEY, origin.id);
    } catch {
      // Storage can be unavailable (private mode); the choice still holds for this visit.
    }
  }, [onChange]);

  const geo = useGeolocation(choose);

  const allSearchableOrigins = useMemo(() => {
    const originIds = new Set(origins.map(o => o.id));
    const citiesAsOrigins = cities
      .filter(c => !originIds.has(c.id))
      .map(c => cityToOrigin(c));
    return [...origins, ...citiesAsOrigins];
  }, []);

  // Restore the last choice. Reads storage only: never asks for the position.
  useEffect(() => {
    if (value) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    const found = findOriginById(stored);
    if (found) onChange(found);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  // Close on a click outside or on Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const handleSelect = useCallback((origin: Origin) => {
    choose(origin);
    close();
  }, [choose, close]);

  const handleLocate = useCallback(() => {
    geo.locate();
    close();
  }, [geo, close]);

  const query = search.trim().toLowerCase();
  const visibleOrigins = query
    ? allSearchableOrigins.filter(o =>
        o.name.toLowerCase().includes(query) || o.country.toLowerCase().includes(query))
    : allSearchableOrigins;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex h-9 max-w-full items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 text-sm transition-colors hover:border-primary/50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Leaving from: ${originLabel(value)}. Change the city you leave from`}
        title="Flight times, match scores and flight links are worked out from this city"
      >
        {geo.locating
          ? <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-muted-foreground" />
          : <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />}
        <span className="whitespace-nowrap text-muted-foreground">Leaving from:</span>
        <span className={`max-w-[9rem] truncate font-medium ${value ? 'text-foreground' : 'text-primary'}`}>
          {originLabel(value)}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 flex max-h-80 w-64 flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl">
          <button
            type="button"
            onClick={handleLocate}
            className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <LocateFixed className="h-3.5 w-3.5 flex-shrink-0" />
            Use my location
          </button>
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities..."
              aria-label="Search cities"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Cities">
            {visibleOrigins.map((origin) => (
              <button
                type="button"
                key={origin.id}
                role="option"
                aria-selected={value?.id === origin.id}
                onClick={() => handleSelect(origin)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                  value?.id === origin.id ? 'bg-primary/10 text-primary' : 'text-foreground/80'
                }`}
              >
                <span className="truncate">{origin.id === 'anywhere' ? 'Anywhere' : origin.name}</span>
                {origin.country && (
                  <span className="ml-auto flex-shrink-0 text-xs text-muted-foreground">{origin.country}</span>
                )}
              </button>
            ))}
            {visibleOrigins.length === 0 && (
              <p className="px-3 py-3 text-sm text-muted-foreground">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
