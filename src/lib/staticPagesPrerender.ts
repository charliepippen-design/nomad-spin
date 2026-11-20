import { cities } from '@/data/cities';
import { DATASET_UPDATED_LABEL } from '@/data/datasetMeta';
import { BELOW_MINIMUM_CAP, CRITERIA, CRITERION_LABEL, DEFAULT_WEIGHTS } from '@/lib/matching';

/**
 * Crawlable HTML for the pages that have no data-driven prerender of their own.
 * scripts/generate-seo-pages.ts writes one HTML file per entry, with its own
 * title, description, canonical, H1 and text, so the raw HTML (no JavaScript)
 * is not the home page. React replaces the body on mount.
 *
 * Title, description and H1 must match the React page. src/test/staticPagesPrerender.test.tsx
 * renders each page and fails when they drift.
 */
export interface StaticPagePrerender {
  /** Path without the leading slash, e.g. "compare". */
  route: string;
  title: string;
  description: string;
  h1: string;
  /** Inner HTML placed after the H1. Trusted, hand-written markup. */
  body: string;
}

const n = (value: number) => value.toLocaleString('en-US');
const A = 'style="color:#55E6B0"';

function methodologyBody(): string {
  const total = cities.length;
  const estimated = cities.filter((c) => c.dataSource === 'estimated').length;
  const formula = (key: 'costLongTerm' | 'airbnbMedian' | 'internetReliability' | 'powerGridStability') =>
    cities.filter((c) => c.formulaEstimates?.[key]).length;
  const weightTotal = CRITERIA.reduce((sum, key) => sum + DEFAULT_WEIGHTS[key], 0);
  const weights = CRITERIA.map(
    (key) => `<li>${CRITERION_LABEL[key]}: ${Math.round((DEFAULT_WEIGHTS[key] / weightTotal) * 100)}%</li>`,
  ).join('');
  const cap = Math.round(BELOW_MINIMUM_CAP * 100);
  return `
  <p>You are deciding where to live. You should know how solid each figure is before you lean on it.</p>
  <p>${n(total)} cities in the dataset: ${n(total - estimated)} editorial records and ${n(estimated)} estimated records.</p>
  <h2>Three kinds of figure</h2>
  <p>No figure on this site is a live measurement.</p>
  <ul>
    <li><strong>Editorial records.</strong> ${n(total - estimated)} cities form the original set. Their figures were entered by the Nomad Spin editor. They carry no source link and no check date, so we call them editorial, not verified.</li>
    <li><strong>Estimated records.</strong> ${n(estimated)} of ${n(total)} city records were produced with AI assistance and have not been checked by hand. They are marked as estimates wherever they appear.</li>
    <li><strong>Formula values.</strong> When a record has no figure of its own for a field, we work one out from another field with a fixed rule, and tag it.</li>
  </ul>
  <h2>What "monthly cost" means</h2>
  <p>Monthly cost is our estimate of what one person spends in a month in that city: rent, food, local transport and everyday costs. It leaves out flights, insurance and visa fees. In a spot check of 10 cities in November 2026, our figures were 35% to 67% lower than the ones on nomads.com. Read our number as a lean budget, and compare it with a second source before you commit.</p>
  <h2>The formulas</h2>
  <ul>
    <li>Long-stay monthly cost: monthly cost × 0.75 (${n(formula('costLongTerm'))} cities).</li>
    <li>Median nightly stay: monthly cost ÷ 22 (${n(formula('airbnbMedian'))} cities).</li>
    <li>Connection reliability, from speed: 150+ Mbps = 9, 100+ = 8, 60+ = 7, 30+ = 5, below = 4 (${n(formula('internetReliability'))} cities).</li>
    <li>Power grid stability, from region: Europe, North America, Oceania = 9, Asia = 7, elsewhere = 6 (${n(formula('powerGridStability'))} cities).</li>
  </ul>
  <h2>What we do not have yet</h2>
  <p>Records do not store where a number came from or when it was checked. City pages show one date for the whole dataset, last changed on ${DATASET_UPDATED_LABEL}. Missing figures show "No data". We do not fill gaps with a guess.</p>
  <h2>How Compare works</h2>
  <p>A row names a leader only when one city is strictly best on a measure with a clear direction. Visa rows never have a leader. There is no overall winner. <a href="/compare" ${A}>Open Compare</a>.</p>
  <h2>How Find Your Base scores a city</h2>
  <p>Each criterion becomes a fit between 0% and 100%. The score is the weighted average of those fits. A city below one of your minimums earns at most ${cap}% of that criterion and is flagged. Starting weights:</p>
  <ul>${weights}</ul>
  <p>The scoring code reads only the city figures and your settings: booking and partner links have no input into any score or ranking. <a href="/find-your-base" ${A}>Open Find Your Base</a>.</p>
  <h2>Visas, tax and safety</h2>
  <p>Visa routes and stay lengths describe the common case and change often. Tax notes are general information, not advice. Check the official government source for your passport.</p>
  <p>Found a wrong number? <a href="/contact" ${A}>Contact us</a>.</p>`;
}

