import { motion } from 'framer-motion';

interface HealthBarProps {
  label: string;
  value: number; // 0-10
  maxValue?: number;
  delay?: number;
}

export default function HealthBar({ label, value, maxValue = 10, delay = 0 }: HealthBarProps) {
  const segments = 10;
  const filled = Math.round((value / maxValue) * segments);
  const color = value >= 7 ? 'bg-white' : value >= 4 ? 'bg-white/60' : 'bg-destructive/70';

  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-mono tracking-[0.15em] text-muted-foreground w-20 uppercase shrink-0">
        {label}
      </span>
      <div className="flex-1 flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{
              opacity: i < filled ? 1 : 0.15,
              scaleY: 1,
            }}
            transition={{ delay: delay + i * 0.04, duration: 0.2 }}
            className={`h-2 flex-1 rounded-[1px] ${i < filled ? color : 'bg-white/10'}`}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono text-foreground/80 w-8 text-right">
        {value}/{maxValue}
      </span>
    </div>
  );
}
