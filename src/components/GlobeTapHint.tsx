import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function GlobeTapHint() {
  const [visible, setVisible] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] pointer-events-none flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.3, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-16 h-16 rounded-full border-2 border-primary/40"
          />
          <div className="flex items-center gap-1.5 bg-background/70 backdrop-blur-md rounded-full px-3 py-1.5">
            <Hand className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-mono text-foreground/70 tracking-wider">Tap to explore</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
