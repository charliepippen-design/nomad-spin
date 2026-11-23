import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Dices, GitCompareArrows, Maximize2 } from 'lucide-react';
import CityPicker from '@/components/product/CityPicker';
import { cityPath } from '@/lib/citySlug';
import { trackEvent } from '@/utils/analytics';

interface HomeHeroProps {
  /** Opens the spin preferences. */
  onSpin: () => void;
  /** Number of cities in the dataset, shown as the coverage line. */
  cityCount: number;
  /** Hides every overlay so only the globe is left. */
  onGlobeOnly: () => void;
  /** Opens the drawer on its "How it works" section. */
  onHowItWorks: () => void;
  /**
   * True while the visitor is dragging the globe: the panel fades out of the way.
   * On phones it is also removed from the page, so it cannot take touches meant for the globe.
   */
  dimmed?: boolean;
}

/**
 * Proposition, search and primary actions, laid over the globe on the landing phase.
 * The wrapper ignores pointer events so the globe stays draggable around the panel.
 * The page <h1> lives in the intro section below the fold; this headline is a tagline.
 * Below the sm breakpoint the panel is a compact strip, so the globe is what a phone shows first.
 */
export default function HomeHero({ onSpin, cityCount, onGlobeOnly, onHowItWorks, dimmed = false }: HomeHeroProps) {
  const fade = `transition-[opacity,visibility] duration-300 ${dimmed ? 'opacity-0 max-sm:invisible' : 'opacity-100'}`;
  const navigate = useNavigate();

  return (
    <>
      {/* Scrim: keeps the copy readable over the globe without hiding it. */}
      <div
        aria-hidden="true"
        className={`${fade} pointer-events-none fixed inset-0 z-[2] bg-gradient-to-b from-background via-background/70 to-transparent lg:bg-gradient-to-r lg:from-background lg:via-background/75 lg:to-transparent lg:[mask-image:linear-gradient(to_right,black_0%,black_38%,transparent_62%)] [mask-image:linear-gradient(to_bottom,black_0%,black_42%,transparent_70%)] max-sm:[mask-image:linear-gradient(to_bottom,black_0%,black_12%,transparent_30%)]`}
      />
      <section
        aria-label="Nomad Spin"
        className={`${fade} pointer-events-none absolute inset-x-0 top-0 z-[5] flex px-4 pt-1.5 sm:px-6 sm:pt-6 lg:inset-y-0 lg:items-center lg:px-12 lg:pt-0`}
      >
        <div className={`w-full max-w-xl ${dimmed ? 'pointer-events-none' : 'pointer-events-auto'}`}>
          <p className="dns-eyebrow max-sm:hidden">Destination intelligence for remote workers</p>
          <p className="font-display text-2xl font-extrabold leading-[1.05] sm:mt-3 tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your next base.
            <br />
            Better decided.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground max-sm:hidden sm:text-lg">
            Explore {cityCount.toLocaleString('en-US')} cities. Compare what matters. Find somewhere that fits your life.
          </p>

          <div className="mt-2 max-w-md max-sm:max-w-none max-sm:[&_input]:h-11 sm:mt-6">
            <CityPicker
              label="Search a city or country"
              placeholder="Search a city or country"
              onPick={(city) => {
                trackEvent('destination_search', { city: city.id, source: 'home_hero' });
                navigate(cityPath(city));
              }}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2.5 max-sm:flex-nowrap sm:mt-4">
            <button type="button" onClick={onSpin} className="dns-btn-primary max-sm:flex-1 max-sm:whitespace-nowrap max-sm:px-3">
              <Dices className="h-4 w-4" /> Spin the globe
            </button>
            <Link to="/compare" className="dns-btn-secondary max-sm:flex-1 max-sm:whitespace-nowrap max-sm:px-3">
              <GitCompareArrows className="h-4 w-4" /> Compare cities
            </Link>
            <Link
              to="/find-your-base"
              className="inline-flex items-center gap-1 px-2 py-2 text-sm font-semibold text-foreground hover:text-primary max-sm:hidden"
            >
              Find your base <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 max-sm:flex-nowrap max-sm:gap-x-2 sm:mt-4">
            <button
              type="button"
              onClick={onHowItWorks}
              className="inline-flex items-center rounded-md py-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline max-sm:text-xs max-sm:rounded-full max-sm:bg-background/70 max-sm:px-2.5 max-sm:backdrop-blur-sm"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={onGlobeOnly}
              className="inline-flex items-center gap-1.5 rounded-md py-1 text-sm font-medium text-muted-foreground hover:text-foreground max-sm:text-xs max-sm:rounded-full max-sm:bg-background/70 max-sm:px-2.5 max-sm:backdrop-blur-sm"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Just the globe
            </button>
          </div>

          <p className="mt-3 hidden text-xs text-muted-foreground sm:block">
            Cost, internet, safety, visa length and climate for every city.{' '}
            <Link to="/methodology" className="underline underline-offset-4 hover:text-foreground">
              See how the data is built
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
