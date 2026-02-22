import { motion } from 'framer-motion';

const publishers = ['Bloomberg', 'TechCrunch', 'Forbes', 'AskGamblers', 'CoinDesk', 'Wired'];

export default function PublisherLogoCloud() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full py-8 bg-transparent border-t border-b border-white/[0.06]"
    >
      <p className="text-center text-[10px] font-mono tracking-[0.25em] text-muted-foreground/50 uppercase mb-5">
        As seen in
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 px-6 max-w-4xl mx-auto">
        {publishers.map((name) => (
          <span
            key={name}
            className="text-sm md:text-base font-semibold tracking-wider text-white opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default select-none"
          >
            {name}
          </span>
        ))}
      </div>
    </motion.section>
  );
}
