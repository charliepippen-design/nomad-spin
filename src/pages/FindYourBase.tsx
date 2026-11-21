import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from '@/i18n/Link';
import type { Locale } from '@/i18n/config';
import { cityDisplayName } from '@/i18n/content';
import { countryName, formatNumber } from '@/i18n/format';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { rich } from '@/i18n/rich';
import { ArrowRight, ChevronDown, RotateCcw } from 'lucide-react';
import { cities as ALL_CITIES } from '@/data/cities';
import type { City } from '@/data/cities';
import {
  CRITERIA,
  criterionLabel,
  DEFAULT_PREFERENCES,
  DEFAULT_WEIGHTS,
  normalizeWeights,
  rankCities,
  type CriterionKey,
  type MatchPreferences,
  type MatchResult,
} from '@/lib/matching';
import { MAX_COMPARE, comparePath } from '@/lib/compare';
import { cityPath, citySlug } from '@/lib/citySlug';
import { trackEvent } from '@/utils/analytics';
import PageMeta from '@/components/product/PageMeta';

const REGIONS: City['region'][] = ['Europe', 'Asia', 'LATAM', 'North America', 'Africa', 'Oceania'];

/** One bar colour per criterion, in a fixed order, so the breakdown reads the same on every card. */
const CRITERION_COLOR: Record<CriterionKey, string> = {
  budget: 'bg-primary',
  climate: 'bg-info',
  internet: 'bg-[hsl(265_80%_74%)]',
  safety: 'bg-warning',
  community: 'bg-[hsl(340_80%_70%)]',
  visa: 'bg-[hsl(190_70%_55%)]',
};

