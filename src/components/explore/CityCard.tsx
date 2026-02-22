import { Wifi, Check } from 'lucide-react';
import type { MockCity } from '@/data/mockCities';

interface CityCardProps {
  city: MockCity;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export default function CityCard({ city, isSelected, onToggleSelect }: CityCardProps) {
  return (
    <div
      className="relative w-full aspect-[4/5] rounded-xl overflow-hidden group cursor-pointer border border-white/10 hover:border-white/30 transition-all"
      onClick={() => onToggleSelect(city.id)}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${city.imageUrl})` }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

      {/* Selection checkbox — visible on hover or when selected */}
      <div
        className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-primary border-primary'
            : 'border-white/30 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100'
        }`}
      >
        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>

      {/* Rank badge — shifted right when checkbox is visible */}
      <span className="absolute top-2 left-9 text-[10px] font-bold bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-white z-10">
        #{city.rank}
      </span>

      {/* Wifi — top right */}
      <div className="absolute top-2 right-2 flex items-center gap-1 text-white z-10">
        <Wifi className="w-3 h-3" />
        <span className="text-[10px] font-bold">{city.internetMbps} Mbps</span>
      </div>

      {/* Weather — mid right */}
      <div className="absolute top-8 right-2 text-sm z-10">
        {city.weatherIcon} {city.tempC}°
      </div>

      {/* Bottom left — Name & Country */}
      <div className="absolute bottom-2 left-2 z-10">
        <h3 className="text-lg font-bold text-white leading-none">{city.name}</h3>
        <p className="text-xs text-white/70 mt-0.5">{city.country}</p>
      </div>

      {/* Bottom right — Cost */}
      <span className="absolute bottom-2 right-2 text-xs font-bold text-white bg-black/50 backdrop-blur-md px-2 py-1 rounded-md z-10">
        ${city.monthlyCost}/mo
      </span>
    </div>
  );
}
