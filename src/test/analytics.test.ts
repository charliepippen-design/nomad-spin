import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCtaVariant,
  resetCtaVariantForTests,
  trackAffiliateClick,
  trackEvent,
  variantForSession,
} from '@/utils/analytics';

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
const w = window as W;

beforeEach(() => {
  w.dataLayer = [];
  delete w.gtag;
  sessionStorage.clear();
  resetCtaVariantForTests();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('trackEvent without window.gtag (GTM only)', () => {
  it('defines a gtag stand-in that pushes arguments to dataLayer', () => {
    trackEvent('spin_completed', { city_name: 'Lisbon' });
    expect(typeof w.gtag).toBe('function');
    const entry = (w.dataLayer as ArrayLike<unknown>[]).find((e) => e[0] === 'event');
    expect(entry?.[1]).toBe('spin_completed');
    expect((entry?.[2] as Record<string, unknown>).city_name).toBe('Lisbon');
  });

  it('keeps an existing gtag untouched', () => {
    const gtag = vi.fn();
    w.gtag = gtag;
    trackEvent('spin_completed', {});
    expect(gtag).toHaveBeenCalledWith('event', 'spin_completed', expect.any(Object));
  });

  it('never throws when gtag throws or dataLayer is unusable', () => {
    w.gtag = () => {
      throw new Error('blocked');
    };
    expect(() => trackEvent('spin_completed', {})).not.toThrow();
    delete w.gtag;
    Object.defineProperty(w, 'dataLayer', { configurable: true, get: () => { throw new Error('x'); } });
    expect(() => trackAffiliateClick('Booking.com', 'accommodation', 'Lisbon', 'https://x.test', 'l')).not.toThrow();
    Object.defineProperty(w, 'dataLayer', { configurable: true, writable: true, value: [] });
  });
});

describe('trackAffiliateClick', () => {
  it('pushes a plain affiliate_click object with the GTM fields', () => {
    trackAffiliateClick('Booking.com', 'accommodation', 'Bogotá', 'https://www.booking.com/x', 'Find', {
      placement: 'destination_stay',
    });
    const click = (w.dataLayer as Record<string, unknown>[]).find((e) => e.event === 'affiliate_click');
    expect(click).toEqual({
      event: 'affiliate_click',
      partner: 'Booking.com',
      placement: 'destination_stay',
      city_slug: 'bogota',
      cta_variant: getCtaVariant(),
      link_url: 'https://www.booking.com/x',
    });
  });

  it('includes cta_variant in the gtag-style event too', () => {
    trackAffiliateClick('NordVPN', 'vpn', 'Lisbon', 'https://n.test', 'v');
    const entry = (w.dataLayer as ArrayLike<unknown>[]).find((e) => e[0] === 'event' && e[1] === 'affiliate_click');
    expect((entry?.[2] as Record<string, unknown>).cta_variant).toMatch(/^(control|monthly_stays)$/);
  });
});

describe('CTA variant assignment', () => {
  it('is deterministic per session id and covers both arms', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(variantForSession(`sid-${i}`));
    expect(seen).toEqual(new Set(['control', 'monthly_stays']));
    expect(variantForSession('abc')).toBe(variantForSession('abc'));
  });

  it('assigns once per session and announces it once', () => {
    const first = getCtaVariant();
    resetCtaVariantForTests();
    expect(getCtaVariant()).toBe(first);
    getCtaVariant();
    const assigned = (w.dataLayer as Record<string, unknown>[]).filter((e) => e.event === 'cta_variant_assigned');
    expect(assigned).toEqual([{ event: 'cta_variant_assigned', cta_variant: first }]);
    expect(sessionStorage.getItem('nomadspin_cta_variant')).toBe(first);
  });

  it('falls back to control when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(getCtaVariant()).toBe('control');
  });
});
