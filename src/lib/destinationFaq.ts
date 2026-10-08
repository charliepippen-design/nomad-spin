import type { City } from '@/data/cities/types';
import { isApplicationBasedVisa, isStayAllowanceVisa } from '@/lib/visaCopy';

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

const SPAIN_VISA_URL =
  'https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Digital-Nomad-Visa.aspx';
const PORTUGAL_MNE_URL = 'https://vistos.mne.gov.pt/en/national-visas/general-information/type-of-visa';
const PORTUGAL_AIMA_URL =
  'https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-o-exercicio-de-atividade-profissional-prestada-de-forma-remota-com-visto-de-residencia-para-o-exe';
const THAILAND_VISA_URL = 'https://thailand.prd.go.th/en/content/category/detail/id/48/iid/538547';

const MNE_LINK: OfficialLink = { phrase: 'MNE', href: PORTUGAL_MNE_URL };
const AIMA_LINK: OfficialLink = { phrase: 'AIMA', href: PORTUGAL_AIMA_URL };

/** Agency names used on the 20 priority pages. Other countries use a generic official-pages line. */
export const OFFICIAL_VISA_SOURCE: Record<string, string> = {
  ID: 'the Indonesian Directorate General of Immigration',
  ZA: 'the South African Department of Home Affairs',
  CO: 'Migracion Colombia or the Colombian Foreign Ministry',
  AR: "Argentina's National Directorate of Migration",
  MX: "Mexico's National Migration Institute or Foreign Ministry",
  GE: 'the Georgian Ministry of Foreign Affairs',
  HU: "Hungary's National Directorate-General for Aliens Policing",
  MY: 'MDEC and the Immigration Department of Malaysia',
  EE: 'the Estonian Police and Border Guard Board',
  CZ: 'the Czech Ministry of the Interior',
  VN: "Vietnam's official government e-visa portal",
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

const WEATHER_WORD =
  /\b(season|winters?|summers?|heat|hot|rain|rains|rainy|monsoon|haze|flood\w*|typhoon|humid\w*|humidity|cold|dark)\b/i;
const SAFETY_WORD = /safety|crime|pickpocket|scam/i;
const NET_WORD = /wifi|load shedding/i;
const AFFILIATE =
  /\b(ivisa|flatio|booking|safetywing|airalo|skyscanner|impact|affiliate|book now|sign up)\b|cj\.com/i;

const KEEP_CASE =
  /^(?:[A-Z]{2,}(?:\b|[-/])|UNESCO\b|WiFi\b|E-residency\b|European\b|Port\b|Turia\b|Barajas\b)/;

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

function lc(label: string): string {
  const trimmed = asciiText(label).trim();
  if (!trimmed) return trimmed;
  const first = trimmed.split(/[\s/]/)[0] ?? trimmed;
  if (KEEP_CASE.test(trimmed)) return trimmed;
  if (/^[A-Z]{2,}$/.test(first)) return trimmed;
  if (/[A-Z]/.test(first.slice(1))) return trimmed;
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function list(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

interface MonthRun {
  start: number;
  length: number;
}

/** Collapse month tokens into prose, wrapping December into January. */
export function rangeMonths(months: string[]): string {
  const present = Array<boolean>(12).fill(false);
  for (const month of months) {
    const index = MONTHS.indexOf(month as (typeof MONTHS)[number]);
    if (index >= 0) present[index] = true;
  }
  const count = present.filter(Boolean).length;
  if (count === 0) return '';
  if (count === 12) return 'January to December';

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
    const from = MONTH_NAMES[run.start];
    const to = MONTH_NAMES[(run.start + run.length - 1) % 12];
    if (run.length === 1) return from;
    if (run.length === 2 && runs.length === 1) return `${from} and ${to}`;
    return `${from} to ${to}`;
  };

  return runs.map(formatRun).join(' and ');
}

function monthCount(months: string[]): number {
  return new Set(months.filter((month) => MONTHS.includes(month as (typeof MONTHS)[number]))).size;
}

function fit(required: string[], optional: string[] = [], pads: string[] = []): string {
  let text = joinSentences(required);
  const queued = [...optional];
  for (const extra of queued) {
    const next = joinSentences([text, extra]);
    if (wordCount(next) <= 50) text = next;
  }
  for (const pad of pads) {
    if (wordCount(text) >= 35) break;
    const next = joinSentences([text, pad]);
    if (wordCount(next) <= 50) text = next;
  }
  return asciiText(text);
}

function officialSource(city: City): string {
  return OFFICIAL_VISA_SOURCE[city.countryCode] ?? `official ${asciiText(city.country)} government pages`;
}

function shortenSource(source: string, country: string): string {
  const generic = `official ${asciiText(country)} government pages`;
  return source === generic ? source : generic;
}

function visaItem(text: string, officialLinks: OfficialLink[] = []): { text: string; officialLinks: OfficialLink[] } {
  return { text: asciiText(text), officialLinks };
}

function spainPortugalVisa(city: City): { text: string; officialLinks: OfficialLink[] } | null {
  const nomad = /digital nomad/i.test(city.meta.visaType);
  if (!nomad) return null;

  if (city.countryCode === 'ES') {
    return visaItem(
      "Up to 1 year on the initial visa, which is the 365 days Nomad Spin lists. Spain's in-country telework residence permit can run up to 3 years, renewable for 2 (Ley 14/2013). Verify the income rule and fees on official Spanish government pages.",
      [{ phrase: 'official Spanish government pages', href: SPAIN_VISA_URL }],
    );
  }

  if (city.countryCode !== 'PT') return null;

  if (/d7/i.test(city.meta.visaType)) {
    return visaItem(
      'Up to 365 days on the initial D7/Digital Nomad Visa, per Nomad Spin\'s data. D7 is a separate passive-income visa, so do not treat that label as the remote-work route. Verify current requirements on official MNE and AIMA pages.',
      [MNE_LINK, AIMA_LINK],
    );
  }

  const ending =
    city.id === 'lisbon-pt'
      ? 'Verify thresholds and fees on official MNE and AIMA pages.'
      : 'As in Lisbon, verify thresholds and fees on MNE and AIMA pages.';
  return visaItem(
    `Up to 1 year on the initial visa, which is the 365 days Nomad Spin lists. Portugal's temporary-stay visa covers under a year; the D8 residency visa leads to a 2-year residence permit, renewable for 3 (Lei 23/2007). ${ending}`,
    [MNE_LINK, AIMA_LINK],
  );
}

function clampVisa(text: string, city: City, links: OfficialLink[]): { text: string; officialLinks: OfficialLink[] } {
  let next = text;
  if (wordCount(next) > 50) {
    const shorter = shortenSource(officialSource(city), city.country);
    next = text.replace(officialSource(city), shorter);
  }
  if (wordCount(next) > 50) {
    next = next.replace('Short visits without it follow normal entry rules. ', '');
    next = next.replace('Check whether remote work is allowed on that entry. ', '');
  }
  if (wordCount(next) < 35) {
    next = joinSentences([next, 'Rules change, so read the official page again before you travel.']);
  }
  return visaItem(next, links);
}

function visaCopy(city: City): { text: string; officialLinks: OfficialLink[] } {
  const special = spainPortugalVisa(city);
  if (special) return special;

  if (city.countryCode === 'TH') {
    return visaItem(
      "Usually 30 days, depending on your passport. Nomad Spin lists Thailand's Tourism Visa Exemption at 30 days for 60 countries and territories (effective 15 Sep 2026); a few get 15 days or visa on arrival. For longer stays, look at the Destination Thailand Visa. Verify on official Thai government pages.",
      [{ phrase: 'official Thai government pages', href: THAILAND_VISA_URL }],
    );
  }

  const country = asciiText(city.country);
  const source = officialSource(city);

  if (city.countryCode === 'VN' && /e-visa/i.test(city.meta.visaType)) {
    return clampVisa(
      `Up to ${city.meta.visaDays} days on Vietnam's E-Visa, per Nomad Spin's data. It is an application-based visa, so apply before you travel and check the length printed on the visa you are granted. Verify current eligibility and validity on Vietnam's official government e-visa portal before you book.`,
      city,
      [],
    );
  }

  if (isStayAllowanceVisa(city.meta.visaType)) {
    const kind = /on arrival/i.test(city.meta.visaType) ? 'a visa on arrival' : 'visa-free entry';
    return clampVisa(
      `Up to ${city.meta.visaDays} days for many passports. Nomad Spin lists ${kind} for ${country}; eligibility and length depend on your nationality. Check whether remote work is allowed on that entry. Verify current rules with ${source} before you book.`,
      city,
      [],
    );
  }

  if (isApplicationBasedVisa(city.meta.visaType)) {
    return clampVisa(
      `Up to ${city.meta.visaDays} days on the initial ${asciiText(city.meta.visaType)}, per Nomad Spin's data. It is an application-based route, so eligibility, income rules and renewals vary by applicant. Short visits without it follow normal entry rules. Verify current requirements with ${source} before you apply.`,
      city,
      [],
    );
  }

  const fallbackSource = `official ${country} government pages`;
  return clampVisa(
    `Up to ${city.meta.visaDays} days on the ${asciiText(city.meta.visaType)}, per Nomad Spin's data. Eligibility depends on your passport. Verify current rules on ${fallbackSource}.`,
    city,
    [],
  );
}

function costAnswer(city: City): string {
  const nameBasis = city.dataSource === 'estimated' ? "Nomad Spin's estimates" : "Nomad Spin's data";
  const airbnb = city.formulaEstimates?.airbnbMedian
    ? `The median Airbnb estimate is $${city.financials.airbnbMedian} a night`
    : `The median Airbnb is $${city.financials.airbnbMedian} a night`;
  return fit([
    `About $${city.financials.costNomadSingle} a month for a solo nomad, based on ${nameBasis}.`,
    `For longer stays, our long-term monthly estimate is $${city.financials.costLongTerm}.`,
    `${airbnb}, which matters most if you book short stays instead of a monthly rental.`,
  ]);
}

function coworkingPhrase(density: City['infra']['coworkingDensity']): string {
  switch (density) {
    case 'High':
      return 'High, so backup desks are easy to find.';
    case 'Med':
      return 'Medium, so shortlist a coworking space early.';
    case 'Low':
      return 'Low, so do not count on a coworking fallback.';
    default: {
      const unexpected: never = density;
      return unexpected;
    }
  }
}

function netVerdict(score: number): string {
  if (score >= 9) return 'Yes.';
  if (score >= 8) return 'Yes, for most calls.';
  if (score >= 7) return 'Usually, but keep a backup.';
  return 'Not reliably, so plan a backup.';
}

function reliabilityClause(city: City): string {
  const reliability = city.infra.internetReliability;
  const power = city.infra.powerGridStability;
  const flags = city.formulaEstimates;
  if (flags?.internetReliability && flags.powerGridStability) {
    return `with estimated reliability ${reliability}/10 and power grid stability ${power}/10.`;
  }
  if (flags?.internetReliability) {
    return `with estimated reliability ${reliability}/10 and power grid stability ${power}/10.`;
  }
  if (flags?.powerGridStability) {
    return `with reliability ${reliability}/10 and estimated power grid stability ${power}/10.`;
  }
  return `with reliability ${reliability}/10 and power grid stability ${power}/10.`;
}

function internetAnswer(city: City): string {
  const netCons = city.cons.filter((con) => NET_WORD.test(con)).map(lc);
  const consLine = netCons.length ? `Our trade-offs also flag ${list(netCons)}.` : '';
  return fit(
    [
      netVerdict(city.infra.internetReliability),
      `Nomad Spin lists average speeds around ${city.infra.internetSpeedAvg} Mbps ${reliabilityClause(city)}`,
      `Coworking density is ${coworkingPhrase(city.infra.coworkingDensity)}`,
      "Test your own apartment's connection before a long stay.",
    ],
    consLine ? [consLine] : [],
  );
}

function weatherAnswer(city: City): string {
  const best = city.weather.bestMonths;
  const rainy = city.weather.rainyMonths;
  const rainySet = new Set(rainy);
  const overlap = best.filter((month) => rainySet.has(month));
  const bestOnly = best.filter((month) => !rainySet.has(month));
  const temp = `and the average temperature is about ${city.weather.tempAvgC} C.`;
  const weatherCons = city.cons.filter((con) => WEATHER_WORD.test(con) && !/tourist/i.test(con)).map(lc);
  const weatherLine = weatherCons.length ? `Weather trade-offs we list: ${list(weatherCons)}.` : '';
  const fill = 'Other months carry no weather flag in our data.';

  let lead: string;
  if (overlap.length > 0) {
    const safe = rangeMonths(bestOnly);
    const overlapNames = list(overlap.map((month) => MONTH_NAMES[MONTHS.indexOf(month as (typeof MONTHS)[number])]));
    const rainyNames = rangeMonths(rainy);
    const safeClause =
      monthCount(bestOnly) === 1
        ? `${safe} is the safest pick.`
        : safe
          ? `${safe} are the safest picks.`
          : 'No month is only a best month.';
    lead = joinSentences([
      safeClause,
      `Nomad Spin lists ${overlapNames} as both a best and a rainy month, so expect some wet days.`,
      `The rainy months are ${rainyNames}, ${temp}`,
    ]);
  } else if (best.length === 0 && rainy.length === 0) {
    lead = `Nomad Spin does not list best months or rainy months for ${asciiText(city.name)}. The average temperature is about ${city.weather.tempAvgC} C.`;
  } else if (best.length === 0) {
    const rainyClause =
      monthCount(rainy) === 1
        ? `The rainy month to plan around is ${rangeMonths(rainy)}`
        : `The rainy months to plan around are ${rangeMonths(rainy)}`;
    lead = `Nomad Spin does not list best months for ${asciiText(city.name)}. ${rainyClause}, ${temp}`;
  } else if (rainy.length === 0) {
    const bestClause =
      monthCount(best) === 1
        ? `${rangeMonths(best)} is the best month in Nomad Spin's data.`
        : `${rangeMonths(best)} are the best months in Nomad Spin's data.`;
    lead = `${bestClause} No rainy months are listed, ${temp}`;
  } else {
    const bestClause =
      monthCount(best) === 1
        ? `${rangeMonths(best)} is the best month in Nomad Spin's data.`
        : `${rangeMonths(best)} are the best months in Nomad Spin's data.`;
    const rainyClause =
      monthCount(rainy) === 1
        ? `The rainy month to plan around is ${rangeMonths(rainy)}`
        : `The rainy months to plan around are ${rangeMonths(rainy)}`;
    lead = `${bestClause} ${rainyClause}, ${temp}`;
  }

  const withWeather = weatherLine && wordCount(joinSentences([lead, weatherLine])) <= 50
    ? joinSentences([lead, weatherLine])
    : lead;
  const withFill =
    wordCount(withWeather) < 38 && wordCount(joinSentences([withWeather, fill])) <= 50
      ? joinSentences([withWeather, fill])
      : withWeather;
  return fit(
    [withFill],
    [],
    ['Use that average as a year-round hint only.', 'Check the month lists on this page before you book a long stay.'],
  );
}

function safeVerdict(score: number): string {
  if (score >= 8) return 'Yes, by our scores.';
  if (score >= 7) return 'Mostly, with normal precautions.';
  if (score >= 5) return 'It can be, but take extra care.';
  return 'Take extra care.';
}

function safetyAnswer(city: City): string {
  const name = asciiText(city.name);
  const safetyCons = city.cons.filter((con) => SAFETY_WORD.test(con)).map(lc);
  const consLine = safetyCons.length ? `Listed trade-offs: ${list(safetyCons)}.` : '';
  return fit(
    [
      safeVerdict(city.vibeMetrics.femaleSafety),
      `${name} scores ${city.safety}/10 for overall safety and ${city.vibeMetrics.femaleSafety}/10 for female safety in Nomad Spin's data.`,
      `LGBTQ+ friendliness scores ${city.vibeMetrics.lgbtFriendly}/10.`,
      'Use normal city precautions and check recent local advice for the area you book.',
    ],
    consLine ? [consLine] : [],
    ['Check a recent local advisory before you book.'],
  );
}

function closingFact(city: City): string {
  if (city.countryCode === 'TH' && city.meta.visaDays <= 30) {
    return 'Visa stays are short on the tourism exemption.';
  }
  const lows: string[] = [];
  const metrics: Array<[string, number]> = [
    ['Female safety', city.vibeMetrics.femaleSafety],
    ['English proficiency', city.vibeMetrics.englishProficiency],
    ['LGBTQ+ friendliness', city.vibeMetrics.lgbtFriendly],
    ['Internet reliability', city.infra.internetReliability],
    ['Power grid stability', city.infra.powerGridStability],
  ];
  for (const [label, score] of metrics) {
    if (score <= 5) lows.push(`${label} scores ${score}/10`);
  }
  if (lows.length > 0) {
    return `${list(lows.slice(0, 2))} in our data.`;
  }
  if (city.weather.tempAvgC <= 12) {
    return `The average temperature is about ${city.weather.tempAvgC} C.`;
  }
  return `Expect about $${city.financials.costNomadSingle} a month in our data.`;
}

function skipAnswer(city: City): string {
  const name = asciiText(city.name);
  const cons = city.cons.slice(0, 3).map(lc);
  const pros = city.pros.slice(0, 3).map(lc);
  const consText = cons.length ? list(cons) : 'the listed trade-offs';
  const prosText = pros.length ? list(pros) : 'the listed strengths';
  const full = fit(
    [
      `Skip ${name} if these listed trade-offs are dealbreakers: ${consText}.`,
      `Its listed strengths are ${prosText}.`,
    ],
    [closingFact(city)],
    [`Expect about $${city.financials.costNomadSingle} a month in our data.`],
  );
  if (wordCount(full) >= 35 && wordCount(full) <= 50) return full;
  return fit(
    [full, 'Read the trade-offs on this page before you book.'],
    [],
    [`Expect about $${city.financials.costNomadSingle} a month in our data.`],
  );
}

export function destinationFaq(city: City): DestinationFaqItem[] {
  const name = asciiText(city.name);
  const country = asciiText(city.country);
  const visa = visaCopy(city);
  const items: Array<{ q: string; a: string; officialLinks?: OfficialLink[] }> = [
    {
      q: `How much does it cost to live in ${name} as a digital nomad?`,
      a: costAnswer(city),
    },
    {
      q: `Is the internet in ${name} good enough for video calls?`,
      a: internetAnswer(city),
    },
    {
      q: `How long can I stay in ${country} as a digital nomad?`,
      a: visa.text,
      officialLinks: visa.officialLinks,
    },
    {
      q: `When is the best time to live in ${name}?`,
      a: weatherAnswer(city),
    },
    {
      q: `Is ${name} safe for solo female travelers?`,
      a: safetyAnswer(city),
    },
    {
      q: `Who should skip ${name} as a nomad base?`,
      a: skipAnswer(city),
    },
  ];

  return items.map((item) => ({
    q: asciiText(item.q),
    a: asciiText(item.a),
    officialLinks: item.officialLinks ?? [],
  }));
}

export function destinationFaqJsonLd(city: City, pageUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    url: pageUrl,
    inLanguage: 'en',
    mainEntity: destinationFaq(city).map((item) => ({
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
export function destinationFaqBodyHtml(items: DestinationFaqItem[]): string {
  if (items.length === 0) return '';
  const blocks = items.map((item) => `<h3>${esc(item.q)}</h3><p>${answerHtml(item)}</p>`).join('');
  return `<h2>Quick answers</h2>${blocks}`;
}

export function faqHasAffiliate(value: string): boolean {
  return AFFILIATE.test(value);
}
