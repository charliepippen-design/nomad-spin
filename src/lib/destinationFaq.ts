import type { City } from '@/data/cities/types';
import { isApplicationBasedVisa, isStayAllowanceVisa } from '@/lib/visaCopy';
import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from '../i18n/config';
import { localizeCity } from '../i18n/content';
import { getT, type TFunction } from '../i18n/dictionary';
import { formatNumber, monthName } from '../i18n/format';
import { en } from '../locales/en';

export interface OfficialLink {
  phrase: string;
  href: string;
}

export interface DestinationFaqItem {
  q: string;
  /** Plain text. JSON-LD uses this exact string. */
  a: string;
  /** Official government phrases inside `a`. No affiliate URLs. */
  officialLinks: OfficialLink[];
}

/**
 * Every sentence lives in src/locales/<locale>/city.json under "faq.*".
 * The English text below is read from the English file, so there is one source.
 */
const EN_TEXT: Record<string, string> = en.city;

const SPAIN_VISA_URL =
  'https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Digital-Nomad-Visa.aspx';
const PORTUGAL_MNE_URL = 'https://vistos.mne.gov.pt/en/national-visas/general-information/type-of-visa';
const PORTUGAL_AIMA_URL =
  'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-o-exercicio-de-atividade-profissional-prestada-de-forma-remota-com-visto-de-residencia-para-o-exe';
const THAILAND_VISA_URL = 'https://thailand.prd.go.th/en/content/category/detail/id/48/iid/538547';

const MNE_LINK: OfficialLink = { phrase: 'MNE', href: PORTUGAL_MNE_URL };
const AIMA_LINK: OfficialLink = { phrase: 'AIMA', href: PORTUGAL_AIMA_URL };

/** Link phrases that are words, not agency acronyms: English phrase -> dictionary key of its translation. */
const LINK_PHRASE_KEYS: Record<string, string> = {
  [EN_TEXT['faq.visa.rule.ES.link']]: 'city.faq.visa.rule.ES.link',
  [EN_TEXT['faq.visa.TH.link']]: 'city.faq.visa.TH.link',
};

const SOURCE_COUNTRIES = [
  'ID',
  'ZA',
  'CO',
  'AR',
  'MX',
  'GE',
  'HU',
  'MY',
  'EE',
  'CZ',
  'VN',
  'TW',
  'KR',
  'JP',
  'DE',
  'CL',
  'PE',
  'BR',
  'PL',
  'GR',
  'BG',
  'HR',
  'TR',
  'AL',
  'ME',
] as const;

/**
 * Agency names used on the priority pages (English; translations are the
 * "faq.visa.source.<CC>" keys). Other countries use a generic official-pages line.
 */
export const OFFICIAL_VISA_SOURCE: Record<string, string> = Object.fromEntries(
  SOURCE_COUNTRIES.map((code) => [code, EN_TEXT[`faq.visa.source.${code}`]]),
);

/**
 * Visa-free countries: replaces the "check whether remote work is allowed"
 * sentence with the country's official longer-stay fact ("faq.visa.extra.<CC>").
 */
const STAY_EXTRA_COUNTRIES: ReadonlySet<string> = new Set(['TW', 'KR', 'JP', 'CL', 'CO', 'TR']);

interface VisaCopyRule {
  /** Row visa types this copy is written for. Other types use the generic templates. */
  applies: (visaType: string) => boolean;
  /** Placeholders: {days}, {months}, {type}, {source}. */
  text: string;
  officialLinks?: OfficialLink[];
}

function stayRule(code: string, officialLinks?: OfficialLink[]): VisaCopyRule {
  const rule: VisaCopyRule = { applies: isStayAllowanceVisa, text: EN_TEXT[`faq.visa.rule.${code}`] };
  if (officialLinks) rule.officialLinks = officialLinks;
  return rule;
}

/**
 * Per-country Q3 copy the generic templates can't express (officer decides,
 * e-visa for some passports, no nomad visa, Schengen counting). Numbers come from the row.
 * English text; translations are the "faq.visa.rule.<CC>" keys.
 */
