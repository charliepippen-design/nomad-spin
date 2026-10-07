import { Link } from 'react-router-dom';
import { Check, Wifi } from 'lucide-react';
import type { City } from '@/data/cities';
import { getCityThumbnailUrl } from '@/data/cityImages';
import { cityPath } from '@/lib/citySlug';
import NomadImage from '@/components/common/NomadImage';

interface CityCardProps {
  city: City;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export default function CityCard({ city, isSelected, onToggleSelect }: CityCardProps) {
  return (
    <div
      className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden group transition-all select-none ${
        isSelected
          ? 'border-2 border-blue-500 ring-1 ring-blue-500/40'
          : 'border border-white/10 hover:border-white/40'
      }`}
    >
      <NomadImage
        src={getCityThumbnailUrl(city.id, city.region)}
        cityName={city.name}
        countryName={city.country}
        alt={`${city.name}, ${city.country}`}
        className="absolute inset-0 w-full h-full object-cover aspect-[3/4] transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none z-[2]" />

      <Link
        to={cityPath(city)}
        className="absolute inset-0 z-10"
        aria-label={`${city.name}, ${city.country}. $${city.costUSD} per month.`}
      />

      <button
        type="button"
        onClick={() => onToggleSelect(city.id)}
        className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-20 w-4 sm:w-5 h-4 sm:h-5 rounded border flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-primary border-primary'
            : 'border-white/40 bg-black/40 backdrop-blur-sm'
        }`}
        aria-label={isSelected ? `Remove ${city.name} from compare` : `Add ${city.name} to compare`}
        aria-pressed={isSelected}
      >
        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
      </button>

      <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex items-center gap-0.5 sm:gap-1 text-white z-10 pointer-events-none">
        <Wifi className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
        <span className="text-[8px] sm:text-[10px] font-bold">{city.internetMbps}</span>
      </div>

      <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 flex flex-col z-10 max-w-[60%] pointer-events-none">
        <span className="text-white font-bold text-xs sm:text-sm leading-tight truncate">{city.name}</span>
        <span className="text-white/70 text-[8px] sm:text-[10px] truncate">{city.country}</span>
      </div>

      <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex flex-col items-end gap-0.5 sm:gap-1 z-10 pointer-events-none">
        <span className="text-[8px] sm:text-[10px] bg-black/50 backdrop-blur-md px-1 sm:px-1.5 py-0.5 rounded text-white">
          {city.weather.tempAvgC}° avg
        </span>
        <span className="text-[10px] sm:text-xs font-extrabold text-white">${city.costUSD}/mo</span>
      </div>
    </div>
  );
}
