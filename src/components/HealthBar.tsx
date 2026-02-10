import { motion } from 'framer-motion';

interface HealthBarProps {
  label: string;
  value: number; // 0-10
  maxValue?: number;
  delay?: number;
}

export default function HealthBar({ label, value, maxValue = 10, delay = 0 }: HealthBarProps) {
  const pct = Math.round((value / maxValue) * 100);
  const barColor =
    value >= 7
      ? 'bg-emerald-400'
      : value >= 4
        ? 'bg-sky-400'
        : 'bg-amber-400';

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-[10px] font-mono font-medium tracking-[0.12em] text-foreground/70 w-24 uppercase shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay, duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-foreground w-10 text-right tabular-nums">
        {value}/{maxValue}
      </span>
    </div>
  );
}
