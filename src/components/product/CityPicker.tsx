import { useId, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { allCitySlugs } from '@/lib/citySlug';
import type { City } from '@/data/cities';
import { cityDisplayName } from '@/i18n/content';
import { countryName, formatNumber } from '@/i18n/format';
import { useLocale, useT } from '@/i18n/LocaleProvider';

interface CityPickerProps {
  onPick: (city: City, slug: string) => void;
  /** City ids to leave out of the results (already chosen). */
  excludeIds?: string[];
  placeholder?: string;
  label: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const MAX_RESULTS = 8;

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Search-as-you-type city combobox over the full dataset. Keyboard: arrows, Enter, Escape. */
export default function CityPicker({
  onPick,
  excludeIds = [],
  placeholder,
  label,
  disabled = false,
  autoFocus = false,
}: CityPickerProps) {
  const t = useT();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const index = useMemo(
    () =>
      allCitySlugs().map(({ city, slug }) => {
        // In another language a city answers to both names: "Lisbona" and "Lisbon".
        const displayName = cityDisplayName(city, locale);
        const displayCountry = countryName(city.countryCode, city.country, locale);
        const name = normalize(displayName);
        const country = normalize(displayCountry);
        const enName = normalize(city.name);
        const enCountry = normalize(city.country);
        return {
          city,
          slug,
          displayName,
          displayCountry,
          name,
          names: enName === name ? [name] : [name, enName],
          countries: enCountry === country ? [country] : [country, enCountry],
        };
      }),
    [locale],
  );

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    const excluded = new Set(excludeIds);
    // Rank: exact name, then names starting with the query (shortest first), then any other match.
    const exact: typeof index = [];
    const starts: typeof index = [];
    const contains: typeof index = [];
    for (const row of index) {
      if (excluded.has(row.city.id)) continue;
      if (row.names.some((n) => n === q)) exact.push(row);
      else if (row.names.some((n) => n.startsWith(q))) starts.push(row);
      else if (row.names.some((n) => n.includes(q)) || row.countries.some((c) => c.includes(q))) contains.push(row);
    }
    starts.sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
    return [...exact, ...starts, ...contains].slice(0, MAX_RESULTS);
  }, [query, index, excludeIds]);

  const pick = (row: (typeof results)[number]) => {
    onPick(row.city, row.slug);
    setQuery('');
    setOpen(false);
    setActive(0);
    inputRef.current?.focus();
  };

  const showList = open && query.trim().length > 0;

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={`${listId}-input`}>
        {label}
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        id={`${listId}-input`}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].slug}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        value={query}
        placeholder={placeholder ?? t('tools.picker.placeholder')}
        className="dns-input pl-10"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && showList && results[active]) {
            e.preventDefault();
            pick(results[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-80 overflow-auto rounded-lg border border-border bg-popover p-1 shadow-xl shadow-black/30"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-muted-foreground">{t('tools.picker.noMatch', { query: query.trim() })}</li>
          ) : (
            results.map((row, i) => (
              <li
                key={row.slug}
                id={`${listId}-${row.slug}`}
                role="option"
                aria-selected={i === active}
                className={`flex cursor-pointer items-baseline justify-between gap-3 rounded-md px-3 py-2 text-sm ${
                  i === active ? 'bg-primary/10 text-foreground' : 'text-foreground'
                }`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(row);
                }}
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium">{row.displayName}</span>
                  <span className="text-muted-foreground">, {row.displayCountry}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {t('tools.money.perMonth', { amount: formatNumber(row.city.costUSD, locale) })}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
