import { motion } from 'framer-motion';
import { ArrowRight, Bookmark, GitCompareArrows, X } from 'lucide-react';
import { Link } from '@/i18n/Link';
import type { City } from '@/data/cities';
import { useSpinStore } from '@/store/useSpinStore';
import { cityPath } from '@/lib/citySlug';
import { comparePath } from '@/lib/compare';

interface CityTooltipProps {
  city: City;
  /** Screen position of the city's marker. The desktop card sits beside it. */
  x: number;
  y: number;
  /** Phone layout: a sheet docked to the bottom of the screen. */
  sheet?: boolean;
  /** Pinned cards (clicked or tapped) show a close button and stay until dismissed. */
  pinned?: boolean;
  onClose: () => void;
  /** The pointer moved onto / off the card: the page keeps it open while it is on. */
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

const CARD_WIDTH = 320;
const CARD_HEIGHT = 250;
const GAP = 14;

/**
 * City card for the globe. On desktop it is anchored to the marker and can be
 * reached with the mouse; on phones it is a bottom sheet with full-size buttons.
 */
export default function CityTooltip({ city, x, y, sheet = false, pinned = false, onClose, onPointerEnter, onPointerLeave }: CityTooltipProps) {
  const { savedSpins, saveCity } = useSpinStore();
  const isSaved = savedSpins.some((s) => s.city?.id === city.id);

  // Desktop: to the right of the marker, or to the left when there is no room. Kept on screen.
  const fitsRight = x + GAP + CARD_WIDTH < window.innerWidth - 8;
  const style: React.CSSProperties = sheet
    ? {}
    : {
        width: CARD_WIDTH,
        left: fitsRight ? x + GAP : Math.max(8, x - GAP - CARD_WIDTH),
        top: Math.max(8, Math.min(y - 40, window.innerHeight - CARD_HEIGHT - 8)),
      };

  return (
    <motion.div
      role="dialog"
      aria-label={`${city.name}, ${city.country}`}
      initial={sheet ? { opacity: 0, y: 24 } : { opacity: 0, scale: 0.96 }}
      animate={sheet ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
      exit={sheet ? { opacity: 0, y: 24 } : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={
        sheet
          ? 'fixed inset-x-3 bottom-3 z-[80] rounded-2xl border border-border bg-popover/95 p-5 shadow-2xl backdrop-blur-xl'
          : 'fixed z-[80] rounded-xl border border-border bg-popover/95 p-4 shadow-2xl backdrop-blur-xl'
      }
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`truncate font-display font-bold leading-tight text-foreground ${sheet ? 'text-2xl' : 'text-lg'}`}>
            {city.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {city.country} · {city.region}
          </p>
        </div>
        {(sheet || pinned) && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`-mr-1 -mt-1 flex shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground ${sheet ? 'h-11 w-11' : 'h-8 w-8'}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <dl className={`mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 ${sheet ? 'sm:grid-cols-4' : ''}`}>
        <Fact label="Monthly cost" value={`$${city.costUSD.toLocaleString('en-US')}`} />
        <Fact label="Internet" value={`${city.internetMbps} Mbps`} />
        <Fact label="Safety" value={`${city.safety}/10`} />
        <Fact label="Avg temp" value={`${city.weather.tempAvgC}°C`} />
      </dl>

      {city.dataSource === 'estimated' && (
        <p className="mt-2.5 text-xs text-warning">Estimated record, not checked by hand.</p>
      )}

      <div className={`mt-4 flex items-center gap-2 ${sheet ? 'flex-wrap' : ''}`}>
        <Link to={cityPath(city)} className={`dns-btn-primary ${sheet ? 'min-h-[44px] flex-1' : 'whitespace-nowrap !px-3 !py-2 text-sm'}`}>
          Open city <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to={comparePath([city])}
          className={`dns-btn-secondary ${sheet ? 'min-h-[44px]' : '!px-3 !py-2 text-sm'}`}
        >
          <GitCompareArrows className="h-4 w-4" /> Compare
        </Link>
        <button
          type="button"
          onClick={() => saveCity(city)}
          aria-pressed={isSaved}
          aria-label={isSaved ? 'Saved' : 'Save city'}
          title={isSaved ? 'Saved' : 'Save city'}
          className={`flex shrink-0 items-center justify-center rounded-lg border transition-colors ${sheet ? 'h-11 w-11' : 'h-9 w-9'} ${
            isSaved ? 'border-primary/50 bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} />
        </button>
      </div>

      {!sheet && !pinned && <p className="mt-3 text-[11px] text-muted-foreground">Click the dot to keep this card open.</p>}
    </motion.div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="dns-num truncate text-base text-foreground">{value}</dd>
    </div>
  );
}
