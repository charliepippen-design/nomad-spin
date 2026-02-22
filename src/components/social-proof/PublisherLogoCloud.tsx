import { motion } from 'framer-motion';

const publishers = ['The New York Times', 'BBC', 'CNN', 'TechCrunch', 'Forbes', 'The Guardian'];

export default function PublisherLogoCloud() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 w-full max-w-7xl mx-auto pointer-events-auto">
      {publishers.map((name, i) => (
        <motion.span
          key={name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 * i }}
          className="text-white/40 font-bold text-lg md:text-xl tracking-wider uppercase hover:text-white transition-colors duration-300 cursor-default select-none"
        >
          {name}
        </motion.span>
      ))}
    </div>
  );
}
