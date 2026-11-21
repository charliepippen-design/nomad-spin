import { Link } from '@/i18n/Link';
import { cities } from '@/data/cities';
import {
  BELOW_MINIMUM_CAP,
  BUDGET_OVERRUN_LIMIT,
  CLIMATE_TOLERANCE_C,
  CRITERIA,
  CRITERION_LABEL,
  DEFAULT_WEIGHTS,
  type CriterionKey,
} from '@/lib/matching';
import { DATASET_UPDATED } from '@/data/datasetMeta';
import PageMeta from '@/components/product/PageMeta';
import ProvenanceMark from '@/components/product/ProvenanceMark';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import type { TFunction } from '@/i18n/dictionary';
import { formatDate, formatNumber } from '@/i18n/format';
import { rich } from '@/i18n/rich';

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

const bold = { b: (children: string) => <strong>{children}</strong> };

export default function Methodology() {
  const t = useT();
  const locale = useLocale();
  const n = (value: number) => formatNumber(value, locale);
  const counts = datasetCounts();
  const weightTotal = CRITERIA.reduce((sum, key) => sum + DEFAULT_WEIGHTS[key], 0);
  const fitRules = fitRulesFor(t);

  return (
    <div className="page-content min-h-screen bg-background">
      <PageMeta title={t('methodology.title')} description={t('methodology.description')} path="/methodology" />

      <main className="dns-container py-10 md:py-14">
        <div className="max-w-3xl">
          <p className="dns-eyebrow">{t('methodology.eyebrow')}</p>
          <h1 className="mt-3 text-4xl md:text-5xl text-foreground">{t('methodology.h1')}</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">{t('methodology.intro')}</p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Figure value={n(counts.total)} label={t('methodology.figure.cities')} />
            <Figure value={n(counts.total - counts.estimated)} label={t('methodology.figure.editorial')} />
            <Figure value={n(counts.estimated)} label={t('methodology.figure.estimated')} />
          </dl>

          <Section title={t('methodology.kinds.title')}>
            <p>{t('methodology.kinds.intro')}</p>
            <ul>
              <li>{rich(t('methodology.kinds.editorial', { count: n(counts.total - counts.estimated) }), bold)}</li>
              <li>
                <strong>{t('methodology.kinds.estimated.label')}</strong> <ProvenanceMark provenance="estimate" />{' '}
                {t('methodology.kinds.estimated.body', { estimated: n(counts.estimated), total: n(counts.total) })}
              </li>
              <li>
                <strong>{t('methodology.kinds.formula.label')}</strong> <ProvenanceMark provenance="formula" />{' '}
                {t('methodology.kinds.formula.body')}
              </li>
            </ul>
          </Section>

          <Section title={t('methodology.cost.title')}>
            <p>{t('methodology.cost.p1')}</p>
            <p>{t('methodology.cost.p2')}</p>
          </Section>

          <Section title={t('methodology.formulas.title')}>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">{t('methodology.formulas.col.field')}</th>
                    <th scope="col">{t('methodology.formulas.col.rule')}</th>
                    <th scope="col" className="text-right">{t('methodology.formulas.col.cities')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">{t('methodology.formulas.longStay.field')}</th>
                    <td>{t('methodology.formulas.longStay.rule')}</td>
                    <td className="text-right tabular-nums">{n(counts.costLongTerm)}</td>
                  </tr>
                  <tr>
                    <th scope="row">{t('methodology.formulas.nightly.field')}</th>
                    <td>{t('methodology.formulas.nightly.rule')}</td>
                    <td className="text-right tabular-nums">{n(counts.airbnbMedian)}</td>
                  </tr>
                  <tr>
                    <th scope="row">{t('methodology.formulas.reliability.field')}</th>
                    <td>{t('methodology.formulas.reliability.rule')}</td>
                    <td className="text-right tabular-nums">{n(counts.internetReliability)}</td>
                  </tr>
                  <tr>
                    <th scope="row">{t('methodology.formulas.power.field')}</th>
                    <td>{t('methodology.formulas.power.rule')}</td>
                    <td className="text-right tabular-nums">{n(counts.powerGridStability)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              {t('methodology.formulas.note', {
                longStay: n(counts.costLongTerm),
                total: n(counts.total),
                nightly: n(counts.airbnbMedian),
                reliability: n(counts.internetReliability),
              })}
            </p>
          </Section>

          <Section title={t('methodology.gaps.title')}>
            <ul>
              <li>{rich(t('methodology.gaps.source', { date: formatDate(DATASET_UPDATED, locale) }), bold)}</li>
              <li>{rich(t('methodology.gaps.insurance', { count: n(counts.noInsurance) }), bold)}</li>
              <li>{rich(t('methodology.gaps.neighborhood'), bold)}</li>
            </ul>
          </Section>

          <Section title={t('methodology.compare.title')}>
            <ul>
              <li>{t('methodology.compare.li1')}</li>
              <li>{t('methodology.compare.li2')}</li>
              <li>{t('methodology.compare.li3')}</li>
              <li>{t('methodology.compare.li4')}</li>
            </ul>
            <p>
              <Link to="/compare">{t('methodology.compare.open')}</Link>
            </p>
          </Section>

          <Section title={t('methodology.match.title')}>
            <p>{t('methodology.match.intro')}</p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">{t('methodology.match.col.criterion')}</th>
                    <th scope="col">{t('methodology.match.col.fit')}</th>
                    <th scope="col" className="text-right">{t('methodology.match.col.weight')}</th>
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA.map((key) => (
                    <tr key={key}>
                      <th scope="row">{t.dyn(`tools.criterion.${key}`, CRITERION_LABEL[key])}</th>
                      <td>{fitRules[key]}</td>
                      <td className="text-right tabular-nums">
                        {Math.round((DEFAULT_WEIGHTS[key] / weightTotal) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>{t('methodology.match.flagged')}</p>
            <p>
              <Link to="/find-your-base">{t('methodology.match.open')}</Link>
            </p>
          </Section>

          <Section title={t('methodology.visa.title')}>
            <p>{t('methodology.visa.body')}</p>
          </Section>

          <Section title={t('methodology.wrong.title')}>
            <p>
              {rich(t('methodology.wrong.body'), { link: (children) => <Link to="/contact">{children}</Link> })}
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

const CAP = Math.round(BELOW_MINIMUM_CAP * 100);

/** How each criterion turns into a fit, in the reader's language. */
function fitRulesFor(t: TFunction): Record<CriterionKey, string> {
  return {
    budget: t('methodology.fit.budget', { limit: Math.round(BUDGET_OVERRUN_LIMIT * 100) }),
    climate: t('methodology.fit.climate', { tolerance: CLIMATE_TOLERANCE_C }),
    internet: t('methodology.fit.internet', { cap: CAP }),
    safety: t('methodology.fit.safety', { cap: CAP }),
    community: t('methodology.fit.community'),
    visa: t('methodology.fit.visa', { cap: CAP }),
  };
}

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
