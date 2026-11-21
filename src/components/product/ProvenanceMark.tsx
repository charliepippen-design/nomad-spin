import type { Provenance } from '@/lib/compare';
import { useT } from '@/i18n/LocaleProvider';
import type { TKey } from '@/i18n/dictionary';

const COPY: Record<Exclude<Provenance, 'dataset'>, { short: TKey; title: TKey }> = {
  formula: {
    short: 'common.provenance.formula.short',
    title: 'common.provenance.formula.title',
  },
  estimate: {
    short: 'common.provenance.estimate.short',
    title: 'common.provenance.estimate.title',
  },
};

/** Small inline tag for figures that are not plain dataset values. Renders nothing for dataset values. */
export default function ProvenanceMark({ provenance }: { provenance: Provenance }) {
  const t = useT();
  if (provenance === 'dataset') return null;
  const copy = { short: t(COPY[provenance].short), title: t(COPY[provenance].title) };
  return (
    <span
      title={copy.title}
      className="ml-1.5 inline-flex cursor-help items-center rounded border border-warning/40 px-1 py-px align-middle text-[10px] font-medium uppercase tracking-wide text-warning"
    >
      {copy.short}
      <span className="sr-only">: {copy.title}</span>
    </span>
  );
}
