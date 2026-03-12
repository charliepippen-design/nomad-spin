import { useIsMobile } from '@/hooks/use-mobile';

const publishers = [
  {
    name: "The New York Times",
    displayName: "The New York Times",
    font: "font-serif",
    href: "https://www.nytimes.com/guides/travel/how-to-become-a-digital-nomad",
  },
  {
    name: "CNN",
    displayName: "CNN",
    font: "font-bold",
    href: "https://edition.cnn.com/travel/article/digital-nomad-destinations/index.html",
  },
  {
    name: "TechCrunch",
    displayName: "TechCrunch",
    font: "font-bold",
    href: "https://techcrunch.com/tag/remote-work/",
  },
  {
    name: "The Guardian",
    displayName: "The Guardian",
    font: "font-serif",
    href: "https://www.theguardian.com/money/remote-working",
  },
  {
    name: "Forbes",
    displayName: "Forbes",
    font: "font-bold italic",
    href: "https://www.forbes.com/sites/digital-nomad/",
  },
];

export default function PublisherLogoCloud() {
  const isMobile = useIsMobile();

  // On mobile: inline scrollable strip
  if (isMobile) {
    return (
      <div className="w-full py-4 px-4">
        <div
          className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          <span className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground/40 uppercase whitespace-nowrap shrink-0">
            As seen on
          </span>
          {publishers.map((pub) => (
            <a
              key={pub.name}
              href={pub.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={pub.name}
              className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300"
            >
              <span className={`text-[11px] tracking-tight whitespace-nowrap ${pub.font}`}>
                {pub.displayName}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: fixed bottom bar with grey text names that turn white on hover
  return (
    <div className="fixed bottom-0 left-0 w-full h-14 bg-black/70 backdrop-blur-xl border-t border-white/10 z-40 flex items-center justify-center gap-8 md:gap-14 pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <span className="text-[9px] font-mono tracking-[0.25em] text-white/25 uppercase">
        As seen on
      </span>
      {publishers.map((pub) => (
        <a
          key={pub.name}
          href={pub.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={pub.name}
          title={pub.name}
          className="text-white/30 hover:text-white/80 transition-colors duration-300"
        >
          <span className={`text-[13px] tracking-tight whitespace-nowrap ${pub.font}`}>
            {pub.displayName}
          </span>
        </a>
      ))}
    </div>
  );
}
