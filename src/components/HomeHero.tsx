import { Link, useNavigate } from '@/i18n/Link';
import { ArrowRight, Dices, GitCompareArrows, Maximize2 } from 'lucide-react';
import CityPicker from '@/components/product/CityPicker';
import { cityPath } from '@/lib/citySlug';
import { trackEvent } from '@/utils/analytics';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { formatNumber } from '@/i18n/format';
import { rich } from '@/i18n/rich';

interface HomeHeroProps {
  /** Opens the spin preferences. */
  onSpin: () => void;
  /** Number of cities in the dataset, shown as the coverage line. */
  cityCount: number;
  /** Hides every overlay so only the globe is left. */
  onGlobeOnly: () => void;
  /** True while the visitor is dragging the globe: the panel fades out of the way. */
  dimmed?: boolean;
}

/**
 * Proposition, search and primary actions, laid over the globe on the landing phase.
 * The wrapper ignores pointer events so the globe stays draggable around the panel.
 * The page <h1> lives in the intro section below the fold; this headline is a tagline.
 */
export default function HomeHero({ onSpin, cityCount, onGlobeOnly, dimmed = false }: HomeHeroProps) {
  const fade = `transition-opacity duration-300 ${dimmed ? 'opacity-0' : 'opacity-100'}`;
  const navigate = useNavigate();
  const t = useT();
  const locale = useLocale();

  return (
    <>
      {/* Scrim: keeps the copy readable over the globe without hiding it. */}
      <div
        aria-hidden="true"
        className={`${fade} pointer-events-none fixed inset-0 z-[2] bg-gradient-to-b from-background via-background/70 to-transparent lg:bg-gradient-to-r lg:from-background lg:via-background/75 lg:to-transparent lg:[mask-image:linear-gradient(to_right,black_0%,black_38%,transparent_62%)] [mask-image:linear-gradient(to_bottom,black_0%,black_42%,transparent_70%)]`}
      />
      <section
        aria-label="Nomad Spin"
        className={`${fade} pointer-events-none absolute inset-x-0 top-0 z-[5] flex px-4 pt-6 sm:px-6 lg:inset-y-0 lg:items-center lg:px-12 lg:pt-0`}
      >
        <div className={`w-full max-w-xl ${dimmed ? 'pointer-events-none' : 'pointer-events-auto'}`}>
          <p className="dns-eyebrow">{t('home.hero.eyebrow')}</p>
          <p className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t('home.hero.titleLine1')}
            <br />
            {t('home.hero.titleLine2')}
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('home.hero.lead', { count: formatNumber(cityCount, locale) })}
          </p>

          <div className="mt-6 max-w-md">
            <CityPicker
              label={t('home.hero.search')}
              placeholder={t('home.hero.search')}
              onPick={(city) => {
                trackEvent('destination_search', { city: city.id, source: 'home_hero' });
                navigate(cityPath(city));
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={onSpin} className="dns-btn-primary">
              <Dices className="h-4 w-4" /> {t('home.hero.spin')}
            </button>
            <Link to="/compare" className="dns-btn-secondary">
              <GitCompareArrows className="h-4 w-4" /> {t('home.hero.compare')}
            </Link>
            <Link
              to="/find-your-base"
              className="inline-flex items-center gap-1 px-2 py-2 text-sm font-semibold text-foreground hover:text-primary"
            >
              {t('home.hero.findBase')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={onGlobeOnly}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="h-3.5 w-3.5" /> {t('home.hero.globeOnly')}
          </button>

          <p className="mt-3 hidden text-xs text-muted-foreground sm:block">
            {rich(t('home.hero.dataNote'), {
              link: (children) => (
                <Link to="/methodology" className="underline underline-offset-4 hover:text-foreground">
                  {children}
                </Link>
              ),
            })}
          </p>
        </div>
      </section>
    </>
  );
}
