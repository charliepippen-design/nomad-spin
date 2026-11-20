import { Link } from 'react-router-dom';
import { cities } from '@/data/cities';
import { BUDGET_OVERRUN_LIMIT, CLIMATE_TOLERANCE_C, CRITERIA, CRITERION_LABEL, DEFAULT_WEIGHTS } from '@/lib/matching';
import PageMeta from '@/components/product/PageMeta';
import ProvenanceMark from '@/components/product/ProvenanceMark';

const TITLE = 'Methodology and Data Sources | Nomad Spin';
const DESCRIPTION =
  'How Nomad Spin city figures are built: which numbers are stored, which are formulas, which records are estimates, and how comparison and matching scores work.';

/** Counts come straight from the dataset, so this page cannot drift from what the site shows. */
function datasetCounts() {
  const total = cities.length;
  const estimated = cities.filter((c) => c.dataSource === 'estimated').length;
  const formula = (key: 'costLongTerm' | 'airbnbMedian' | 'internetReliability' | 'powerGridStability') =>
    cities.filter((c) => c.formulaEstimates?.[key]).length;
  const noInsurance = cities.filter((c) => !(c.healthInsurance?.costMonthly > 0)).length;
  return {
    total,
    estimated,
    costLongTerm: formula('costLongTerm'),
    airbnbMedian: formula('airbnbMedian'),
    internetReliability: formula('internetReliability'),
    powerGridStability: formula('powerGridStability'),
    noInsurance,
  };
}

const n = (value: number) => value.toLocaleString('en-US');

export default function Methodology() {
  const counts = datasetCounts();
  const weightTotal = CRITERIA.reduce((sum, key) => sum + DEFAULT_WEIGHTS[key], 0);

  return (
    <div className="page-content min-h-screen bg-background">
      <PageMeta title={TITLE} description={DESCRIPTION} path="/methodology" />

      <main className="dns-container py-10 md:py-14">
        <div className="max-w-3xl">
          <p className="dns-eyebrow">Methodology</p>
          <h1 className="mt-3 text-4xl md:text-5xl text-foreground">What our numbers are, and what they are not.</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            You are deciding where to live. You should know how solid each figure is before you lean on it.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Figure value={n(counts.total)} label="cities in the dataset" />
            <Figure value={n(counts.total - counts.estimated)} label="curated records" />
            <Figure value={n(counts.estimated)} label="estimated records" />
          </dl>

          <Section title="Three kinds of figure">
            <p>Every number on a city page, a comparison or a match falls into one of three groups.</p>
            <ul>
              <li>
                <strong>Stored values.</strong> Monthly cost, internet speed, safety, visa route and stay length, climate
                and the community scores are stored on each city record. They are editorial figures put together by
                Nomad Spin, not live measurements.
              </li>
              <li>
                <strong>Formula values</strong> <ProvenanceMark provenance="formula" /> When a record has no figure of its
                own for a field, we derive one from another field with a fixed rule, and tag it. The rules are listed
                below.
              </li>
              <li>
                <strong>Estimated records</strong> <ProvenanceMark provenance="estimate" /> {n(counts.estimated)} of{' '}
                {n(counts.total)} city records were produced with AI assistance and have not been checked by hand. Every
                figure on those cities carries the tag. Find Your Base can hide them.
              </li>
            </ul>
          </Section>

          <Section title="The formulas">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Rule when no stored value exists</th>
                    <th scope="col" className="text-right">Cities using it</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Long-stay monthly cost</th>
                    <td>Monthly cost × 0.75</td>
                    <td className="text-right tabular-nums">{n(counts.costLongTerm)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Median nightly stay</th>
                    <td>Monthly cost ÷ 22</td>
                    <td className="text-right tabular-nums">{n(counts.airbnbMedian)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Connection reliability</th>
                    <td>From speed: 150+ Mbps = 9, 100+ = 8, 60+ = 7, 30+ = 5, below = 4</td>
                    <td className="text-right tabular-nums">{n(counts.internetReliability)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Power grid stability</th>
                    <td>From region: Europe, North America, Oceania = 9, Asia = 7, elsewhere = 6</td>
                    <td className="text-right tabular-nums">{n(counts.powerGridStability)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>These are placeholders for a real observation, which is why they are tagged wherever they appear.</p>
          </Section>

          <Section title="What we do not have yet">
            <ul>
              <li>
                <strong>A source and a date on each figure.</strong> Records do not yet store where a number came from or
                when it was last checked. Until they do, treat stored values as a starting point, not a quote.
              </li>
              <li>
                <strong>Health insurance cost</strong> is missing for {n(counts.noInsurance)} cities. Those show “No
                data”. We do not fill gaps with a guess.
              </li>
              <li>
                <strong>Neighborhood-level data.</strong> Costs and safety are city-wide. The long-form guides cover
                neighborhoods for the cities that have one.
              </li>
            </ul>
          </Section>

          <Section title="How Compare works">
            <ul>
              <li>A row names a leader only when one city is strictly best on a measure that has a clear direction.</li>
              <li>Ties have no leader. Neither do preference rows such as temperature and nightlife.</li>
              <li>Visa rows never have a leader, because the answer depends on your passport.</li>
              <li>There is no overall winner. A missing figure stays missing and is counted as missing.</li>
            </ul>
            <p>
              <Link to="/compare">Open Compare</Link>
            </p>
          </Section>

          <Section title="How Find Your Base scores a city">
            <p>
              Each criterion becomes a fit between 0% and 100%. The score is the weighted average of those fits. You set
              the weights; the starting mix below is a suggestion and has not been validated with users.
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Criterion</th>
                    <th scope="col">How fit is worked out</th>
                    <th scope="col" className="text-right">Starting weight</th>
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA.map((key) => (
                    <tr key={key}>
                      <th scope="row">{CRITERION_LABEL[key]}</th>
                      <td>{FIT_RULES[key]}</td>
                      <td className="text-right tabular-nums">
                        {Math.round((DEFAULT_WEIGHTS[key] / weightTotal) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Equal scores are ordered by lower monthly cost. Booking and partner links have no input into any score or
              ranking.
            </p>
            <p>
              <Link to="/find-your-base">Open Find Your Base</Link>
            </p>
          </Section>

          <Section title="Visas, tax and safety">
            <p>
              Visa routes and stay lengths describe the common case and change often. Tax notes are general information,
              not advice for your situation. Check the official government source for your passport, and speak to a
              qualified adviser before you make a tax decision.
            </p>
          </Section>

          <Section title="Found a wrong number?">
            <p>
              Tell us which city and which figure, with a source if you have one, and we will correct the record.{' '}
              <Link to="/contact">Contact us</Link>.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

const FIT_RULES = {
  budget: `100% at or under your budget. Falls in a straight line to 0% at ${Math.round(BUDGET_OVERRUN_LIMIT * 100)}% over.`,
  climate: `100% at your ideal temperature. Falls in a straight line to 0% at ${CLIMATE_TOLERANCE_C}°C away. Uses the annual average.`,
  internet: '100% at or above your minimum speed. Below it, the share of your minimum the city reaches.',
  safety: '100% at or above your minimum score. Below it, the share of your minimum the city reaches.',
  community: 'The community score out of 10, as a percentage.',
  visa: '100% when the common stay length covers the days you asked for. Below it, the share it covers.',
} as const;

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="dns-card px-4 py-3">
      <dd className="dns-num text-2xl text-foreground">{value}</dd>
      <dt className="text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl text-foreground">{title}</h2>
      <div className="methodology-copy mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