export const VISA_FAQ_COPY: Record<string, VisaCopyRule> = {
  DE: stayRule('DE'),
  PL: stayRule('PL'),
  MX: stayRule('MX'),
  BR: stayRule('BR'),
  BG: stayRule('BG'),
  GR: stayRule('GR'),
  HR: stayRule('HR'),
  ES: stayRule('ES', [{ phrase: EN_TEXT['faq.visa.rule.ES.link'], href: SPAIN_VISA_URL }]),
  PT: stayRule('PT', [MNE_LINK, AIMA_LINK]),
  MY: stayRule('MY'),
  AL: stayRule('AL'),
  ME: stayRule('ME'),
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** These patterns read the English dataset text, whatever the language of the answer. */
const WEATHER_WORD =
  /\b(season|winters?|summers?|heat|hot|rain|rains|rainy|monsoon|haze|flood\w*|typhoon|humid\w*|humidity|cold|dark)\b/i;
/** Cons that mention a season but are not about weather ("Limited winter nightlife", "Crowded summers"). */
const NOT_WEATHER = /tourist|nightlife|crowd/i;
const SAFETY_WORD = /safety|crime|pickpocket|scam/i;
const NET_WORD = /wifi|load shedding/i;
const AFFILIATE =
  /\b(ivisa|flatio|booking|safetywing|airalo|skyscanner|impact|affiliate|book now|sign up)\b|cj\.com/i;

const KEEP_CASE =
  /^(?:[A-Z]{2,}(?:\b|[-/])|[A-Z]-|UNESCO\b|WiFi\b|E-residency\b|European\b|Port\b|Turia\b|Barajas\b|Andes\b|Caribbean\b|Adriatic\b|Atlantic\b|Pacific\b|Mediterranean\b)/;

/** What every answer builder needs: the translator, the language, and the city in both forms. */
interface Ctx {
  t: TFunction;
  locale: Locale;
  /** English record: numbers, codes, and the text the patterns above read. */
  city: City;
  /** Same city with its text in `locale` (the same object in English). */
  local: City;
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function joinSentences(parts: string[]): string {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function asciiText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x00-\x7F]/g, '');
}

/** English answers are plain ASCII. Other languages keep their accents and only lose long dashes. */
function clean(value: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? asciiText(value) : value.replace(/[\u2013\u2014]/g, '-');
}

/** Bare digits in English ("1200"), the language's own separators elsewhere. */
function num(value: number, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? String(value) : formatNumber(value, locale);
}

function lc(label: string, locale: Locale): string {
  const trimmed = clean(label, locale).trim();
  if (!trimmed) return trimmed;
  const first = trimmed.split(/[\s/]/)[0] ?? trimmed;
  if (KEEP_CASE.test(trimmed)) return trimmed;
  if (/^[A-Z]{2,}$/.test(first)) return trimmed;
  if (/[A-Z]/.test(first.slice(1))) return trimmed;
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function list(items: string[], t: TFunction): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return t('city.faq.list.two', { a: items[0], b: items[1] });
  return t('city.faq.list.many', { rest: items.slice(0, -1).join(', '), last: items[items.length - 1] });
}

/** Cons picked by a pattern on the English text, returned in the reader's language. */
function consMatching(ctx: Ctx, matches: (englishCon: string) => boolean): string[] {
  const picked: string[] = [];
  ctx.city.cons.forEach((con, index) => {
    if (matches(con)) picked.push(lc(ctx.local.cons[index] ?? con, ctx.locale));
  });
  return picked;
}

function fullMonthName(index: number, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? MONTH_NAMES[index] : monthName(MONTHS[index], locale, 'long');
}

interface MonthRun {
  start: number;
  length: number;
}

