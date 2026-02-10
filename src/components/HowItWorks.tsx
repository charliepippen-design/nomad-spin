import { motion } from 'framer-motion';
import { Globe2, BarChart3, ShoppingBag, Wifi, DollarSign, Clock } from 'lucide-react';

const steps = [
  { icon: Globe2, number: '01', title: 'Spin & Select', description: 'Spin the globe and discover a city matched to your preferences.' },
  { icon: BarChart3, number: '02', title: 'Compare Metrics', description: 'Review cost of living, internet speed, safety, and more at a glance.' },
  { icon: ShoppingBag, number: '03', title: 'Book What You Need', description: 'Find stays, flights, eSIMs, and insurance — all in one place.' },
];

const benefits = [
  { icon: Wifi, text: 'Avoid slow internet traps' },
  { icon: DollarSign, text: 'Optimize cost vs. quality of life' },
  { icon: Clock, text: 'Plan trips in minutes instead of days' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative z-10 pointer-events-auto w-full px-4 py-20 md:py-28"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ staggerChildren: 0.12 }}
        className="max-w-3xl mx-auto flex flex-col items-center gap-16"
      >
        {/* Section title */}
        <motion.h2
          variants={fadeUp}
          className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase"
        >
          How It Works
        </motion.h2>

        {/* 3 steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={fadeUp}
              className="glass rounded-xl p-6 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{step.number}</span>
                <step.icon className="w-4 h-4 text-foreground/70" />
              </div>
              <h3 className="font-mono text-sm tracking-wider text-foreground">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-6 w-full">
          {benefits.map((b) => (
            <div key={b.text} className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                <b.icon className="w-3.5 h-3.5 text-foreground/60" />
              </div>
              <span className="text-xs text-muted-foreground">{b.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Data note */}
        <motion.p
          variants={fadeUp}
          className="text-[11px] text-muted-foreground/60 text-center max-w-md leading-relaxed"
        >
          Our dataset covers 600+ cities worldwide with curated cost, internet speed, safety, and visa data — updated regularly.
        </motion.p>
      </motion.div>
    </section>
  );
}
