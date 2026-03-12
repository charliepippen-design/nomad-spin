import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const testimonials = [
  {
    quote: "The city comparison tool is flawless. It accurately cross-referenced the D7 visa requirements with actual fiber-optic availability in Madeira. Saved me weeks of research.",
    author: "Elena R.",
    role: "Software Engineer",
  },
  {
    quote: "Finally a platform that tracks real cost-of-living metrics for remote workers, not just tourists. The community insights on short-term lease negotiations in LATAM are invaluable.",
    author: "Marcus T.",
    role: "Freelance Designer",
  },
  {
    quote: "I use this to filter destinations by safety, timezone overlap, and verified co-working spaces. It's the definitive aggregator for location-independent professionals.",
    author: "Sarah K.",
    role: "Agency Founder",
  },
];

export default function TestimonialGrid() {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[active];

  // On mobile: render as an inline section, not fixed
  if (isMobile) {
    return (
      <div className="w-full px-4 py-6">
        <div className="w-full max-w-[85vw] mx-auto bg-card/90 backdrop-blur-2xl border border-border/30 p-5 rounded-2xl shadow-2xl">
          <Quote className="w-4 h-4 text-muted-foreground/30 mb-3" />
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-[15px] text-foreground/80 leading-relaxed mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono font-bold text-primary">{t.author[0]}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{t.author}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-1.5 mt-4 justify-center">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-primary/60' : 'w-2 bg-muted-foreground/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: dismissible fixed card
  if (dismissed) return null;

  return (
    <div className="fixed bottom-24 right-6 md:right-10 z-50 w-[280px] bg-[#0f0f0f]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/10 transition-colors text-white/30 hover:text-white/70"
        aria-label="Dismiss testimonials"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <Quote className="w-4 h-4 text-white/20 mb-3" />
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-sm text-gray-200 leading-relaxed mb-3 pr-4">"{t.quote}"</p>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-mono font-bold text-white/70">{t.author[0]}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t.author}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{t.role}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-1.5 mt-3">
        {testimonials.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 rounded-full transition-all duration-300 ${i === active ? 'w-4 bg-white/60' : 'w-2 bg-white/15'}`}
          />
        ))}
      </div>
    </div>
  );
}
