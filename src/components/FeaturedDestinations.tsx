import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, DollarSign } from 'lucide-react';
import { getCityThumbnailUrl } from '@/data/cityImages';
import { slugify } from '@/lib/slugify';
import { cities } from '@/data/cities';

const FEATURED_SLUGS = ['buenos-aires', 'medellin', 'bangkok', 'lisbon', 'tbilisi', 'mexico-city'];

const featuredCities = FEATURED_SLUGS
  .map((slug) => cities.find((c) => slugify(c.name) === slug))
  .filter(Boolean) as typeof cities;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function FeaturedDestinations() {
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
        <motion.div variants={fadeUp} className="text-center">
          <h2 className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-2">
            Where to Stay
          </h2>
          <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
            Explore our top destination guides — cost breakdowns, neighborhoods, Wi-Fi intel, and more.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full">
          {featuredCities.map((city) => (
            <motion.div key={city.id} variants={fadeUp}>
              <Link
                to={`/destinations/${slugify(city.name)}`}
                className="group block rounded-xl overflow-hidden border border-border/30 hover:border-border/60 transition-all"
              >
                <div className="relative h-32 md:h-40 overflow-hidden">
                  <img
                    src={getCityThumbnailUrl(city.id, city.region)}
                    alt={`${city.name}, ${city.country}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-mono text-xs tracking-[0.12em] text-white uppercase truncate">
                      {city.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-white/50" />
                      <span className="text-[9px] font-mono text-white/50">{city.country}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-3 flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-mono text-foreground/70">
                    From ${city.costUSD}/mo
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
