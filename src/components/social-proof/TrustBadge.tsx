import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';

export default function TrustBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 mb-4"
    >
      <Award className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
        ))}
      </div>
      <span className="text-[10px] font-mono tracking-[0.12em] text-muted-foreground uppercase">
        Rated #1 Nomad Community 2026
      </span>
    </motion.div>
  );
}
