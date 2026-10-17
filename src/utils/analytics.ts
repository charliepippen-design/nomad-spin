/**
 * Analytics Infrastructure, Nomad Spin
 *
 * Fires events to Google Analytics 4 (gtag) if available,
 * otherwise logs to console with a distinct emoji prefix.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  VERIFICATION:
 *  1. Open browser console and look for 📊 prefixed logs.
 *  2. If GA4 is wired, check GA4 DebugView for the events below.
 *  3. Every event includes a session_id for funnel analysis.
 * ═══════════════════════════════════════════════════════════════════
 */

import { slugify } from '@/lib/slugify';
import { logger } from '@/lib/logger';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// ── Typed event names ──────────────────────────────────────────────────────

export type AnalyticsEvent =
  | 'spin_completed'
  | 'affiliate_click'
  | 'affiliate_click_error'
  | 'cta_variant_assigned'
  | 'grid_tile_visible';

export type Vertical =
  | 'accommodation'
  | 'flights'
  | 'esim'
  | 'insurance'
  | 'visa'
  | 'vpn'
  | 'extra1'
  | 'extra2';

// ── Session ID ─────────────────────────────────────────────────────────────

const SESSION_KEY = 'nomadspin_session_id';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ── CTA variant (Oct 18 destination stay button test) ──────────────────────

export type CtaVariant = 'control' | 'monthly_stays';

const VARIANT_SESSION_KEY = 'nomadspin_cta_session_id';
const VARIANT_KEY = 'nomadspin_cta_variant';

/** Deterministic 50/50 split of a session ID. */
export function variantForSession(sessionId: string): CtaVariant {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash * 31 + sessionId.charCodeAt(i)) >>> 0;
  }
  return hash % 2 === 0 ? 'control' : 'monthly_stays';
}

let memoryVariant: CtaVariant | null = null;

/**
 * Variant for this browser session. Chosen once from a session ID kept in
 * sessionStorage and announced once per session via a dataLayer push.
 * Never throws; falls back to 'control' when storage is unavailable.
 * The visible button does not change yet: every surface renders control.
 */
export function getCtaVariant(): CtaVariant {
  if (typeof window === 'undefined') return 'control';
  if (memoryVariant) return memoryVariant;
  try {
    const stored = window.sessionStorage.getItem(VARIANT_KEY);
    if (stored === 'control' || stored === 'monthly_stays') {
      memoryVariant = stored;
      return stored;
    }
    let sid = window.sessionStorage.getItem(VARIANT_SESSION_KEY);
    if (!sid) {
      sid = generateId();
      window.sessionStorage.setItem(VARIANT_SESSION_KEY, sid);
    }
    const variant = variantForSession(sid);
    window.sessionStorage.setItem(VARIANT_KEY, variant);
    memoryVariant = variant;
    pushToDataLayer({ event: 'cta_variant_assigned', cta_variant: variant });
    return variant;
  } catch {
    return 'control';
  }
}

/** Test helper: forget the cached variant. */
export function resetCtaVariantForTests(): void {
  memoryVariant = null;
}

// ── Core event dispatcher ──────────────────────────────────────────────────

function pushToDataLayer(entry: Record<string, unknown>): void {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(entry);
  } catch {
    // Never let tracking break the page
  }
}

/**
 * GA4 loads through GTM, so window.gtag is usually absent. Define the standard
 * stand-in (pushes `arguments` to dataLayer) so GTM's GA4 tag can pick up
 * gtag('event', ...) calls.
 */
function ensureGtag(): void {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      // GTM requires the real `arguments` object, not a rest array
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
}

export function trackEvent(eventName: AnalyticsEvent, params: Record<string, unknown>): void {
  const payload = { ...params, session_id: getSessionId() };

  try {
    if (typeof window !== 'undefined') {
      ensureGtag();
      window.gtag!('event', eventName, payload);
    }
  } catch {
    // Fail silently: GA may be blocked by ad-blockers
    logger.debug(`📊 [Analytics] gtag call failed for "${eventName}"`);
  }

  // Console log for dev visibility (no-op in production)
  logger.log(`📊 [Analytics]: ${eventName}`, payload);
}

// ── Pre-defined event helpers ──────────────────────────────────────────────

export function trackSpinCompleted(
  cityName: string,
  countryName: string,
  score: number,
  regionName?: string,
): void {
  trackEvent('spin_completed', {
    city_name: cityName,
    country_name: countryName,
    region_name: regionName ?? '',
    city_slug: slugify(cityName),
    score,
  });
}

export interface AffiliateClickContext {
  /** Placement on the page, e.g. 'destination_stay', 'guide_stay_box'. */
  placement?: string;
  /** Explicit city slug; derived from the city name when omitted. */
  citySlug?: string;
}

/**
 * Fire an affiliate_click. Sends a gtag-style event and also a plain
 * {event: 'affiliate_click', ...} dataLayer object for a GTM custom-event
 * trigger. Never throws and never blocks navigation.
 */
export function trackAffiliateClick(
  partner: string,
  vertical: Vertical,
  targetCity: string,
  outboundUrl: string,
  tileLabel: string,
  context: AffiliateClickContext = {},
): void {
  try {
    const citySlug = context.citySlug ?? (targetCity ? slugify(targetCity) : '');
    const placement = context.placement ?? '';
    const ctaVariant = getCtaVariant();
    trackEvent('affiliate_click', {
      partner,
      vertical,
      city_name: targetCity,
      city_slug: citySlug,
      outbound_url: outboundUrl,
      link_url: outboundUrl,
      tile_label: tileLabel,
      placement,
      cta_variant: ctaVariant,
    });
    if (typeof window !== 'undefined') {
      pushToDataLayer({
        event: 'affiliate_click',
        partner,
        placement,
        city_slug: citySlug,
        cta_variant: ctaVariant,
        link_url: outboundUrl,
      });
    }
  } catch {
    // Tracking must never break a click
  }
}

export function trackAffiliateClickError(
  partner: string,
  vertical: Vertical,
  targetCity: string,
  attemptedUrl: string,
  error: string,
): void {
  trackEvent('affiliate_click_error', {
    partner,
    vertical,
    city_name: targetCity,
    attempted_url: attemptedUrl,
    error,
  });
}
