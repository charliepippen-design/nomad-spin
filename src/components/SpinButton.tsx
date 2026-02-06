import { motion } from 'framer-motion';

interface SpinButtonProps {
  onClick: () => void;
  label?: string;
}

export default function SpinButton({ onClick, label = "CONFIGURE MISSION" }: SpinButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="
        relative px-10 py-4 md:px-14 md:py-5
        rounded-sm font-mono font-medium text-sm md:text-base tracking-[0.25em] uppercase
        glass glass-hover
        text-foreground
        cursor-pointer
        transition-all duration-500
        min-h-[48px]
      "
    >
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}