export function staticPagesPrerender(): StaticPagePrerender[] {
  return [
    {
      route: 'compare',
      title: 'Compare Cities for Remote Work | Nomad Spin',
      description:
        'Put two to four cities side by side: monthly cost, internet, safety, visa length, climate and community. Share the comparison with one link.',
      h1: 'Side by side, on what matters.',
      body: `
  <p>Pick two to four cities. Each row shows who leads and where the data runs out. There is no overall winner, because the right city depends on what you weigh.</p>
  <p>Rows cover monthly cost, long-stay cost, internet speed and reliability, safety, visa route and stay length, climate and community. A missing figure shows "No data". Estimates and formula values are tagged.</p>
  <p>Examples: <a href="/compare?cities=lisbon,porto" ${A}>Lisbon and Porto</a>, <a href="/compare?cities=chiang-mai,bangkok" ${A}>Chiang Mai and Bangkok</a>.</p>
  <p><a href="/destinations" ${A}>Browse all ${n(cities.length)} cities</a> · <a href="/find-your-base" ${A}>Find your base</a> · <a href="/methodology" ${A}>How the data is built</a></p>`,
    },
    {
      route: 'find-your-base',
      title: 'Find Your Base: Match Cities to Your Life | Nomad Spin',
      description:
        'Set your budget, climate, internet and safety needs, weight what matters, and see which cities fit. Every score is explained.',
      h1: 'Tell us what matters. See what fits.',
      body: `
  <p>${n(cities.length)} cities, ranked against your needs. Set a monthly budget, a preferred temperature, a minimum internet speed, a minimum safety score and the stay length you want. Then weight each one.</p>
  <p>Every score is explained line by line under "Why this score". A city that is over your budget or below a minimum is flagged, and you can hide those cities with one switch.</p>
  <p><a href="/compare" ${A}>Compare cities</a> · <a href="/destinations" ${A}>Browse destinations</a> · <a href="/methodology" ${A}>How scores are worked out</a></p>`,
    },
    {
      route: 'methodology',
      title: 'Methodology and Data Sources | Nomad Spin',
      description:
        'How Nomad Spin city figures are built: which numbers are stored, which are formulas, which records are estimates, and how comparison and matching scores work.',
      h1: 'What our numbers are, and what they are not.',
      body: methodologyBody(),
    },
    {
      route: 'about',
      title: 'About | Nomad Spin',
      description:
        'Learn about Nomad Spin, a travel discovery tool helping digital nomads find their next base with data-driven city recommendations.',
      h1: 'About Nomad Spin',
      body: `
  <p>Nomad Spin is a travel discovery tool built for digital nomads, remote workers, and long-term travelers. We help you cut through decision paralysis and find your next destination based on what actually matters: cost of living, internet speed, safety, and vibe.</p>
  <p>Our database covers 780+ cities worldwide with figures on budgets, internet, safety, visa rules, coworking density, and more. Some of those records are estimates, and every page says which. Each city is scored against your own preferences.</p>
  <ul>
    <li><strong>Discovery First.</strong> We prioritize serendipity. Spin the globe and let the data surprise you.</li>
    <li><strong>Numbers, not ads.</strong> Scores and rankings use the city figures and your preferences. Partner links have no input.</li>
    <li><strong>Honest about gaps.</strong> Estimates are tagged, missing figures say "No data", and the methodology page lists what we do not know yet.</li>
  </ul>
  <p><a href="/methodology" ${A}>How our data is built</a> · <a href="/contact" ${A}>Get in touch</a> · <a href="/destinations" ${A}>Destinations</a> · <a href="/guides" ${A}>Guides</a></p>`,
    },
    {
      route: 'contact',
      title: 'Contact | Nomad Spin',
      description: 'Get in touch with the Nomad Spin team. Share feedback, suggest a city, or ask a question.',
      h1: 'Contact',
      body: `
  <p>Share feedback, suggest a city, or tell us about a wrong number. The contact form on this page needs JavaScript to send.</p>
  <p>If you report a figure, name the city and the figure, and add a source if you have one.</p>
  <p><a href="/methodology" ${A}>How the data is built</a> · <a href="/about" ${A}>About Nomad Spin</a></p>`,
    },
    {
      route: 'privacy-policy',
      title: 'Privacy Policy | Nomad Spin',
      description:
        'What Nomad Spin collects, which analytics and affiliate tools it uses, which cookies they set, and how to accept or decline them.',
      h1: 'Privacy Policy',
      body: `
  <p><strong>Last updated:</strong> November 2026</p>
  <h2>1. What we collect</h2>
  <p>You can use Nomad Spin without an account. If you create one, we store your email address, your spin preferences and the destinations you save. If you send the contact form, we receive what you type in it. We ask your browser for your location only when you press the button that finds your nearest city.</p>
  <h2>2. How we use it</h2>
  <p>To show your saved spins on your devices, to answer your message, and to understand which parts of the site are used. We do not sell your data.</p>
  <h2>3. Analytics and tracking tools</h2>
  <p>Google Analytics and Impact load only after you accept them in the cookie banner. If you decline, they do not load and the site works the same.</p>
  <ul>
    <li><strong>Vercel Web Analytics.</strong> Counts page views in aggregate. No cookies. Always on.</li>
    <li><strong>Google Tag Manager.</strong> Loads Google Analytics. No cookies of its own. Only after you accept.</li>
    <li><strong>Google Analytics 4.</strong> Measures visits and actions such as a spin, a comparison or a click on a partner link. Cookies: _ga and _ga_VPE2BV06K7. Only after you accept.</li>
    <li><strong>Impact.</strong> Affiliate tracking: it lets a partner credit Nomad Spin when a booking follows a link from this site. It may set its own tracking cookies. Only after you accept.</li>
  </ul>
  <h2>4. What stays in your browser</h2>
  <p>Your cookie choice, your preferences, your comparison shortlist, and a random session ID, kept in local storage.</p>
  <h2>5. Affiliate links</h2>
  <p>Some outbound links are affiliate links. Nomad Spin may earn a commission at no extra cost to you.</p>
  <h2>6. Other services</h2>
  <p>The site is hosted by Vercel. Accounts and saved spins are stored with Supabase. City photos load from Unsplash.</p>
  <h2>7. Your choices</h2>
  <p>You can decline cookies, change your choice at any time, and ask us to delete your account and saved data. <a href="/contact" ${A}>Contact us</a>.</p>`,
    },
    {
      route: 'terms-of-use',
      title: 'Terms of Use | Nomad Spin',
      description: 'Nomad Spin terms of use. Rules and conditions for using the service.',
      h1: 'Terms of Use',
      body: `
  <p><strong>Last updated:</strong> November 2026</p>
  <p>By using Nomad Spin, you agree to these terms. Nomad Spin is a travel discovery tool that provides city recommendations from its own dataset of editorial figures and estimates. Recommendations are for information only and are not professional travel, legal, or financial advice.</p>
  <p>We cannot guarantee the accuracy of all information. Cost of living, visa rules, safety conditions, and other figures can change. Always verify critical details before making travel plans.</p>
  <p>Some outbound links are affiliate links. Nomad Spin may earn a commission at no extra cost to you. These links have no input into any score or ranking.</p>
  <p>Nomad Spin is provided "as is" without warranties of any kind. <a href="/contact" ${A}>Contact us</a> · <a href="/privacy-policy" ${A}>Privacy Policy</a></p>`,
    },
  ];
}

/** Body shell in the site palette, so the first paint before React mounts is not a white flash. */
export function staticPageBodyHtml(page: StaticPagePrerender): string {
  return `
<main id="seo-static" style="max-width:46rem;margin:2rem auto;padding:0 1.25rem;font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#F4F7FA;background:#080D16">
  <p><a href="/" ${A}>Nomad Spin</a> · <a href="/destinations" ${A}>Destinations</a> · <a href="/guides" ${A}>Guides</a></p>
  <h1>${page.h1}</h1>${page.body}
</main>`;
}