/** Collapse month tokens into prose, wrapping December into January. */
export function rangeMonths(months: string[], locale: Locale = DEFAULT_LOCALE): string {
  const t = getT(locale);
  const present = Array<boolean>(12).fill(false);
  for (const month of months) {
    const index = MONTHS.indexOf(month as (typeof MONTHS)[number]);
    if (index >= 0) present[index] = true;
  }
  const count = present.filter(Boolean).length;
  if (count === 0) return '';
  if (count === 12) return t('city.faq.months.all');

  let start = 0;
  for (let i = 0; i < 12; i += 1) {
    if (!present[i] && present[(i + 1) % 12]) {
      start = (i + 1) % 12;
      break;
    }
  }

  const runs: MonthRun[] = [];
  let cursor = start;
  let seen = 0;
  while (seen < 12) {
    if (!present[cursor]) {
      cursor = (cursor + 1) % 12;
      seen += 1;
      continue;
    }
    const runStart = cursor;
    let length = 0;
    while (present[cursor] && length < 12) {
      cursor = (cursor + 1) % 12;
      length += 1;
      seen += 1;
    }
    runs.push({ start: runStart, length });
  }

  const wrapIndex = runs.findIndex((run) => run.length < 12 && (run.start + run.length - 1) % 12 < run.start);
  if (wrapIndex > 0) {
    const wrapped = runs.splice(wrapIndex, 1)[0];
    runs.unshift(wrapped);
  }

  const formatRun = (run: MonthRun): string => {
    const from = fullMonthName(run.start, locale);
    const to = fullMonthName((run.start + run.length - 1) % 12, locale);
    if (run.length === 1) return from;
    if (run.length === 2 && runs.length === 1) return t('city.faq.months.pair', { from, to });
    return t('city.faq.months.range', { from, to });
  };

  return runs.map(formatRun).reduce((a, b) => t('city.faq.months.and', { a, b }));
}

function monthCount(months: string[]): number {
  return new Set(months.filter((month) => MONTHS.includes(month as (typeof MONTHS)[number]))).size;
}

function fit(locale: Locale, required: string[], optional: string[] = [], pads: string[] = []): string {
  let text = joinSentences(required);
  const queued = [...optional];
  for (const extra of queued) {
    if (text.includes(extra.trim())) continue;
    const next = joinSentences([text, extra]);
    if (wordCount(next) <= 50) text = next;
  }
  for (const pad of pads) {
    if (wordCount(text) >= 35) break;
    if (text.includes(pad.trim())) continue;
    const next = joinSentences([text, pad]);
    if (wordCount(next) <= 50) text = next;
  }
  return clean(text, locale);
}

function genericSource(ctx: Ctx): string {
  return ctx.t('city.faq.visa.genericSource', { country: clean(ctx.local.country, ctx.locale) });
}

function officialSource(ctx: Ctx): string {
  const code = ctx.city.countryCode;
  if (!(code in OFFICIAL_VISA_SOURCE)) return genericSource(ctx);
  return ctx.t.dyn(`city.faq.visa.source.${code}`, OFFICIAL_VISA_SOURCE[code]);
}

function localizeLinks(links: OfficialLink[], t: TFunction): OfficialLink[] {
  return links.map((link) => {
    const key = LINK_PHRASE_KEYS[link.phrase];
    return key ? { ...link, phrase: t.dyn(key, link.phrase) } : link;
  });
}

function visaItem(
  text: string,
  ctx: Ctx,
  officialLinks: OfficialLink[] = [],
): { text: string; officialLinks: OfficialLink[] } {
  return { text: clean(text, ctx.locale), officialLinks: localizeLinks(officialLinks, ctx.t) };
}

function clampVisa(text: string, ctx: Ctx, links: OfficialLink[]): { text: string; officialLinks: OfficialLink[] } {
  const { t } = ctx;
  let next = text;
  if (wordCount(next) > 50) {
    next = text.replace(officialSource(ctx), genericSource(ctx));
  }
  if (wordCount(next) > 50) {
    next = next.replace(`${t('city.faq.visa.shortVisits')} `, '');
    next = next.replace(`${t('city.faq.visa.remoteWorkCheck')} `, '');
  }
  if (wordCount(next) < 35) {
    next = joinSentences([next, t('city.faq.visa.rulesChange')]);
  }
  return visaItem(next, ctx, links);
}

