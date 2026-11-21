import { Link } from '@/i18n/Link';
import PageMeta from '@/components/product/PageMeta';
import { openConsentBanner } from '@/lib/consent';

const BASE_URL = 'https://www.digitalnomadspin.com';
const PAGE_URL = `${BASE_URL}/privacy-policy`;
const TITLE = 'Privacy Policy | Nomad Spin';
const DESCRIPTION =
  'What Nomad Spin collects, which analytics and affiliate tools it uses, which cookies they set, and how to accept or decline them.';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: TITLE,
  url: PAGE_URL,
  description: DESCRIPTION,
};

const H2 = 'border-t border-border pt-8 text-2xl text-foreground';

/** Third-party tools, in the order a visitor meets them. Keep in step with index.html and main.tsx. */
const TOOLS: { name: string; job: string; cookies: string; when: string }[] = [
  {
    name: 'Vercel Web Analytics',
    job: 'Counts page views in aggregate so we can see which pages are used.',
    cookies: 'None.',
    when: 'Always. It does not use cookies or follow you across sites.',
  },
  {
    name: 'Google Tag Manager',
    job: 'Loads Google Analytics. It collects nothing by itself.',
    cookies: 'None of its own.',
    when: 'Only after you accept.',
  },
  {
    name: 'Google Analytics 4',
    job: 'Measures visits and actions such as a spin, a comparison or a click on a partner link.',
    cookies: '_ga and _ga_VPE2BV06K7.',
    when: 'Only after you accept.',
  },
  {
    name: 'Impact',
    job: 'Affiliate tracking. It lets a partner credit Nomad Spin when a booking follows a link from this site.',
    cookies: 'Impact may set its own tracking cookies.',
    when: 'Only after you accept.',
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="page-content min-h-screen bg-background">
      <PageMeta title={TITLE} description={DESCRIPTION} path="/privacy-policy" jsonLd={jsonLd} />

      <div className="dns-container py-12 md:py-20">
        <div className="max-w-3xl">
          <p className="dns-eyebrow">Legal</p>
          <h1 className="mb-10 mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">Privacy Policy</h1>

          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Last updated:</strong> November 2026
            </p>

            <h2 className={H2}>1. What we collect</h2>
            <p>
              You can use Nomad Spin without an account. If you create one, we store your email address, your spin
              preferences and the destinations you save. If you send the contact form, we receive what you type in it.
              We ask your browser for your location only when you press the button that finds your nearest city.
            </p>

            <h2 className={H2}>2. How we use it</h2>
            <p>
              To show your saved spins on your devices, to answer your message, and to understand which parts of the
              site are used. We do not sell your data.
            </p>

            <h2 className={H2}>3. Analytics and tracking tools</h2>
            <p>
              Google Analytics and Impact load only after you accept them in the cookie banner. If you decline, they do
              not load and the site works the same.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th scope="col" className="py-2 pr-4 font-semibold">Tool</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">What it does</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">Cookies</th>
                    <th scope="col" className="py-2 font-semibold">When it loads</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOLS.map((tool) => (
                    <tr key={tool.name} className="border-b border-border align-top">
                      <th scope="row" className="py-3 pr-4 font-semibold text-foreground">{tool.name}</th>
                      <td className="py-3 pr-4">{tool.job}</td>
                      <td className="py-3 pr-4">{tool.cookies}</td>
                      <td className="py-3">{tool.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              <button
                type="button"
                onClick={openConsentBanner}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Change your cookie choice
              </button>
            </p>

            <h2 className={H2}>4. What stays in your browser</h2>
            <p>
              The site keeps a few items in your browser's local storage: your cookie choice, your preferences, your
              comparison shortlist, and a random session ID. The session ID is attached to analytics events, and those
              are sent only if you accepted analytics.
            </p>

            <h2 className={H2}>5. Affiliate links</h2>
            <p>
              Some outbound links are affiliate links. Nomad Spin may earn a commission at no extra cost to you. These
              links carry our partner ID and campaign tags in the address, so the partner knows the visit came from
              Nomad Spin. The partner site has its own privacy policy.
            </p>

            <h2 className={H2}>6. Other services</h2>
            <p>
              The site is hosted by Vercel. Accounts and saved spins are stored with Supabase. City photos load from
              Unsplash. Each of these receives your IP address when your browser contacts it, as any web server does.
            </p>

            <h2 className={H2}>7. Your choices</h2>
            <p>
              You can decline cookies, change your choice at any time with the link above or in the footer, and ask us to
              delete your account and saved data.
            </p>

            <h2 className={H2}>8. Contact</h2>
            <p>
              Questions about this policy?{' '}
              <Link to="/contact" className="font-semibold text-primary hover:underline">
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
