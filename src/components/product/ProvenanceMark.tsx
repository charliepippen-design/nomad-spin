import type { Provenance } from '@/lib/compare';

const COPY: Record<Exclude<Provenance, 'dataset'>, { short: string; title: string }> = {
  formula: {
    short: 'formula',
    title: 'Derived from another figure with a fixed formula, not observed directly. See Methodology.',
  },
  estimate: {
    short: 'est.',
    title: 'This city’s whole record is an estimate and has not been checked by hand. See Methodology.',
  },
};

/** Small inline tag for figures that are not plain dataset values. Renders nothing for dataset values. */
export default function ProvenanceMark({ provenance }: { provenance: Provenance }) {
  if (provenance === 'dataset') return null;
  const copy = COPY[provenance];
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