/** Visa type inside a sentence: the dataset label in English, its translation elsewhere. */
function visaTypeText(ctx: Ctx): string {
  const type = ctx.city.meta.visaType;
  return ctx.locale === DEFAULT_LOCALE ? asciiText(type) : ctx.t.dyn(`data.visaType.${type}`, type);
}

function visaCopy(ctx: Ctx): { text: string; officialLinks: OfficialLink[] } {
  const { t, city } = ctx;
  if (city.countryCode === 'TH') {
    return visaItem(t('city.faq.visa.TH'), ctx, [
      { phrase: EN_TEXT['faq.visa.TH.link'], href: THAILAND_VISA_URL },
    ]);
  }

  const country = clean(ctx.local.country, ctx.locale);
  const source = officialSource(ctx);
  const days = String(city.meta.visaDays);

  const rule = VISA_FAQ_COPY[city.countryCode];
  if (rule && rule.applies(city.meta.visaType)) {
    const template =
      ctx.locale === DEFAULT_LOCALE ? rule.text : t.dyn(`city.faq.visa.rule.${city.countryCode}`, rule.text);
    const text = template
      .replace('{days}', days)
      .replace('{months}', String(Math.round(city.meta.visaDays / 30.44)))
      .replace('{type}', visaTypeText(ctx))
      .replace('{source}', source);
    return clampVisa(text, ctx, rule.officialLinks ?? []);
  }

  if (city.countryCode === 'VN' && /e-visa/i.test(city.meta.visaType)) {
    return clampVisa(t('city.faq.visa.VN', { days, source }), ctx, []);
  }

  if (isStayAllowanceVisa(city.meta.visaType)) {
    const extra = STAY_EXTRA_COUNTRIES.has(city.countryCode)
      ? t.dyn(`city.faq.visa.extra.${city.countryCode}`)
      : t('city.faq.visa.remoteWorkCheck');
    const key = /on arrival/i.test(city.meta.visaType) ? 'city.faq.visa.stayOnArrival' : 'city.faq.visa.stayVisaFree';
    return clampVisa(t(key, { days, country, extra, source }), ctx, []);
  }

  if (isApplicationBasedVisa(city.meta.visaType)) {
    return clampVisa(
      t('city.faq.visa.application', {
        days,
        type: visaTypeText(ctx),
        shortVisits: t('city.faq.visa.shortVisits'),
        source,
      }),
      ctx,
      [],
    );
  }

  return clampVisa(
    t('city.faq.visa.fallback', { days, type: visaTypeText(ctx), source: genericSource(ctx) }),
    ctx,
    [],
  );
}

function costAnswer(ctx: Ctx): string {
  const { t, city, locale } = ctx;
  const cost = num(city.financials.costNomadSingle, locale);
  const price = num(city.financials.airbnbMedian, locale);
  return fit(locale, [
    city.dataSource === 'estimated' ? t('city.faq.cost.leadEstimates', { cost }) : t('city.faq.cost.leadData', { cost }),
    t('city.faq.cost.longTerm', { cost: num(city.financials.costLongTerm, locale) }),
    city.formulaEstimates?.airbnbMedian ? t('city.faq.cost.airbnbEstimate', { price }) : t('city.faq.cost.airbnb', { price }),
  ]);
}

function coworkingSentence(density: City['infra']['coworkingDensity'], t: TFunction): string {
  switch (density) {
    case 'High':
      return t('city.faq.net.coworkingHigh');
    case 'Med':
      return t('city.faq.net.coworkingMed');
    case 'Low':
      return t('city.faq.net.coworkingLow');
    default: {
      const unexpected: never = density;
      return unexpected;
    }
  }
}

function netVerdict(score: number, t: TFunction): string {
  if (score >= 9) return t('city.faq.net.verdict9');
  if (score >= 8) return t('city.faq.net.verdict8');
  if (score >= 7) return t('city.faq.net.verdict7');
  return t('city.faq.net.verdictLow');
}

