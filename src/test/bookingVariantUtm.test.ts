import { describe, it, expect, beforeEach } from 'vitest';
import { buildBookingStayUrl } from '@/utils/affiliateEngine';
import { getCtaVariant, resetCtaVariantForTests } from '@/utils/analytics';

describe('Booking link carries the CTA test group', () => {
  beforeEach(() => { sessionStorage.clear(); resetCtaVariantForTests(); });
  it('adds utm_term=v_<variant> matching the session variant', () => {
    const url = new URL(buildBookingStayUrl({ city: 'Lisbon', country: 'Portugal', campaign: 'city-lisbon' }));
    expect(url.searchParams.get('aid')).toBeTruthy();
    expect(url.searchParams.get('utm_term')).toBe(`v_${getCtaVariant()}`);
  });
});
