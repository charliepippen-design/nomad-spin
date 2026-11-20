import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Link2, Minus, X } from 'lucide-react';
import type { City } from '@/data/cities';
import {
  COMPARE_PARAM,
  MAX_COMPARE,
  MIN_COMPARE,
  buildComparison,
  compareParamValue,
  comparePath,
  costDelta,
  parseCompareParam,
  type CompareGroup,
  type CompareRow,
} from '@/lib/compare';
import { cityPath, citySlug, findCityBySlug } from '@/lib/citySlug';
import { useCompareStore } from '@/store/useCompareStore';
import { trackEvent } from '@/utils/analytics';
import CityPicker from '@/components/product/CityPicker';
import PageMeta from '@/components/product/PageMeta';
import ProvenanceMark from '@/components/product/ProvenanceMark';

const TITLE = 'Compare Cities for Remote Work | Nomad Spin';
const DESCRIPTION =
  'Put two to four cities side by side: monthly cost, internet, safety, visa length, climate and community. Share the comparison with one link.';

/** Starter pairs. Each slug is resolved against the dataset; a pair with a missing city is dropped. */
const STARTER_SETS: string[][] = [
  ['lisbon', 'porto'],
  ['chiang-mai', 'bangkok'],
  ['penang', 'kuala-lumpur'],
  ['medellin', 'mexico-city'],
  ['tbilisi', 'budapest'],
];

function resolveSet(slugs: string[]): City[] | null {
  const cities = slugs.map((s) => findCityBySlug(s)?.city ?? null);
  return cities.every((c): c is City => c !== null) ? (cities as City[]) : null;
}

