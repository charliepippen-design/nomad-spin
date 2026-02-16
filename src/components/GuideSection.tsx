import type { ReactNode } from 'react';

interface GuideSectionProps {
  title: string;
  children: ReactNode;
  id?: string;
}

export default function GuideSection({ title, children, id }: GuideSectionProps) {
  return (
    <section id={id} className="py-8 md:py-10">
      <h2 className="font-mono text-sm md:text-base tracking-[0.2em] text-foreground uppercase mb-6">
        {title}
      </h2>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}
