import { motion } from 'framer-motion';
import { useSpinStore } from '@/store/useSpinStore';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { Bookmark, MapPin, Trash2, RotateCcw } from 'lucide-react';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { cityDisplayName } from '@/i18n/content';
import { countryName } from '@/i18n/format';

export default function SavedSpins() {
  const { savedSpins, removeSavedSpin, redeploySpin } = useSpinStore();
  const auth = useAuth();
  const cloudSync = useCloudSync(auth.user?.id);
  const t = useT();
  const locale = useLocale();

  if (savedSpins.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto mt-8 px-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Bookmark className="w-3 h-3 text-muted-foreground" />
        <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
          {t('common.saved.heading', { count: savedSpins.length })}
        </h3>
      </div>
      <div className="space-y-1">
        {savedSpins.map((entry, index) => (
          <div
            key={entry.city.id + '-' + index}
            className="flex items-center gap-3 p-3 rounded-sm glass glass-hover transition-colors group"
          >
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-foreground/80 truncate tracking-wider">
                {t('common.saved.trip', { number: String(index + 1).padStart(3, '0'), city: cityDisplayName(entry.city, locale).toUpperCase() })}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {countryName(entry.city.countryCode, entry.city.country, locale)} · ${entry.city.costUSD}{t('data.metric.perMonth')} · {entry.timestamp}
              </p>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider mr-1">
              {t('common.saved.badge')}
            </span>
            <button
              onClick={() => redeploySpin(index)}
              className="p-1.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
              title={t('common.saved.searchAgain')}
              aria-label={t('common.saved.searchAgain')}
            >
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </button>
            <button
              onClick={() => {
                if (auth.isAuthenticated) cloudSync.removeSpin(entry.city.id);
                removeSavedSpin(index);
              }}
              className="p-1.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
              title={t('common.saved.delete')}
              aria-label={t('common.saved.deleteAria', { city: cityDisplayName(entry.city, locale) })}
            >
              <Trash2 className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
