/**
 * Analytics Infrastructure — Nomad Spin
 *
 * Fires events to Google Analytics 4 (gtag) if available,
 * otherwise logs to console with a distinct emoji prefix.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  VERIFICATION:
 *  1. Open browser console — look for 📊 prefixed logs.
 *  2. If GA4 is wired, check GA4 DebugView for the events below.
 *  3. Every event includes a session_id for funnel analysis.
 * ═══════════════════════════════════════════════════════════════════
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ── Typed event names ──────────────────────────────────────────────────────

export type AnalyticsEvent =
  | 'spin_completed'
  | 'affiliate_click'
  | 'affiliate_click_error'
  | 'grid_tile_visible';

export type Vertical =
  | 'accommodation'
  | 'flights'
  | 'esim'
  | 'insurance'
  | 'visa'
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

// ── Core event dispatcher ──────────────────────────────────────────────────

export function trackEvent(eventName: AnalyticsEvent, params: Record<string, unknown>): void {
  const payload = { ...params, session_id: getSessionId() };

  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, payload);
    }
  } catch {
    // Fail silently — GA may be blocked by ad-blockers
    console.debug(`📊 [Analytics] gtag call failed for "${eventName}"`);
  }

  // Log to console in dev only
  if (import.meta.env.DEV) {
    console.log(`📊 [Analytics]: ${eventName}`, payload);
  }
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
    city_slug: cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    score,
  });
}

export function trackAffiliateClick(
  partner: string,
  vertical: Vertical,
  targetCity: string,
  outboundUrl: string,
  tileLabel: string,
): void {
  trackEvent('affiliate_click', {
    partner,
    vertical,
    city_name: targetCity,
    outbound_url: outboundUrl,
    tile_label: tileLabel,
  });
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