/** A bare figure: unchanged in English, decimal comma and the like elsewhere. */
const plain = (n: number, locale: Locale): string => (locale === 'en' ? String(n) : formatNumber(n, locale));
/** One decimal place, as `toFixed(1)` in English. */
const oneDecimal = (n: number, locale: Locale): string =>
  locale === 'en' ? n.toFixed(1) : formatNumber(n, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ── URL state: short keys so a shared link stays readable. The keys and their values are the same in every language. ──
const num = (raw: string | null, fallback: number, min: number, max: number): number => {
  if (raw === null || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

function readState(params: URLSearchParams): { prefs: MatchPreferences; weights: Record<CriterionKey, number> } {
  const regions = (params.get('r') ?? '')
    .split(',')
    .filter((r): r is City['region'] => (REGIONS as string[]).includes(r));
  const rawWeights = (params.get('w') ?? '').split(',');
  const weights = { ...DEFAULT_WEIGHTS };
  if (rawWeights.length === CRITERIA.length) {
    CRITERIA.forEach((key, i) => {
      weights[key] = num(rawWeights[i], DEFAULT_WEIGHTS[key], 0, 50);
    });
  }
  return {
    prefs: {
      budgetMax: num(params.get('b'), DEFAULT_PREFERENCES.budgetMax, 500, 8000),
      tempIdeal: num(params.get('t'), DEFAULT_PREFERENCES.tempIdeal, 0, 35),
      internetMin: num(params.get('i'), DEFAULT_PREFERENCES.internetMin, 0, 300),
      safetyMin: num(params.get('s'), DEFAULT_PREFERENCES.safetyMin, 0, 10),
      visaMinDays: num(params.get('v'), DEFAULT_PREFERENCES.visaMinDays, 0, 365),
      regions,
      datasetOnly: params.get('d') === '1',
      strictMinimums: params.get('m') === '1',
    },
    weights,
  };
}

function writeState(prefs: MatchPreferences, weights: Record<CriterionKey, number>): Record<string, string> {
  const out: Record<string, string> = {};
  if (prefs.budgetMax !== DEFAULT_PREFERENCES.budgetMax) out.b = String(prefs.budgetMax);
  if (prefs.tempIdeal !== DEFAULT_PREFERENCES.tempIdeal) out.t = String(prefs.tempIdeal);
  if (prefs.internetMin !== DEFAULT_PREFERENCES.internetMin) out.i = String(prefs.internetMin);
  if (prefs.safetyMin !== DEFAULT_PREFERENCES.safetyMin) out.s = String(prefs.safetyMin);
  if (prefs.visaMinDays !== DEFAULT_PREFERENCES.visaMinDays) out.v = String(prefs.visaMinDays);
  if (prefs.regions.length > 0) out.r = prefs.regions.join(',');
  if (prefs.datasetOnly) out.d = '1';
  if (prefs.strictMinimums) out.m = '1';
  if (CRITERIA.some((k) => weights[k] !== DEFAULT_WEIGHTS[k])) out.w = CRITERIA.map((k) => weights[k]).join(',');
  return out;
}

export default function FindYourBase() {
  const t = useT();
  const locale = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = useMemo(() => readState(searchParams), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [prefs, setPrefs] = useState<MatchPreferences>(initial.prefs);
  const [weights, setWeights] = useState<Record<CriterionKey, number>>(initial.weights);
  const [selected, setSelected] = useState<City[]>([]);
  const started = useRef(false);
  const completed = useRef(false);

  const touch = () => {
    if (started.current) return;
    started.current = true;
    trackEvent('base_finder_start', {});
  };

  const updatePrefs = (patch: Partial<MatchPreferences>) => {
    touch();
    setPrefs((p) => ({ ...p, ...patch }));
  };

  const updateWeight = (key: CriterionKey, value: number) => {
    touch();
    setWeights((w) => ({ ...w, [key]: value }));
  };

  // Mirror the form into the URL so the page can be shared and survives a reload.
  useEffect(() => {
    setSearchParams(writeState(prefs, weights), { replace: true });
  }, [prefs, weights, setSearchParams]);

  const outcome = useMemo(() => rankCities(ALL_CITIES, prefs, weights, 12, locale), [prefs, weights, locale]);
  const shares = useMemo(() => normalizeWeights(weights), [weights]);

  const complete = (action: string, city?: City) => {
    if (completed.current) return;
    completed.current = true;
    trackEvent('base_finder_complete', { action, city: city ? citySlug(city) : undefined, top: outcome.results[0] ? citySlug(outcome.results[0].city) : undefined });
  };

  const toggleSelected = (city: City) => {
    setSelected((list) => {
      if (list.some((c) => c.id === city.id)) return list.filter((c) => c.id !== city.id);
      if (list.length >= MAX_COMPARE) return list;
      return [...list, city];
    });
  };

  const reset = () => {
    setPrefs(DEFAULT_PREFERENCES);
    setWeights(DEFAULT_WEIGHTS);
    setSelected([]);
  };

  const isDefault =
    Object.keys(writeState(prefs, weights)).length === 0;

  return (
    <div className="page-content min-h-screen bg-background">
      <PageMeta title={t('tools.fyb.metaTitle')} description={t('tools.fyb.metaDescription')} path="/find-your-base" />

      <main className="dns-container py-10 md:py-14">
        <header className="max-w-2xl">
          <p className="dns-eyebrow">{t('tools.fyb.eyebrow')}</p>
          <h1 className="mt-3 text-4xl md:text-5xl text-foreground">{t('tools.fyb.h1')}</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            {t('tools.fyb.intro', { count: formatNumber(ALL_CITIES.length, locale) })}
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-start">
          {/* Controls */}
          <form
            className="dns-card p-5 lg:sticky lg:top-20"
            onSubmit={(e) => e.preventDefault()}
            aria-label={t('tools.fyb.formAria')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base text-foreground">{t('tools.fyb.needs')}</h2>
              <button
                type="button"
                onClick={reset}
                disabled={isDefault}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw className="h-3.5 w-3.5" /> {t('tools.fyb.reset')}
              </button>
            </div>

            <div className="mt-4 space-y-5">
              <Range
                label={t('tools.fyb.range.budget')}
                value={prefs.budgetMax}
                display={`$${formatNumber(prefs.budgetMax, locale)}`}
                min={500}
                max={6000}
                step={100}
                onChange={(v) => updatePrefs({ budgetMax: v })}
              />
              <Range
                label={t('tools.fyb.range.temp')}
                value={prefs.tempIdeal}
                display={`${plain(prefs.tempIdeal, locale)}°C`}
                min={5}
                max={32}
                step={1}
                onChange={(v) => updatePrefs({ tempIdeal: v })}
              />
              <Range
                label={t('tools.fyb.range.internet')}
                value={prefs.internetMin}
                display={prefs.internetMin === 0 ? t('tools.fyb.any') : `${plain(prefs.internetMin, locale)} Mbps`}
                min={0}
                max={300}
                step={10}
                onChange={(v) => updatePrefs({ internetMin: v })}
              />
              <Range
                label={t('tools.fyb.range.safety')}
                value={prefs.safetyMin}
                display={prefs.safetyMin === 0 ? t('tools.fyb.any') : `${plain(prefs.safetyMin, locale)}/10`}
                min={0}
                max={10}
                step={0.5}
                onChange={(v) => updatePrefs({ safetyMin: v })}
              />
              <Range
                label={t('tools.fyb.range.visa')}
                value={prefs.visaMinDays}
                display={prefs.visaMinDays === 0 ? t('tools.fyb.any') : t.n('data.unit.days', prefs.visaMinDays)}
                min={0}
                max={365}
                step={15}
                onChange={(v) => updatePrefs({ visaMinDays: v })}
              />
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-foreground">{t('tools.fyb.regions')}</legend>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REGIONS.map((region) => {
                  const on = prefs.regions.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        updatePrefs({
                          regions: on ? prefs.regions.filter((r) => r !== region) : [...prefs.regions, region],
                        })
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        on
                          ? 'border-primary/60 bg-primary/15 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.dyn(`data.region.${region}`, region)}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {prefs.regions.length === 0 ? t('tools.fyb.regions.all') : t('tools.fyb.regions.some')}
              </p>
            </fieldset>

            <fieldset className="mt-6 border-t border-border pt-5">
              <legend className="sr-only">{t('tools.fyb.weights.legend')}</legend>
              <h2 className="text-base text-foreground">{t('tools.fyb.weights.title')}</h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {t('tools.fyb.weights.hint')}
              </p>
              <div className="mt-4 space-y-4">
                {CRITERIA.map((key) => (
                  <Range
                    key={key}
                    label={criterionLabel(key, locale)}
                    value={weights[key]}
                    display={`${Math.round(shares[key] * 100)}%`}
                    min={0}
                    max={50}
                    step={5}
                    swatch={CRITERION_COLOR[key]}
                    onChange={(v) => updateWeight(key, v)}
                  />
                ))}
              </div>
            </fieldset>

            <label className="mt-6 flex cursor-pointer items-start gap-3 border-t border-border pt-5">
              <input
                type="checkbox"
                checked={prefs.strictMinimums}
                onChange={(e) => updatePrefs({ strictMinimums: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span className="text-sm text-foreground">
                {t('tools.fyb.strict.label')}
                <span className="block text-xs text-muted-foreground">
                  {t('tools.fyb.strict.hint')}
                </span>
              </span>
            </label>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={prefs.datasetOnly}
                onChange={(e) => updatePrefs({ datasetOnly: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span className="text-sm text-foreground">
                {t('tools.fyb.dataset.label')}
                <span className="block text-xs text-muted-foreground">
                  {t('tools.fyb.dataset.hint')}
                </span>
              </span>
            </label>
          </form>

          {/* Results */}
          <section aria-label={t('tools.fyb.results.aria')} aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {outcome.noWeights
                  ? t('tools.fyb.results.none')
                  : t('tools.fyb.results.top', {
                      shown: outcome.results.length,
                      total: formatNumber(outcome.considered, locale),
                    })}
              </p>
              {selected.length > 0 && (
                <Link
                  to={comparePath(selected)}
                  onClick={() => complete('compare')}
                  className={selected.length >= 2 ? 'dns-btn-primary' : 'dns-btn-secondary pointer-events-none opacity-60'}
                  aria-disabled={selected.length < 2}
                >
                  {t('tools.fyb.compareSelected', { count: selected.length })} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {outcome.noWeights ? (
              <div className="mt-4 dns-card p-6">
                <h2 className="text-lg text-foreground">{t('tools.fyb.noWeights.title')}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('tools.fyb.noWeights.body')}
                </p>
              </div>
            ) : outcome.results.length === 0 ? (
              <div className="mt-4 dns-card p-6">
                <h2 className="text-lg text-foreground">{t('tools.fyb.empty.title')}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {outcome.excludedByMinimums > 0
                    ? t.n('tools.fyb.empty.minimums', outcome.excludedByMinimums, {
                        count: formatNumber(outcome.excludedByMinimums, locale),
                      })
                    : t('tools.fyb.empty.other')}
                </p>
              </div>
            ) : (
              <ol className="mt-4 space-y-3">
                {outcome.results.map((result, i) => (
                  <ResultCard
                    key={result.city.id}
                    rank={i + 1}
                    result={result}
                    checked={selected.some((c) => c.id === result.city.id)}
                    canSelect={selected.length < MAX_COMPARE}
                    onToggle={() => toggleSelected(result.city)}
                    onOpen={() => complete('profile', result.city)}
                  />
                ))}
              </ol>
            )}

            <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
              {rich(t('tools.fyb.disclaimer'), {
                link: (children) => (
                  <Link to="/methodology" className="text-primary hover:underline">
                    {children}
                  </Link>
                ),
              })}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function Range({
  label,
  value,
  display,
  min,
  max,
  step,
  swatch,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  swatch?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          {swatch ? <span className={`h-2 w-2 rounded-full ${swatch}`} aria-hidden="true" /> : null}
          {label}
        </span>
        <span className="dns-num text-sm text-foreground">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-background accent-[hsl(var(--primary))]"
      />
    </label>
  );
}

function ResultCard({
  rank,
  result,
  checked,
  canSelect,
  onToggle,
  onOpen,
}: {
  rank: number;
  result: MatchResult;
  checked: boolean;
  canSelect: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const { city } = result;
  const cityName = cityDisplayName(city, locale);
  const detailsId = `why-${city.id}`;

  return (
    <li className="dns-card p-4 md:p-5">
      <div className="flex items-start gap-4">
        <span className="dns-num mt-1 w-6 shrink-0 text-sm text-muted-foreground">{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="min-w-0 text-lg text-foreground">
              <Link to={cityPath(city)} onClick={onOpen} className="hover:text-primary">
                {cityName}
              </Link>
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {countryName(city.countryCode, city.country, locale)}
              </span>
            </h3>
            <p className="shrink-0">
              <span className="dns-num text-2xl text-foreground">{result.score}</span>
              <span className="text-xs text-muted-foreground"> {t('tools.fyb.card.fit')}</span>
            </p>
          </div>

          {/* Stacked breakdown: each segment is the points one criterion adds. */}
          <div
            className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-background"
            role="img"
            aria-label={result.criteria
              .filter((c) => c.weightShare > 0)
              .map((c) => t.n('tools.fyb.card.barPoints', Math.round(c.points), { label: criterionLabel(c.key, locale) }))
              .join(', ')}
          >
            {result.criteria.map((c) =>
              c.points > 0 ? (
                <span key={c.key} className={`${CRITERION_COLOR[c.key]} h-full`} style={{ width: `${c.points}%` }} />
              ) : null,
            )}
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
            <Stat label={t('tools.fyb.card.cost')} value={t('tools.money.perMonth', { amount: formatNumber(city.costUSD, locale) })} />
            <Stat label={t('data.metric.internet')} value={`${plain(city.internetMbps, locale)} Mbps`} />
            <Stat label={t('data.metric.safety')} value={`${plain(city.safety, locale)}/10`} />
            <Stat label={t('data.metric.avgTemp')} value={`${plain(city.weather.tempAvgC, locale)}°C`} />
          </dl>

          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {result.strongest ? <>{result.strongest.note}. </> : null}
            {result.weakest ? <span className="text-foreground/80">{t('tools.fyb.card.tradeoff', { note: lowerFirst(result.weakest.note) })}</span> : null}
          </p>

          {result.misses.length > 0 && (
            <p className="mt-2 text-xs font-medium text-warning">
              {t('tools.fyb.card.misses', { list: result.misses.map((c) => lowerFirst(c.note)).join('; ') })}
            </p>
          )}

          {result.estimated && (
            <p className="mt-2 text-xs text-warning">{t('tools.fyb.card.estimated')}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t('tools.fyb.card.why')}
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <label className={`inline-flex items-center gap-2 text-sm ${!checked && !canSelect ? 'opacity-50' : 'cursor-pointer'} text-muted-foreground`}>
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && !canSelect}
                onChange={onToggle}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              {t('tools.fyb.card.compare')}
            </label>
          </div>

          {open && (
            <table id={detailsId} className="mt-4 w-full text-left text-sm">
              <caption className="sr-only">{t('tools.fyb.card.caption', { city: cityName })}</caption>
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th scope="col" className="py-1.5 font-medium">{t('tools.fyb.table.criterion')}</th>
                  <th scope="col" className="py-1.5 font-medium">{t('tools.fyb.table.why')}</th>
                  <th scope="col" className="py-1.5 text-right font-medium">{t('tools.fyb.table.fit')}</th>
                  <th scope="col" className="py-1.5 text-right font-medium">{t('tools.fyb.table.points')}</th>
                </tr>
              </thead>
              <tbody>
                {result.criteria.map((c) => (
                  <tr key={c.key} className="border-b border-border/60 align-top last:border-0">
                    <th scope="row" className="py-2 pr-3 font-medium text-foreground">
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${CRITERION_COLOR[c.key]}`} aria-hidden="true" />
                        {criterionLabel(c.key, locale)}
                      </span>
                    </th>
                    <td className="py-2 pr-3 text-muted-foreground">{c.note}</td>
                    <td className="py-2 text-right tabular-nums text-foreground">{Math.round(c.fit * 100)}%</td>
                    <td className="py-2 text-right tabular-nums text-foreground">
                      {c.weightShare === 0 ? '0' : oneDecimal(c.points, locale)}
                      <span className="text-muted-foreground"> / {(c.weightShare * 100).toFixed(0)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </li>
  );
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 sm:block">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
