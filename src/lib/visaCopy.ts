import type { CityMeta } from '@/data/cities/types';
import { DEFAULT_LOCALE, type Locale } from '../i18n/config';
import { getT } from '../i18n/dictionary';

/** Visa type as shown to the reader: the dataset label in English, its translation elsewhere. */
export function visaTypeLabel(visaType: string, locale: Locale = DEFAULT_LOCALE): string {
  return locale === DEFAULT_LOCALE ? visaType : getT(locale).dyn(`data.visaType.${visaType}`, visaType);
}

const STAY_ALLOWANCE =
  /^(visa exemption|tourism visa exemption|visa free|visa-free|visa on arrival)$/i;

/**
 * Application-based categories from the Spain/Portugal accuracy note.
 * Stay-allowance types keep the "most nationalities" line.
 */
const APPLICATION_BASED =
  /digital nomad visa|freelance visa|^talent passport|^startup visa|\bdaft\b|^permit b|red-white-red card|eu blue card|self-employment|^professional(?: visa)?|^temporary(?: visa| residence| resident)?/i;

export function isStayAllowanceVisa(visaType: string): boolean {
  return STAY_ALLOWANCE.test(visaType.trim());
}

/**
 * Guard for a Spain or Portugal row labeled with the nomad visa: its day count
 * would be the maximum initial visa, not a visa-free stay. Both countries now
 * show the Schengen exemption (nomad route in the note), so no row matches today.
 */
export function isMaxInitialNomadVisa(countryCode: string, visaType: string): boolean {
  if (countryCode !== 'ES' && countryCode !== 'PT') return false;
  return /digital nomad/i.test(visaType);
}

export function visaChipValue(
  countryCode: string,
  visaType: string,
  visaDays: number,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const t = getT(locale);
  if (isMaxInitialNomadVisa(countryCode, visaType)) {
    return t('city.visa.daysMaxInitial', { days: visaDays });
  }
  return t('city.visa.days', { days: visaDays });
}

export function isApplicationBasedVisa(visaType: string): boolean {
  if (isStayAllowanceVisa(visaType)) return false;
  return APPLICATION_BASED.test(visaType.trim());
}

/**
 * Getting There / prerender sentence.
 * Application visas are a path, not "up to N days for most nationalities."
 * Pass the localized city's meta so the note is in the reader's language.
 */
export function visaPathSentence(
  meta: Pick<CityMeta, 'visaType' | 'visaDays' | 'visaNote'>,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const t = getT(locale);
  const type = visaTypeLabel(meta.visaType, locale);
  if (isApplicationBasedVisa(meta.visaType)) {
    const base = t('city.visa.pathApplication', { type, days: meta.visaDays });
    return meta.visaNote ? `${base} ${meta.visaNote}` : base;
  }
  if (meta.visaNote) {
    return t('city.visa.pathWithNote', { type, days: meta.visaDays, note: meta.visaNote });
  }
  return t('city.visa.pathDefault', { days: meta.visaDays });
}
