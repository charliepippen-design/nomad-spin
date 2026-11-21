import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useT } from '@/i18n/LocaleProvider';

interface MobileHeroCopyProps {
  onCTA: () => void;
}

export default function MobileHeroCopy({ onCTA }: MobileHeroCopyProps) {
  const isMobile = useIsMobile();
  const t = useT();
  if (!isMobile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="absolute bottom-32 left-0 right-0 z-[5] px-5 pointer-events-none"
    >
      <div className="bg-gradient-to-t from-background via-background/80 to-transparent rounded-2xl p-5 pointer-events-auto">
        <h1 className="text-2xl font-light tracking-wider text-foreground leading-tight mb-2">
          {t('home.mobileHero.title')}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {t('home.mobileHero.text')}
        </p>
        <button
          onClick={onCTA}
          className="w-full py-3 rounded-lg font-mono text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t('home.mobileHero.cta')}
        </button>
      </div>
    </motion.div>
  );
}
