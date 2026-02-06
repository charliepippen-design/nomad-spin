import { motion } from 'framer-motion';
import { Plane, Wifi, Coffee, Laptop } from 'lucide-react';

interface SpinButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'primary' | 'secondary';
}

export default function SpinButton({ onClick, label = "SPIN FOR YOUR NEXT NOMAD SPOT", variant = 'primary' }: SpinButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative px-8 py-4 md:px-12 md:py-5
        rounded-xl font-display font-bold text-lg md:text-xl tracking-wider
        glass border-2 border-primary/60
        text-primary
        animate-pulse-glow
        cursor-pointer
        transition-all duration-300
        hover:border-primary hover:shadow-[0_0_40px_hsl(var(--neon-cyan)/0.4)]
        active:shadow-[0_0_60px_hsl(var(--neon-cyan)/0.6)]
        min-h-[48px]
        ${variant === 'secondary' ? 'text-base md:text-lg px-6 py-3 border-secondary/60 text-secondary hover:border-secondary' : ''}
      `}
    >
      <span className="relative z-10 flex items-center gap-3">
        <span className="hidden sm:flex gap-2 opacity-60">
          <Plane className="w-4 h-4" />
          <Wifi className="w-4 h-4" />
          <Coffee className="w-4 h-4" />
          <Laptop className="w-4 h-4" />
        </span>
        {label}
      </span>
      {/* Animated gradient background */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 animate-shimmer bg-[length:200%_100%]" />
    </motion.button>
  );
}
