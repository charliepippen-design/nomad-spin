import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "The city comparison tool is flawless. It accurately cross-referenced the D7 visa requirements with actual fiber-optic availability in Madeira. Saved me weeks of research.",
    author: "Elena R.",
    role: "Software Engineer, Nomading since 2022",
  },
  {
    quote: "Finally a platform that tracks real cost-of-living metrics for remote workers, not just tourists. The community insights on short-term lease negotiations in LATAM are invaluable.",
    author: "Marcus T.",
    role: "Freelance Designer, Currently in Asunción",
  },
  {
    quote: "I use this to filter destinations by safety, timezone overlap with EST, and verified co-working spaces. It's the definitive aggregator for location-independent professionals.",
    author: "Sarah K.",
    role: "Agency Founder, Global",
  },
];

export default function TestimonialGrid() {
  return (
    <section className="w-full">
      <p className="text-center text-[10px] font-mono tracking-[0.25em] text-muted-foreground/50 uppercase mb-8">
        What nomads are saying
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto px-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
            className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 flex flex-col justify-between text-center"
          >
            <p className="text-gray-200 text-lg leading-relaxed font-light italic">
              "{t.quote}"
            </p>
            <div className="mt-4">
              <span className="text-white font-semibold tracking-wide block">{t.author}</span>
              <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground/60 uppercase">{t.role}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
