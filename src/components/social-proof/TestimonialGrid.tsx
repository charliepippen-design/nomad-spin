import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: '"Digital Nomad Spin is redefining how remote workers discover their next home base — fast, data-driven, and addictively fun."',
    source: 'TechCrunch',
  },
  {
    quote: '"Finally, a tool that takes the guesswork out of nomad life. The spin mechanic is genius."',
    source: 'Forbes',
  },
  {
    quote: '"We tested 30+ nomad platforms this year. Nomad Spin is the one we kept coming back to."',
    source: 'CoinDesk',
  },
];

export default function TestimonialGrid() {
  return (
    <section className="w-full py-14 bg-[hsl(30,10%,10%)]">
      <p className="text-center text-[10px] font-mono tracking-[0.25em] text-muted-foreground/50 uppercase mb-8">
        What they're saying
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto px-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
            className="bg-[hsl(0,0%,13%)] border border-white/5 rounded-xl p-6 flex flex-col justify-between text-center"
          >
            <p className="text-xs md:text-sm text-foreground/70 leading-relaxed italic">
              {t.quote}
            </p>
            <span className="mt-4 text-[10px] font-mono tracking-[0.2em] text-muted-foreground/40 uppercase">
              — {t.source}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