function gridStyle(count: number): React.CSSProperties {
  return { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` };
}

export default function Compare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setShortlist = useCompareStore((s) => s.set);
  const [copied, setCopied] = useState(false);
  const completedKey = useRef<string>('');

  const rawParam = searchParams.get(COMPARE_PARAM);
  const cities = useMemo(() => parseCompareParam(rawParam), [rawParam]);

  // No cities in the URL: restore the shortlist this browser built on other pages.
  const userChanged = useRef(false);
  useEffect(() => {
    const saved = useCompareStore.getState().slugs;
    if (!rawParam && saved.length > 0) {
      // navigate keeps the commas readable; setSearchParams would encode them as %2C.
      navigate(`/compare?${COMPARE_PARAM}=${saved.join(',')}`, { replace: true });
    }
    // Mount only: later URL changes come from the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the shortlist in step with what is on screen.
  const paramValue = compareParamValue(cities);
  useEffect(() => {
    if (rawParam === null && !userChanged.current) return;
    setShortlist(paramValue ? paramValue.split(',') : []);
  }, [paramValue, rawParam, setShortlist]);

  const setCities = useCallback(
    (next: City[]) => {
      userChanged.current = true;
      navigate(comparePath(next));
    },
    [navigate],
  );

  const addCity = (city: City) => {
    if (cities.length >= MAX_COMPARE || cities.some((c) => c.id === city.id)) return;
    trackEvent('compare_add_city', { city: citySlug(city), position: cities.length + 1, source: 'compare_page' });
    setCities([...cities, city]);
  };

  const removeCity = (city: City) => setCities(cities.filter((c) => c.id !== city.id));

  const ready = cities.length >= MIN_COMPARE;
  const groups = useMemo(() => (ready ? buildComparison(cities) : []), [ready, cities]);

  useEffect(() => {
    if (!ready || completedKey.current === paramValue) return;
    completedKey.current = paramValue;
    trackEvent('compare_complete', { cities: paramValue, count: cities.length });
  }, [ready, paramValue, cities.length]);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${comparePath(cities)}` : comparePath(cities);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackEvent('compare_share', { cities: paramValue, count: cities.length });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const delta = cities.length === 2 ? costDelta(cities[0], cities[1]) : null;
  const hasEstimates = groups.some((g) => g.rows.some((r) => r.cells.some((c) => c.provenance !== 'dataset')));
  const starters = useMemo(
    () => STARTER_SETS.map(resolveSet).filter((set): set is City[] => set !== null),
    [],
  );

  return (
    <div className="page-content min-h-screen bg-background">
      <PageMeta title={TITLE} description={DESCRIPTION} path="/compare" />

      <main className="dns-container py-10 md:py-14">
        <header className="max-w-2xl">
          <p className="dns-eyebrow">Compare</p>
          <h1 className="mt-3 text-4xl md:text-5xl text-foreground">Side by side, on what matters.</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            Pick two to four cities. Each row shows who leads and where the data runs out. There is no overall
            winner: that depends on what you care about.
          </p>
        </header>

        {/* Selection */}
        <section aria-label="Cities to compare" className="mt-8">
          <div className="grid gap-3 md:grid-cols-[minmax(0,22rem)_1fr] md:items-start">
            <div>
              <CityPicker
                label="Add a city to compare"
                placeholder={cities.length >= MAX_COMPARE ? 'Remove a city to add another' : 'Add a city'}
                excludeIds={cities.map((c) => c.id)}
                disabled={cities.length >= MAX_COMPARE}
                onPick={addCity}
              />
              <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
                {cities.length} of {MAX_COMPARE} cities selected
              </p>
            </div>
            {cities.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <li key={city.id} className="dns-chip !py-1.5 !pl-3 !pr-1.5 !text-sm !text-foreground">
                    {city.name}
                    <button
                      type="button"
                      onClick={() => removeCity(city)}
                      aria-label={`Remove ${city.name}`}
                      className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
                {ready && (
                  <li>
                    <button type="button" onClick={copyLink} className="dns-btn-secondary !py-1.5 !text-sm">
                      {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
                      {copied ? 'Link copied' : 'Copy share link'}
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </section>

        {/* Empty and one-city states */}
        {!ready && (
          <section className="mt-10 dns-card p-6 md:p-8">
            <h2 className="text-xl text-foreground">
              {cities.length === 0 ? 'Start with a pair' : `Add one more city to compare with ${cities[0].name}`}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {cities.length === 0
                ? 'Search above, or open one of these.'
                : 'Search above. You can add up to four.'}
            </p>
            {cities.length === 0 && starters.length > 0 && (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {starters.map((set) => (
                  <li key={compareParamValue(set)}>
                    <Link
                      to={comparePath(set)}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground hover:border-primary/50"
                    >
                      <span>{set.map((c) => c.name).join(' vs ')}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Comparison */}
        {ready && (
          <>
            {delta && (
              <p className="mt-8 text-lg text-foreground">
                <strong className="font-semibold">{delta.cheaper.name}</strong> costs{' '}
                <span className="dns-num text-primary">${delta.amount.toLocaleString('en-US')}</span> less per month than{' '}
                {delta.pricier.name} ({delta.percent}% lower).
              </p>
            )}

            <div className="mt-8">
              <div>
                {/* City header */}
                <div className="sticky top-14 z-20 border-b border-border bg-background/95 backdrop-blur md:grid md:grid-cols-[13rem_1fr] md:gap-6 md:px-5">
                  <div className="hidden md:block" />
                  <div className="grid gap-3 px-4 py-3 md:px-0" style={gridStyle(cities.length)}>
                    {cities.map((city) => (
                      <div key={city.id} className="min-w-0">
                        <Link to={cityPath(city)} className="block truncate font-display text-base font-bold text-foreground hover:text-primary md:text-lg">
                          {city.name}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">{city.country}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {groups.map((group) => (
                  <GroupBlock key={group.group} group={group} cities={cities} />
                ))}
              </div>
            </div>

            <footer className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="dns-card p-5 text-sm text-muted-foreground leading-relaxed">
                <h2 className="text-base text-foreground">How to read this</h2>
                <ul className="mt-3 space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-0.5 inline-flex h-4 shrink-0 items-center rounded bg-primary/15 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Leads
                    </span>
                    <span>One city is strictly best on that row. Ties and preference rows have no leader.</span>
                  </li>
                  <li className="flex gap-2">
                    <Minus className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>“No data” means the dataset has no figure for that city. It is never filled in.</span>
                  </li>
                  {hasEstimates && (
                    <li>
                      Figures tagged <ProvenanceMark provenance="estimate" /> or <ProvenanceMark provenance="formula" /> are
                      not hand-checked values.
                    </li>
                  )}
                  <li>Visa rows depend on your passport. Confirm with an official source before you book.</li>
                </ul>
                <Link to="/methodology" className="mt-4 inline-flex items-center gap-1 text-primary hover:underline">
                  Methodology and data sources <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="dns-card p-5">
                <h2 className="text-base text-foreground">Not sure which criteria matter most?</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Find Your Base ranks every city against your budget, climate and work needs, with weights you control.
                </p>
                <Link to="/find-your-base" className="dns-btn-primary mt-4">
                  Find your base <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

function GroupBlock({ group, cities }: { group: CompareGroup; cities: City[] }) {
  const leaders = cities
    .map((city, i) => ({ city, leads: group.leads[i] }))
    .filter((entry) => entry.leads > 0)
    .sort((a, b) => b.leads - a.leads);

  return (
    <section aria-labelledby={`group-${group.group}`} className="pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-2">
        <h2 id={`group-${group.group}`} className="text-xl text-foreground">
          {group.group}
        </h2>
        {group.decided > 0 && (
          <p className="text-xs text-muted-foreground">
            {leaders.length === 0
              ? 'Level on every row'
              : leaders
                  .map((entry) => `${entry.city.name} leads ${entry.leads} of ${group.decided}`)
                  .join(' · ')}
          </p>
        )}
      </div>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {group.rows.map((row) => (
          <MetricRow key={row.metric.key} row={row} count={cities.length} />
        ))}
      </div>
    </section>
  );
}

function MetricRow({ row, count }: { row: CompareRow; count: number }) {
  return (
    <div className="px-4 py-3.5 md:grid md:grid-cols-[13rem_1fr] md:gap-6 md:px-5">
      <div className="mb-2 md:mb-0">
        <p className="text-sm font-medium text-foreground">{row.metric.label}</p>
        <p className="text-xs text-muted-foreground leading-snug">{row.metric.definition}</p>
      </div>
      <div className="grid gap-3" style={gridStyle(count)}>
        {row.cells.map((cell) => (
          <div key={cell.city.id} className="min-w-0">
            {cell.text === null ? (
              <p className="text-sm text-muted-foreground/70">No data</p>
            ) : (
              <>
                <p className={`text-sm leading-snug ${cell.isLeader ? 'text-primary' : 'text-foreground'}`}>
                  <span className={cell.value !== null ? 'dns-num text-[15px]' : ''}>{cell.text}</span>
                  <ProvenanceMark provenance={cell.provenance} />
                  {cell.isLeader && (
                    <span className="ml-1.5 inline-flex items-center rounded bg-primary/15 px-1.5 py-px align-middle text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Leads
                    </span>
                  )}
                </p>
                {cell.bar !== null && (
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-background" aria-hidden="true">
                    <div
                      className={`h-full rounded-full ${cell.isLeader ? 'bg-primary' : 'bg-info/60'}`}
                      style={{ width: `${Math.max(4, Math.round(cell.bar * 100))}%` }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
