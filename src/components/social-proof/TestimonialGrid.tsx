import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: '"This tool completely changed how I plan my next move. I found my dream base in Lisbon in under two minutes."',
    author: 'Sarah K.',
    source: 'Remote Worker, Berlin → Lisbon',
  },
  {
    quote: '"As a digital nomad for 5 years, I wish I had this from day one. The city comparisons are incredibly accurate."',
    author: 'James T.',
    source: 'Full-Stack Dev, Nomading Since 2021',
  },
  {
    quote: '"Finally something that compares cost of living, internet speed, and safety in one place. My whole community uses it now."',
    author: 'Priya M.',
    source: 'Content Creator, Bangkok',
  },
];

export default function TestimonialGrid() {
  return (
    <section className="w-full py-14">
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
              {t.quote}
            </p>
            <div className="mt-4">
              <span className="text-white font-semibold tracking-wide block">{t.author}</span>
              <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground/60 uppercase">{t.source}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
