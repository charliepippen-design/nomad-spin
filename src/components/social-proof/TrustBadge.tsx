import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';

export default function TrustBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-6 w-full"
    >
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full w-fit">
        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <span className="text-[9px] md:text-[10px] text-gray-200 font-medium whitespace-nowrap">
          (4.9/5) #1 Global Nomad Community
        </span>
      </div>
    </motion.div>
  );
}
