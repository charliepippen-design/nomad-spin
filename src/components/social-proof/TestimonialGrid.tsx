import { motion } from 'framer-motion';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto pointer-events-auto">
      {testimonials.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * i + 0.3 }}
          className="bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl p-6 transition-all duration-300"
        >
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            "{t.quote}"
          </p>
          <div className="flex flex-col border-t border-white/10 pt-4">
            <span className="text-white text-sm font-semibold">{t.author}</span>
            <span className="text-white/50 text-xs uppercase tracking-wider mt-1">{t.role}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
