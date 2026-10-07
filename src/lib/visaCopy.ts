import type { CityMeta } from '@/data/cities/types';

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

export function isApplicationBasedVisa(visaType: string): boolean {
  if (isStayAllowanceVisa(visaType)) return false;
  return APPLICATION_BASED.test(visaType.trim());
}

/**
 * Getting There / prerender sentence.
 * Application visas are a path, not "up to N days for most nationalities."
 */
export function visaPathSentence(meta: Pick<CityMeta, 'visaType' | 'visaDays' | 'visaNote'>): string {
  if (isApplicationBasedVisa(meta.visaType)) {
    const base =
      `Initial ${meta.visaType}: up to ${meta.visaDays} days. ` +
      'Application required; eligibility and renewals vary, verify official sources.';
    return meta.visaNote ? `${base} ${meta.visaNote}` : base;
  }
  if (meta.visaNote) {
    return `${meta.visaType}: up to ${meta.visaDays} days. ${meta.visaNote}`;
  }
  return `Up to ${meta.visaDays} days for most nationalities.`;
}
