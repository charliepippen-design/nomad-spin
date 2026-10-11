import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { guides, type Guide } from '@/data/guides';
import { guideBodyHtml, guidePageTitle, guideTitleTag, SHORT_TITLE_MAX } from '@/lib/guideHtml';
import { guideFaqEntries, guideFaqJsonLd } from '@/lib/guideFaq';
import { destinationPageJsonLd } from '@/lib/destinationPrerender';
import { allCitySlugs } from '@/lib/citySlug';

const base: Guide = {
  id: 'x',
  slug: 'living-in-x',
  title: 'The Ultimate Guide to Living in X',
  seoTitle: 'Living in X: The Digital Nomad Definitive Guide for Remote Workers',
  excerpt: 'X for remote workers.',
  date: '2026-10-01',
  readTime: '1 min read',
  content: '',
};

function visibleText(html: string): string {
  return html
    .replace(/<\/(?:p|h[1-6]|li|td|th|div|main|article)>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ');
}

describe('guide short title', () => {
  it('appends the suffix once and never doubles it', () => {
    expect(guidePageTitle('Living in X')).toBe('Living in X | Nomad Spin');
    expect(guidePageTitle('Living in X | Nomad Spin')).toBe('Living in X | Nomad Spin');
    expect(guideTitleTag({ ...base, shortTitle: 'Living in X 2026: Cost, Visa, Areas' })).toBe(
      'Living in X 2026: Cost, Visa, Areas | Nomad Spin',
    );
    expect(guideTitleTag({ ...base, shortTitle: 'Living in X 2026: Cost, Visa | Nomad Spin' })).toBe(
      'Living in X 2026: Cost, Visa | Nomad Spin',
    );
    expect(guideTitleTag({ ...base, seoTitle: 'Living in X | Nomad Spin' })).toBe('Living in X | Nomad Spin');
  });

  it('uses the field as the full tag when the suffix would push it over 60', () => {
    const long = 'Living in Xanadu 2026: Cost, Visa and the Best Areas';
    expect(`${long} | Nomad Spin`.length).toBeGreaterThan(SHORT_TITLE_MAX);
    expect(guideTitleTag({ ...base, shortTitle: long })).toBe(long);
  });

  it('falls back to seoTitle, then title, with the suffix', () => {
    expect(guideTitleTag(base)).toBe(`${base.seoTitle} | Nomad Spin`);
    expect(guideTitleTag({ ...base, seoTitle: undefined })).toBe(`${base.title} | Nomad Spin`);
  });

  it('keeps every guide with a short title at 60 chars or less, with the long H1', () => {
    for (const guide of guides.filter((g) => g.shortTitle)) {
      const tag = guideTitleTag(guide);
      expect(tag.length, `${guide.slug}: "${tag}"`).toBeLessThanOrEqual(SHORT_TITLE_MAX);
      expect(tag.endsWith(' | Nomad Spin | Nomad Spin'), guide.slug).toBe(false);
      expect(guideBodyHtml(guide)).toContain(`<h1>${guide.title}</h1>`);
    }
  });
});

describe('guide FAQPage', () => {
  const qa = [
    '## Is X worth it?',
    '',
    '**How much does X cost?** Nomad Spin lists about **$900** a month. See the [X row](/destinations/x) and `costUSD`.',
    '',
    "**Is X internet good for calls?** Yes, it's fine & stable.",
    '',
    '**Where should I stay in X?** Book through [Booking.com](https://www.booking.com/index.html?aid=123).',
    '',
    '**What about flats?** Try [Flatio](https://www.flatio.com/searches/x?partner=abc).',
    '',
    'Plain paragraph with a question? Not bold, so not a Q&A.',
  ].join('\n');

  it('builds one valid FAQPage from the visible Q&As, matching visible text', () => {
    const guide = { ...base, content: qa };
    const ld = guideFaqJsonLd(guide);
    expect(ld).not.toBeNull();
    const parsed = JSON.parse(JSON.stringify(ld));
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity.map((q: { name: string }) => q.name)).toEqual([
      'How much does X cost?',
      'Is X internet good for calls?',
    ]);
    expect(parsed.mainEntity[0].acceptedAnswer.text).toBe(
      'Nomad Spin lists about $900 a month. See the X row and costUSD.',
    );
    expect(parsed.mainEntity[1].acceptedAnswer.text).toBe("Yes, it's fine & stable.");
    const text = visibleText(guideBodyHtml(guide));
    for (const q of parsed.mainEntity) {
      expect(text).toContain(q.name);
      expect(text).toContain(q.acceptedAnswer.text);
    }
  });

  it('skips Q&As whose answer carries an affiliate or partner link', () => {
    const entries = guideFaqEntries(qa);
    expect(entries.some((e) => /Booking|Flatio/.test(e.answer))).toBe(false);
    const onlyAffiliate = [
      '**Where to stay?** Use [Booking](https://www.booking.com/?aid=1).',
      '',
      '**Where to rent?** Use [this link](https://example.com/x?aid=9).',
      '',
      '**Is it safe?** Yes.',
    ].join('\n');
    expect(guideFaqEntries(onlyAffiliate).map((e) => e.question)).toEqual(['Is it safe?']);
    expect(guideFaqJsonLd({ content: onlyAffiliate })).toBeNull();
  });

  it('needs at least 2 Q&As', () => {
    expect(guideFaqJsonLd({ content: '**One question?** One answer.' })).toBeNull();
    expect(guideFaqJsonLd({ content: 'No questions here.' })).toBeNull();
  });

  it('is present on a live guide with Q&As and matches its page text', () => {
    const madrid = guides.find((g) => g.slug === 'living-in-madrid')!;
    const ld = guideFaqJsonLd(madrid)!;
    expect(ld).not.toBeNull();
    expect(ld.mainEntity.length).toBeGreaterThanOrEqual(2);
    const text = visibleText(guideBodyHtml(madrid));
    for (const q of ld.mainEntity) {
      expect(text).toContain(q.name);
      expect(text).toContain(q.acceptedAnswer.text);
    }
  });

  it('never yields more than one FAQPage on a guide page, and leaves destination pages as they were', () => {
    for (const guide of guides) {
      const ld = guideFaqJsonLd(guide);
      const blocks = [ld].filter(Boolean);
      expect(blocks.length).toBeLessThanOrEqual(1);
      if (ld) expect(new Set(ld.mainEntity.map((q) => q.name)).size).toBe(ld.mainEntity.length);
    }
    for (const { city, slug } of allCitySlugs()) {
      const items = [destinationPageJsonLd(city, `https://www.digitalnomadspin.com/destinations/${slug}`, slug)].flat();
      const faqs = items.filter((item) => (item as { '@type'?: string })['@type'] === 'FAQPage');
      expect(faqs.length, slug).toBeLessThanOrEqual(1);
    }
  });

  it('wires FAQPage into the guide prerender and the article page only', () => {
    const generator = fs.readFileSync(path.resolve(__dirname, '../../scripts/generate-seo-pages.ts'), 'utf8');
    expect(generator.match(/guideFaqJsonLd\(/g)?.length).toBe(1);
    const page = fs.readFileSync(path.resolve(__dirname, '../pages/GuideArticle.tsx'), 'utf8');
    expect(page.match(/guideFaqJsonLd\(/g)?.length).toBe(1);
    const destinationPage = fs.readFileSync(path.resolve(__dirname, '../pages/DestinationGuide.tsx'), 'utf8');
    expect(destinationPage).not.toContain('guideFaqJsonLd');
  });
});

describe('week of Oct 12 guide updates', () => {
  const cases: [string, string, string[]][] = [
    ['living-in-lisbon', 'Living in Lisbon 2026: Cost, D8 Visa and Areas | Nomad Spin', ['/guides/living-in-porto', '/guides/living-in-prague', '/guides/living-in-valencia', '/guides/living-in-tbilisi']],
    ['living-in-chiang-mai', 'Living in Chiang Mai 2026: Cost, Visa, Nimman | Nomad Spin', ['/guides/living-in-ho-chi-minh-city']],
    ['living-in-mexico-city', 'Living in Mexico City 2026: Cost, Visa, Roma | Nomad Spin', ['/guides/living-in-medellin']],
  ];
  it.each(cases)('%s has its short title, 6 FAQ entries and the new body links', (slug, title, hrefs) => {
    const guide = guides.find((g) => g.slug === slug)!;
    expect(guideTitleTag(guide)).toBe(title);
    expect(guideFaqJsonLd(guide)!.mainEntity).toHaveLength(6);
    for (const href of hrefs) expect(guide.content).toContain(`](${href})`);
  });
});

describe('guide FAQPage: both Q&A formats', () => {
  function expectMatchesPage(slug: string, count: number) {
    const guide = guides.find((g) => g.slug === slug)!;
    const ld = guideFaqJsonLd(guide)!;
    expect(ld, slug).not.toBeNull();
    expect(ld.mainEntity).toHaveLength(count);
    const text = visibleText(guideBodyHtml(guide));
    for (const q of ld.mainEntity) {
      expect(q.name.endsWith('?')).toBe(true);
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(20);
      expect(text).toContain(q.name);
      expect(text).toContain(q.acceptedAnswer.text);
    }
    return ld;
  }

  it('parses the heading format (### Question, then answer paragraph) on Porto', () => {
    expect(guides.find((g) => g.slug === 'living-in-porto')!.content).toMatch(/^### .+\?$/m);
    const ld = expectMatchesPage('living-in-porto', 5);
    expect(ld.mainEntity[0].name).toBe('How much does it cost to live in Porto as a digital nomad?');
    expect(ld.mainEntity[0].acceptedAnswer.text).toMatch(/^Nomad Spin lists about \$1,800 a month solo/);
    // The H2 section title is not a Q&A.
    expect(ld.mainEntity.some((q) => q.name.startsWith('Is living in Porto worth it'))).toBe(false);
  });

  it('parses the paragraph format (**Question?** answer) on Budapest', () => {
    expect(guides.find((g) => g.slug === 'living-in-budapest')!.content).toMatch(/^\*\*.+\?\*\* /m);
    const ld = expectMatchesPage('living-in-budapest', 5);
    expect(ld.mainEntity[0].name).toBe('How much does it cost to live in Budapest as a digital nomad?');
  });

  it('handles heading answers of several paragraphs, H4 questions and mixed formats in page order', () => {
    const content = [
      '## Is this a section title?',
      '',
      'Intro paragraph.',
      '',
      '### First question?',
      '',
      'First paragraph.',
      '',
      'Second paragraph.',
      '',
      '- a list ends the answer',
      '',
      '**Second question?** Paragraph answer.',
      '',
      '#### Third question?',
      '',
      'Third answer with a [link](/guides/living-in-porto).',
    ].join('\n');
    expect(guideFaqEntries(content)).toEqual([
      { question: 'First question?', answer: 'First paragraph. Second paragraph.' },
      { question: 'Second question?', answer: 'Paragraph answer.' },
      { question: 'Third question?', answer: 'Third answer with a link.' },
    ]);
  });

  it('never emits an empty FAQPage', () => {
    const noAnswers = ['### Question one?', '', '### Question two?', '', '## Next section'].join('\n');
    expect(guideFaqEntries(noAnswers)).toEqual([]);
    expect(guideFaqJsonLd({ content: noAnswers })).toBeNull();
    const oneValid = ['### Only one?', '', 'Yes.', '', '### Empty?', '', '## End'].join('\n');
    expect(guideFaqJsonLd({ content: oneValid })).toBeNull();
    for (const guide of guides) {
      const ld = guideFaqJsonLd(guide);
      if (!ld) continue;
      expect(ld.mainEntity.length, guide.slug).toBeGreaterThanOrEqual(2);
      for (const q of ld.mainEntity) {
        expect(q.name.trim(), guide.slug).not.toBe('');
        expect(q.acceptedAnswer.text.trim(), guide.slug).not.toBe('');
      }
    }
  });
});
