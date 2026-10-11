import { readFileSync } from 'node:fs';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DestinationGuide from '@/pages/DestinationGuide';
import { buildVpnUrl, generateAffiliateLinks, isPartnerLive } from '@/utils/affiliateEngine';

const BASE = 'https://nordvpn.sjv.io/c/1/2/3';
const DISCLOSURE = 'Affiliate link: Nomad Spin may earn a commission at no extra cost to you.';

afterEach(() => {
  vi.unstubAllEnvs();
});

function renderDestination(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/destinations/${slug}`]}>
        <Routes>
          <Route path="/destinations/:citySlug" element={<DestinationGuide />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

function nordLinks(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href*="nordvpn"]'));
}

function jsonLdMentionsNord(): boolean {
  const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  return ld.some((s) => (s.textContent ?? '').toLowerCase().includes('nordvpn'));
}

describe('buildVpnUrl', () => {
  it('returns a clean deep link when no tracking URL is set', () => {
    vi.stubEnv('VITE_NORDVPN_TRACKING_URL', '');
    const link = buildVpnUrl('Chiang Mai');
    expect(link.url.startsWith('https://nordvpn.com/')).toBe(true);
    expect(link.url).toContain('utm_content=vpn');
    expect(link.affiliate).toBe(false);
    expect(link.partner).toBe('NordVPN');
    expect(link.url).not.toContain('TODO_');
    expect(link.url).not.toContain('u=');
    expect(isPartnerLive('nordvpn')).toBe(false);
  });

  it('wraps the deep link in the Impact tracking URL when set', () => {
    vi.stubEnv('VITE_NORDVPN_TRACKING_URL', BASE);
    const link = buildVpnUrl('Chiang Mai');
    expect(link.url.startsWith(BASE)).toBe(true);
    const u = new URL(link.url).searchParams.get('u');
    expect(new URL(u ?? '').hostname).toBe('nordvpn.com');
    expect(link.affiliate).toBe(true);
    expect(isPartnerLive('nordvpn')).toBe(true);
  });

  it('is exposed through generateAffiliateLinks', () => {
    const links = generateAffiliateLinks({ name: 'Chiang Mai', country: 'Thailand', countryCode: 'TH' });
    expect(links.vpn).toBeDefined();
    expect(links.vpn.vertical).toBe('vpn');
    expect(links.vpn.label).toBe('Secure your Wi-Fi with NordVPN');
  });
});

describe('NordVPN slot on the destination page', () => {
  it('renders one clean link in the coworking section only, with no disclosure', () => {
    vi.stubEnv('VITE_NORDVPN_TRACKING_URL', '');
    const { container } = renderDestination('chiang-mai');
    const links = nordLinks(container);
    expect(links).toHaveLength(1);
    expect(container.querySelector('#coworking')?.contains(links[0])).toBe(true);
    expect(container.querySelector('#faq')?.contains(links[0]) ?? false).toBe(false);
    expect(links[0].getAttribute('rel')).not.toContain('sponsored');
    expect(container.textContent).not.toContain(DISCLOSURE);
    expect(jsonLdMentionsNord()).toBe(false);
  });

  it('marks the link sponsored and shows the disclosure when live', () => {
    vi.stubEnv('VITE_NORDVPN_TRACKING_URL', BASE);
    const { container } = renderDestination('chiang-mai');
    const links = nordLinks(container);
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('rel')).toContain('sponsored');
    expect(container.querySelector('#coworking')?.textContent).toContain(DISCLOSURE);
    expect(jsonLdMentionsNord()).toBe(false);
  });
});

describe('source hygiene', () => {
  it('has no placeholder IDs and no dashes in touched files', () => {
    const dashes = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
    expect(readFileSync('src/utils/affiliateEngine.ts', 'utf8')).not.toContain('TODO_');
    for (const f of [
      'src/utils/affiliateEngine.ts',
      'src/vite-env.d.ts',
      '.env.example',
      'src/pages/DestinationGuide.tsx',
      'src/test/nordvpnSlot.test.tsx',
    ]) {
      expect(dashes.test(readFileSync(f, 'utf8')), f).toBe(false);
    }
  });
});
