/**
 * Cookie consent. The inline script in index.html sets Google Consent Mode to
 * "denied" and defines window.__nomadspinLoadTracking, which loads Google Tag
 * Manager (GA4) and the Impact tag. Nothing loads until the visitor accepts.
 */

export type ConsentChoice = 'granted' | 'denied';

export const CONSENT_KEY = 'nomadspin_consent';
/** Fired on window to reopen the banner (footer "Cookie settings"). */
export const CONSENT_OPEN_EVENT = 'nomadspin:open-consent';

declare global {
  interface Window {
    __nomadspinLoadTracking?: () => void;
  }
}

export function getConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/**
 * Store the choice. Accepting loads the tags now. Declining after an earlier
 * yes cannot unload scripts already on the page, so the caller reloads.
 */
export function setConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
  if (choice === 'granted') window.__nomadspinLoadTracking?.();
}

export function openConsentBanner(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