function speedSentence(ctx: Ctx): string {
  const { t, city, locale } = ctx;
  const vars = {
    speed: num(city.infra.internetSpeedAvg, locale),
    reliability: num(city.infra.internetReliability, locale),
    power: num(city.infra.powerGridStability, locale),
  };
  const flags = city.formulaEstimates;
  if (flags?.internetReliability) return t('city.faq.net.speedEstReliability', vars);
  if (flags?.powerGridStability) return t('city.faq.net.speedEstPower', vars);
  return t('city.faq.net.speed', vars);
}

function internetAnswer(ctx: Ctx): string {
  const { t, city, locale } = ctx;
  const netCons = consMatching(ctx, (con) => NET_WORD.test(con));
  const consLine = netCons.length ? t('city.faq.net.cons', { items: list(netCons, t) }) : '';
  return fit(
    locale,
    [
      netVerdict(city.infra.internetReliability, t),
      speedSentence(ctx),
      coworkingSentence(city.infra.coworkingDensity, t),
      t('city.faq.net.test'),
    ],
    consLine ? [consLine] : [],
  );
}

function weatherAnswer(ctx: Ctx): string {
  const { t, city, locale } = ctx;
  const best = city.weather.bestMonths;
  const rainy = city.weather.rainyMonths;
  const rainySet = new Set(rainy);
  const overlap = best.filter((month) => rainySet.has(month));
  const bestOnly = best.filter((month) => !rainySet.has(month));
  const temp = num(city.weather.tempAvgC, locale);
  const name = clean(ctx.local.name, locale);
  const weatherCons = consMatching(ctx, (con) => WEATHER_WORD.test(con) && !NOT_WEATHER.test(con));
  const weatherLine = weatherCons.length ? t('city.faq.weather.cons', { items: list(weatherCons, t) }) : '';
  const fill = t('city.faq.weather.fill');

  const bestSentence = () =>
    monthCount(best) === 1
      ? t('city.faq.weather.best_one', { months: rangeMonths(best, locale) })
      : t('city.faq.weather.best_other', { months: rangeMonths(best, locale) });
  const rainyPlanSentence = () =>
    monthCount(rainy) === 1
      ? t('city.faq.weather.rainyPlan_one', { months: rangeMonths(rainy, locale), temp })
      : t('city.faq.weather.rainyPlan_other', { months: rangeMonths(rainy, locale), temp });

  let lead: string;
  if (overlap.length > 0) {
    const safe = rangeMonths(bestOnly, locale);
    const overlapNames = list(
      overlap.map((month) => fullMonthName(MONTHS.indexOf(month as (typeof MONTHS)[number]), locale)),
      t,
    );
    const safeSentence =
      monthCount(bestOnly) === 1
        ? t('city.faq.weather.safest_one', { months: safe })
        : safe
          ? t('city.faq.weather.safest_other', { months: safe })
          : t('city.faq.weather.safestNone');
    lead = joinSentences([
      safeSentence,
      t('city.faq.weather.overlap', { months: overlapNames }),
      t('city.faq.weather.rainyTemp', { months: rangeMonths(rainy, locale), temp }),
    ]);
  } else if (best.length === 0 && rainy.length === 0) {
    lead = t('city.faq.weather.none', { city: name, temp });
  } else if (best.length === 0) {
    lead = `${t('city.faq.weather.noBest', { city: name })} ${rainyPlanSentence()}`;
  } else if (rainy.length === 0) {
    lead = `${bestSentence()} ${t('city.faq.weather.noRainy', { temp })}`;
  } else {
    lead = `${bestSentence()} ${rainyPlanSentence()}`;
  }

  const withWeather = weatherLine && wordCount(joinSentences([lead, weatherLine])) <= 50
    ? joinSentences([lead, weatherLine])
    : lead;
  const withFill =
    wordCount(withWeather) < 38 && wordCount(joinSentences([withWeather, fill])) <= 50
      ? joinSentences([withWeather, fill])
      : withWeather;
  return fit(locale, [withFill], [], [t('city.faq.weather.padAverage'), t('city.faq.weather.padCheck')]);
}

function safeVerdict(score: number, t: TFunction): string {
  if (score >= 8) return t('city.faq.safety.verdict8');
  if (score >= 7) return t('city.faq.safety.verdict7');
  if (score >= 5) return t('city.faq.safety.verdict5');
  return t('city.faq.safety.verdictLow');
}

