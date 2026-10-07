import type { ReactNode } from 'react';

interface GuideSectionProps {
  title: string;
  children: ReactNode;
  id?: string;
}

export default function GuideSection({ title, children, id }: GuideSectionProps) {
  return (
    <section id={id} className="py-8 md:py-10">
      <h2 className="text-2xl text-foreground mb-4">
        {title}
      </h2>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}
