import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';

export default function TrustBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full w-fit pointer-events-auto"
    >
      <Award className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
        ))}
      </div>
      <span className="text-xs md:text-sm text-gray-200 font-medium">
        (4.9/5) Rated #1 Global Nomad Community
      </span>
    </motion.div>
  );
}