function safetyAnswer(ctx: Ctx): string {
  const { t, city, locale } = ctx;
  const safetyCons = consMatching(ctx, (con) => SAFETY_WORD.test(con));
  const consLine = safetyCons.length ? t('city.faq.safety.cons', { items: list(safetyCons, t) }) : '';
  return fit(
    locale,
    [
      safeVerdict(city.vibeMetrics.femaleSafety, t),
      t('city.faq.safety.scores', {
        city: clean(ctx.local.name, locale),
        safety: num(city.safety, locale),
        female: num(city.vibeMetrics.femaleSafety, locale),
      }),
      t('city.faq.safety.lgbt', { score: num(city.vibeMetrics.lgbtFriendly, locale) }),
      t('city.faq.safety.precautions'),
    ],
    consLine ? [consLine] : [],
    [t('city.faq.safety.pad')],
  );
}

function closingFact(ctx: Ctx): string {
  const { t, city, locale } = ctx;
  if (city.countryCode === 'TH' && city.meta.visaDays <= 30) {
    return t('city.faq.skip.thaiVisa');
  }
  const lows: string[] = [];
  const metrics: Array<[string, number]> = [
    [t('city.faq.low.femaleSafety', { score: num(city.vibeMetrics.femaleSafety, locale) }), city.vibeMetrics.femaleSafety],
    [t('city.faq.low.english', { score: num(city.vibeMetrics.englishProficiency, locale) }), city.vibeMetrics.englishProficiency],
    [t('city.faq.low.lgbt', { score: num(city.vibeMetrics.lgbtFriendly, locale) }), city.vibeMetrics.lgbtFriendly],
    [t('city.faq.low.internet', { score: num(city.infra.internetReliability, locale) }), city.infra.internetReliability],
    [t('city.faq.low.power', { score: num(city.infra.powerGridStability, locale) }), city.infra.powerGridStability],
  ];
  for (const [fragment, score] of metrics) {
    if (score <= 5) lows.push(fragment);
  }
  if (lows.length > 0) {
    return lowScores(lows, ctx);
  }
  if (city.weather.tempAvgC <= 12) {
    return t('city.faq.skip.temperature', { temp: num(city.weather.tempAvgC, locale) });
  }
  return costLine(ctx);
}

function costLine(ctx: Ctx): string {
  return ctx.t('city.faq.skip.cost', { cost: num(ctx.city.financials.costNomadSingle, ctx.locale) });
}

/** Next low metric (community size, then nightlife) used before the cost line when an answer runs short. */
function secondaryLow(ctx: Ctx): string | null {
  const { t, city, locale } = ctx;
  if (city.vibeMetrics.communitySize <= 5) {
    return t('city.faq.skip.community', { score: num(city.vibeMetrics.communitySize, locale) });
  }
  if (city.vibeMetrics.nightlife <= 5) {
    return t('city.faq.skip.nightlife', { score: num(city.vibeMetrics.nightlife, locale) });
  }
  return null;
}

/**
 * Up to two low scores. In English, labels after the first are lowercased
 * mid-sentence, except proper nouns; other languages write the fragments lowercase already.
 */
function lowScores(lows: string[], ctx: Ctx): string {
  const parts = lows
    .slice(0, 2)
    .map((part, index) =>
      ctx.locale !== DEFAULT_LOCALE || index === 0 || /^(English|LGBTQ)/.test(part)
        ? part
        : part.charAt(0).toLowerCase() + part.slice(1),
    );
  return ctx.t('city.faq.low.inData', { items: list(parts, ctx.t) });
}

/**
 * One listed con. In English, plural noun phrases read as "if X are a dealbreaker"; anything else
 * (adjectives, comparisons, clauses) is quoted after a colon so the grammar holds.
 * Other languages may use the colon form for both keys.
 */
function singleConLine(name: string, con: string, t: TFunction): string {
  const pluralNoun = /[^su]s$/i.test(con) && !/\b(than|varies|is|are)\b/i.test(con) && !/^(less|more|not|very|too)\b/i.test(con);
  return pluralNoun
    ? t('city.faq.skip.singlePlural', { city: name, con })
    : t('city.faq.skip.single', { city: name, con });
}

