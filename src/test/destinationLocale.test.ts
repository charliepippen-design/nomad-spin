import { createElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeAll, describe, expect, it } from 'vitest';
import DestinationGuide from '@/pages/DestinationGuide';
import { isCityTranslated } from '@/i18n/content';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { allCitySlugs, findCityBySlug } from '@/lib/citySlug';
import { destinationFaq, rangeMonths } from '@/lib/destinationFaq';
import { destinationBodyHtml, destinationPageJsonLd } from '@/lib/destinationPrerender';
import { destinationIntro, destinationMetaDescription, destinationPageTitle } from '@/lib/destinationSeo';
import { destinationBreadcrumbJsonLd } from '@/lib/cityNeighbors';
import { listSubAreaDestinations, subAreaParentNoticeHtml } from '@/lib/subAreaDestinations';
import { visaChipValue, visaPathSentence } from '@/lib/visaCopy';
import { loadLocale } from '@/i18n/dictionary';
import { absoluteUrl } from '@/i18n/paths';

/** English template text that must not survive on an Italian city page. */
const ENGLISH_LEFTOVERS = [
  'Monthly cost',
  'Is the internet',
  'What is',
  'Internet speed',
  'How much does it cost',
  'How long can I stay',
  'Digital Nomad Guide',
  'for digital nomads',
  'Nomad Spin lists',
  'in our data',
  'Quick answers',
  'Key stats',
  '<h2>Why go</h2>',
  '<h2>Trade-offs</h2>',
  '<h2>Field guide</h2>',
  'Nearby cities',
  'Other cities in',
  'Dataset last updated',
  'How the data is built',
  'for most nationalities',
  'Find your next base',
];

function PathProbe() {
  return createElement('span', { 'data-testid': 'path' }, useLocation().pathname);
}

/** The city route in both languages, inside the same providers the app uses. */
function renderAt(path: string) {
  const page = createElement(DestinationGuide);
  return render(
    createElement(
      HelmetProvider,
      null,
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(
          LocaleProvider,
          null,
          createElement(PathProbe),
          createElement(
            Routes,
            null,
            createElement(Route, { path: '/destinations/:citySlug', element: page }),
            createElement(Route, { path: '/it/destinazioni/:citySlug', element: page }),
          ),
        ),
      ),
    ),
  );
}

function city(slug: string) {
  const found = findCityBySlug(slug);
  if (!found) throw new Error(`missing ${slug}`);
  return found.city;
}

function expectNoEnglish(text: string) {
  for (const phrase of ENGLISH_LEFTOVERS) expect(text, phrase).not.toContain(phrase);
}

