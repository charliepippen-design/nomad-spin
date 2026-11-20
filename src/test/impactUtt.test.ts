import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
const loaderStart = head.indexOf('w.__nomadspinLoadTracking = function');
const loaderEnd = head.indexOf("w.localStorage.getItem('nomadspin_consent')");

describe('Tracking tags wait for consent', () => {
  it('keeps the Impact tag and GTM installed exactly once', () => {
    expect(head.match(/utt\.impactcdn\.com\/P-A7924825-40d9-43b7-ae9a-ca7878e3bf9c1\.js/g)).toHaveLength(1);
    expect(head).toContain("impactStat('transformLinks')");
    expect(head).toContain("impactStat('trackImpression')");
    expect(head.match(/googletagmanager\.com\/gtm\.js/g)).toHaveLength(1);
    expect(head).toContain("'GTM-NDK7J5HR'");
  });

  it('loads both only inside the consent loader', () => {
    expect(loaderStart).toBeGreaterThan(-1);
    expect(loaderEnd).toBeGreaterThan(loaderStart);
    for (const needle of ['utt.impactcdn.com', 'googletagmanager.com']) {
      const at = html.indexOf(needle);
      expect(at).toBeGreaterThan(html.indexOf('<head>') + loaderStart);
      expect(at).toBeLessThan(html.indexOf('<head>') + loaderEnd);
      expect(html.indexOf(needle, at + 1)).toBe(-1);
    }
  });

  it('sets Consent Mode v2 to denied before anything loads', () => {
    const defaults = head.indexOf("gtag('consent', 'default'");
    expect(defaults).toBeGreaterThan(-1);
    expect(defaults).toBeLessThan(loaderStart);
    for (const key of ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']) {
      expect(head.slice(defaults, loaderStart)).toContain(`${key}: 'denied'`);
    }
  });
});