function skipAnswer(ctx: Ctx): string {
  const { t, locale } = ctx;
  const name = clean(ctx.local.name, locale);
  const cons = ctx.local.cons.slice(0, 3).map((con) => lc(con, locale));
  const pros = ctx.local.pros.slice(0, 3).map((pro) => lc(pro, locale));
  const consText = cons.length ? list(cons, t) : t('city.faq.skip.fallbackCons');
  const prosText = pros.length ? list(pros, t) : t('city.faq.skip.fallbackPros');
  const consLine =
    cons.length === 1
      ? singleConLine(name, cons[0], t)
      : t('city.faq.skip.many', { city: name, cons: consText });
  const lead = [consLine, t('city.faq.skip.strengths', { pros: prosText })];
  const closing = closingFact(ctx);
  let full = fit(locale, lead, [closing], [costLine(ctx)]);
  // When the closing fact is the cost line and the answer is still short, add the next low metric
  // first instead of printing the cost line twice.
  const low = secondaryLow(ctx);
  if (closing === costLine(ctx) && wordCount(full) < 35 && low) {
    full = fit(locale, lead, [low], [costLine(ctx)]);
  }
  if (wordCount(full) >= 35 && wordCount(full) <= 50) return full;
  return fit(locale, [full, t('city.faq.skip.read')], [], [costLine(ctx)]);
}

export function destinationFaq(city: City, locale: Locale = DEFAULT_LOCALE): DestinationFaqItem[] {
  const t = getT(locale);
  const local = localizeCity(city, locale);
  const ctx: Ctx = { t, locale, city, local };
  const name = clean(local.name, locale);
  const country = clean(local.country, locale);
  const visa = visaCopy(ctx);
  const items: Array<{ q: string; a: string; officialLinks?: OfficialLink[] }> = [
    {
      q: t('city.faq.q.cost', { city: name }),
      a: costAnswer(ctx),
    },
    {
      q: t('city.faq.q.internet', { city: name }),
      a: internetAnswer(ctx),
    },
    {
      q: t('city.faq.q.visa', { country }),
      a: visa.text,
      officialLinks: visa.officialLinks,
    },
    {
      q: t('city.faq.q.weather', { city: name }),
      a: weatherAnswer(ctx),
    },
    {
      q: t('city.faq.q.safety', { city: name }),
      a: safetyAnswer(ctx),
    },
    {
      q: t('city.faq.q.skip', { city: name }),
      a: skipAnswer(ctx),
    },
  ];

  return items.map((item) => ({
    q: clean(item.q, locale),
    a: clean(item.a, locale),
    officialLinks: item.officialLinks ?? [],
  }));
}

export function destinationFaqJsonLd(
  city: City,
  pageUrl: string,
  locale: Locale = DEFAULT_LOCALE,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    url: pageUrl,
    inLanguage: LOCALE_INFO[locale].htmlLang,
    mainEntity: destinationFaq(city, locale).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function answerHtml(item: DestinationFaqItem): string {
  let rest = item.a;
  let html = '';
  for (const link of item.officialLinks) {
    const at = rest.indexOf(link.phrase);
    if (at < 0) continue;
    html += esc(rest.slice(0, at));
    html += `<a href="${esc(link.href)}">${esc(link.phrase)}</a>`;
    rest = rest.slice(at + link.phrase.length);
  }
  return html + esc(rest);
}

/** Visible FAQ markup for prerender. Empty when the caller skips sub-area pages. */
export function destinationFaqBodyHtml(items: DestinationFaqItem[], locale: Locale = DEFAULT_LOCALE): string {
  if (items.length === 0) return '';
  const blocks = items.map((item) => `<h3>${esc(item.q)}</h3><p>${answerHtml(item)}</p>`).join('');
  return `<h2>${esc(getT(locale)('city.faq.title'))}</h2>${blocks}`;
}

export function faqHasAffiliate(value: string): boolean {
  return AFFILIATE.test(value);
}