describe('destination page in Italian', () => {
  beforeAll(async () => {
    await loadLocale('it');
  });

  const lisbon = city('lisbon');

  it('translates the title and meta description', () => {
    const title = destinationPageTitle(lisbon, 'it');
    expect(title).toContain('guida per nomadi digitali | Nomad Spin');
    expect(title).toContain('Portogallo');
    expectNoEnglish(title);

    const description = destinationMetaDescription(lisbon, 'it');
    expect(description).toContain('per nomadi digitali');
    expect(description).toContain('/mese');
    expect(description).toContain('sicurezza');
    expect(description.length).toBeLessThanOrEqual(160);
    expectNoEnglish(description);
  });

  it('translates the intro, with months and labels in Italian', () => {
    const intro = destinationIntro(lisbon, 'it');
    expect(intro).toContain('una base per nomadi digitali (Europa)');
    expect(intro).toContain('Visto: ');
    expect(intro).toMatch(/\b(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\b/);
    expect(intro).not.toMatch(/\b(Jan|May|Jun|Jul|Aug|Sep|Oct|Dec)\b/);
    expectNoEnglish(intro);
  });

  it('translates the six quick answers', () => {
    const items = destinationFaq(lisbon, 'it');
    expect(items).toHaveLength(6);
    expect(items[0].q).toMatch(/^Quanto costa vivere a /);
    expect(items[0].a).toContain('al mese');
    expect(items[2].q).toBe('Portogallo: quanto tempo posso restare da nomade digitale?');
    expect(items[3].a).toContain('mesi migliori');
    expect(items[5].q).toMatch(/^Chi dovrebbe evitare /);
    for (const item of items) {
      expectNoEnglish(item.q);
      expectNoEnglish(item.a);
      expect(item.a).not.toMatch(/\{\w+\}/);
      // Linked phrases must exist in the translated answer, or the link is lost.
      for (const link of item.officialLinks) expect(item.a).toContain(link.phrase);
    }
    expect(items[2].officialLinks.map((link) => link.phrase)).toEqual(['MNE', 'AIMA']);
  });

  it('keeps official link phrases inside the translated visa answers', () => {
    for (const slug of ['madrid', 'bangkok']) {
      const visa = destinationFaq(city(slug), 'it')[2];
      expect(visa.officialLinks.length, slug).toBeGreaterThan(0);
      for (const link of visa.officialLinks) expect(visa.a, slug).toContain(link.phrase);
      expectNoEnglish(visa.a);
    }
  });

  it('writes month ranges in Italian', () => {
    expect(rangeMonths(['Nov', 'Dec', 'Jan', 'Feb'], 'it')).toBe('novembre-febbraio');
    expect(rangeMonths(['Jun', 'Jul'], 'it')).toBe('giugno e luglio');
    expect(rangeMonths(['Apr', 'May', 'Jun', 'Sep', 'Oct'], 'it')).toBe('aprile-giugno e settembre-ottobre');
  });

  it('translates the visa chip and sentence', () => {
    expect(visaChipValue('PT', 'Visa Exemption', 90, 'it')).toBe('90 giorni');
    expect(visaPathSentence({ visaType: 'Visa Exemption', visaDays: 90, visaNote: '' }, 'it')).toBe(
      'Fino a 90 giorni per la maggior parte delle nazionalità.',
    );
    expect(visaPathSentence({ visaType: 'Digital Nomad Visa', visaDays: 365, visaNote: '' }, 'it')).toContain(
      'Visto per nomadi digitali (primo rilascio): fino a 365 giorni.',
    );
  });

  it('translates the prerendered body and localizes its links', () => {
    const html = destinationBodyHtml(lisbon, 'lisbon', 'it');
    for (const phrase of [
      '<h2>Dati chiave per nomadi digitali</h2>',
      '<strong>Costo della vita (una persona / mese):</strong>',
      '<strong>Visto:</strong>',
      '<h2>Risposte rapide</h2>',
      '<h2>Città vicine</h2>',
      'Ultimo aggiornamento dei dati',
      'href="/it/destinazioni"',
      'href="/it/metodologia"',
    ]) {
      expect(html, phrase).toContain(phrase);
    }
    expectNoEnglish(html);
    expect(html).not.toMatch(/\{\w+\}/);
    expect(html).not.toMatch(/<\/?(link|living|spin|compare|base|guides)>/);
  });

  it('localizes JSON-LD names and breadcrumb URLs', () => {
    const url = absoluteUrl('/destinations/lisbon', 'it');
    const ld = JSON.stringify(destinationPageJsonLd(lisbon, url, 'lisbon', 'it'));
    expect(ld).toContain('"inLanguage":"it"');
    expect(ld).toContain('Costo mensile (USD)');
    expect(ld).not.toContain('Monthly cost (USD)');

    const crumbs = destinationBreadcrumbJsonLd(lisbon, url, 'it') as {
      itemListElement: { name: string; item: string }[];
    };
    expect(crumbs.itemListElement.map((row) => row.item)).toEqual([
      'https://www.digitalnomadspin.com/it',
      'https://www.digitalnomadspin.com/it/destinazioni',
      url,
    ]);
    expect(crumbs.itemListElement[1].name).toBe('Destinazioni');
  });

  it('translates the sub-area notice', () => {
    const row = listSubAreaDestinations().find((entry) => entry.parent);
    expect(row).toBeTruthy();
    const html = subAreaParentNoticeHtml(row!, 'it');
    expect(html).toContain("Fa parte dell'area di ");
    expect(html).not.toContain('Part of the');
    expect(html).toMatch(/<a href="[^"]+">guida completa di /);
  });

  it('renders a translated city in Italian with an Italian canonical', async () => {
    renderAt('/it/destinazioni/lisbon');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Lisbona'));
    expect(screen.getByText('Risposte rapide')).toBeTruthy();
    expect(screen.getByText('Dove alloggiare')).toBeTruthy();
    expect(screen.queryByText('Quick answers')).toBeNull();
    await waitFor(() =>
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        'https://www.digitalnomadspin.com/it/destinazioni/lisbon',
      ),
    );
    expect(document.title).toContain('guida per nomadi digitali');
  });

  it('sends an untranslated city to its English page, once', async () => {
    const untranslated = allCitySlugs().find((row) => !isCityTranslated(row.city.id, 'it'));
    if (!untranslated) return; // every city is translated: nothing to redirect
    renderAt(`/it/destinazioni/${untranslated.slug}`);
    await waitFor(() => expect(screen.getByTestId('path').textContent).toBe(`/destinations/${untranslated.slug}`));
    await waitFor(() => expect(screen.getByText('Quick answers')).toBeTruthy());
    expect(screen.getByTestId('path').textContent).toBe(`/destinations/${untranslated.slug}`);
  });

  it('leaves English exactly as it was when no language is passed', () => {
    expect(destinationPageTitle(lisbon)).toBe('Lisbon, Portugal: Digital Nomad Guide | Nomad Spin');
    expect(destinationPageTitle(lisbon, 'en')).toBe(destinationPageTitle(lisbon));
    expect(destinationBodyHtml(lisbon, 'lisbon', 'en')).toBe(destinationBodyHtml(lisbon, 'lisbon'));
    expect(destinationFaq(lisbon)[0].q).toBe('How much does it cost to live in Lisbon as a digital nomad?');
  });
});
