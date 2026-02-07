/**
 * Analytics Infrastructure — Nomad Spin
 * 
 * Fires events to Google Analytics (gtag) if available,
 * otherwise logs to console with a distinct emoji prefix.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  } else {
    console.log(`📊 [Analytics]: ${eventName}`, params);
  }
}

// ── Pre-defined event helpers ──────────────────────────────

export function trackSpinCompleted(city: string, country: string, score: number): void {
  trackEvent('spin_completed', { city, country, score });
}

export function trackAffiliateClick(
  partner: string,
  vertical: string,
  targetCity: string,
): void {
  trackEvent('affiliate_click', { partner, vertical, target_city: targetCity });
}
