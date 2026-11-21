import { Link } from '@/i18n/Link';
import { motion } from 'framer-motion';
import { MapPin, DollarSign } from 'lucide-react';
import { getCityThumbnailUrl } from '@/data/cityImages';
import UnsplashCredit from '@/components/UnsplashAttribution';
import { cityAttribution } from '@/hooks/useCityImage';
import { cities } from '@/data/cities';
import { cityPath, findCityBySlug } from '@/lib/citySlug';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { cityDisplayName } from '@/i18n/content';
import { countryName } from '@/i18n/format';

const FEATURED_SLUGS = ['buenos-aires', 'medellin', 'bangkok', 'lisbon', 'tbilisi', 'mexico-city'];

const featuredCities = FEATURED_SLUGS
  .map((slug) => findCityBySlug(slug)?.city)
  .filter(Boolean) as typeof cities;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function FeaturedDestinations() {
  const t = useT();
  const locale = useLocale();
  if (featuredCities.length === 0) return null;

  return (
    <section className="relative z-10 pointer-events-auto w-full px-4 py-16 md:py-20">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        transition={{ staggerChildren: 0.1 }}
        className="max-w-4xl mx-auto flex flex-col items-center gap-8"
      >
        <motion.div variants={fadeUp} className="text-center bg-black/50 backdrop-blur-sm rounded-2xl px-6 py-4">
          <h2 className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase mb-2">
            {t('home.featured.title')}
          </h2>
          <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
            {t('home.featured.text')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full">
          {featuredCities.map((city) => {
            const name = cityDisplayName(city, locale);
            const country = countryName(city.countryCode, city.country, locale);
            return (
            <motion.div
              key={city.id}
              variants={fadeUp}
              className="rounded-xl overflow-hidden border border-border/30 hover:border-border/60 transition-all"
            >
              <Link to={cityPath(city)} className="group block">
                <div className="relative h-32 md:h-40 overflow-hidden">
                  <img
                    src={getCityThumbnailUrl(city.id, city.region)}
                    alt={`${name}, ${country}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-mono text-xs tracking-[0.12em] text-white uppercase truncate">
                      {name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-white/50" />
                      <span className="text-[9px] font-mono text-white/50">{country}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-3 flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-mono text-foreground/70">
                    {t('home.featured.from', { cost: city.costUSD })}
                  </span>
                </div>
              </Link>
              {cityAttribution(city.id) && (
                <div className="bg-card px-3 pb-2">
                  <UnsplashCredit attribution={cityAttribution(city.id)} compact className="text-muted-foreground/60" />
                </div>
              )}
            </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
