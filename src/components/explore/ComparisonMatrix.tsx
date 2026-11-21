import { Link } from '@/i18n/Link';
import { ArrowLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { City } from '@/data/cities';
import { getCityThumbnailUrl, getCityImageAlt, getCityPhoto } from '@/data/cityImages';
import UnsplashCredit from '@/components/UnsplashAttribution';
import { cityAttribution } from '@/hooks/useCityImage';
import { cityPath } from '@/lib/citySlug';
import NomadImage from '@/components/common/NomadImage';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { cityDisplayName } from '@/i18n/content';
import { countryName, formatNumber } from '@/i18n/format';

interface ComparisonMatrixProps {
  cities: City[];
  onBack: () => void;
}

function MetricRow({
  label,
  values,
  bestIndex,
}: {
  label: string;
  values: string[];
  bestIndex: number;
}) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(140px, 1fr))` }}>
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex flex-col items-center py-3 sm:py-4 border-b border-border ${
            i > 0 ? 'border-l border-border' : ''
          }`}
        >
          <span className="text-[8px] sm:text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-1">
            {label}
          </span>
          <span
            className={`text-sm sm:text-lg font-bold font-mono ${
              i === bestIndex ? 'text-emerald-400' : 'text-foreground'
            }`}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ComparisonMatrix({ cities, onBack }: ComparisonMatrixProps) {
  const t = useT();
  const locale = useLocale();
  const costs = cities.map((c) => c.costUSD);
  const speeds = cities.map((c) => c.internetMbps);
  const safeties = cities.map((c) => c.safety);

  const cheapestIdx = costs.indexOf(Math.min(...costs));
  const fastestIdx = speeds.indexOf(Math.max(...speeds));
  const safestIdx = safeties.indexOf(Math.max(...safeties));

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-3xl overflow-y-auto"
    >
      <div className="sticky top-0 z-[125] bg-popover/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-3 md:px-8 py-3 md:py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            {t('globe.compare.back')}
          </button>
          <h2 className="text-sm sm:text-lg md:text-xl font-bold text-foreground tracking-tight font-mono uppercase">
            {t('globe.compare.title')}
          </h2>
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            aria-label={t('globe.compare.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 md:px-8 py-4 md:py-6 overflow-x-auto">
        <div
          className="grid gap-0 mb-0"
          style={{ gridTemplateColumns: `repeat(${cities.length}, minmax(140px, 1fr))` }}
        >
          {cities.map((city, i) => {
            const name = cityDisplayName(city, locale);
            const country = countryName(city.countryCode, city.country, locale);
            return (
            <div
              key={city.id}
              className={`relative aspect-[4/3] overflow-hidden ${
                i > 0 ? 'border-l border-border' : ''
              }`}
            >
              <Link to={cityPath(city)} className="absolute inset-0 block">
              <NomadImage
                src={getCityThumbnailUrl(city.id, city.region)}
                cityName={city.name}
                countryName={city.country}
                alt={locale === 'en' ? getCityImageAlt(city.name, city.country, city.id) : `${name}, ${country}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10">
                <p className="text-white font-bold text-xs sm:text-base leading-tight truncate">{name}</p>
                <p className="text-white/60 text-[10px] sm:text-xs truncate">{country}</p>
              </div>
              </Link>
              {getCityPhoto(city.id) && (
                <div className="absolute top-1 right-1 z-10 max-w-[90%] bg-black/40 backdrop-blur-sm rounded px-1 py-0.5">
                  <UnsplashCredit attribution={cityAttribution(city.id)} compact className="text-white/70" />
                </div>
              )}
            </div>
            );
          })}
        </div>

        <div className="bg-white/[0.03] border border-border rounded-b-xl overflow-hidden">
          <MetricRow
            label={t('globe.compare.monthlyCost')}
            values={costs.map((c) => `$${formatNumber(c, locale)}`)}
            bestIndex={cheapestIdx}
          />
          <MetricRow
            label={t('globe.compare.internet')}
            values={speeds.map((s) => `${s} Mbps`)}
            bestIndex={fastestIdx}
          />
          <MetricRow
            label={t('globe.compare.avgTemp')}
            values={cities.map((c) => `${c.weather.tempAvgC}°C`)}
            bestIndex={-1}
          />
          <MetricRow
            label={t('globe.compare.safety')}
            values={safeties.map((s) => `${formatNumber(s, locale)}/10`)}
            bestIndex={safestIdx}
          />
        </div>
      </div>
    </motion.div>
  );
}
