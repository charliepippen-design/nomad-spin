import { Wifi, Check } from 'lucide-react';
import type { MockCity } from '@/data/mockCities';
import NomadImage from '@/components/common/NomadImage';

interface CityCardProps {
  city: MockCity;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export default function CityCard({ city, isSelected, onToggleSelect }: CityCardProps) {
  return (
    <div
      className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer transition-all select-none ${
        isSelected
          ? 'border-2 border-blue-500 ring-1 ring-blue-500/40'
          : 'border border-white/10 hover:border-white/40'
      }`}
      onClick={() => onToggleSelect(city.id)}
    >
      <NomadImage
        src={city.imageUrl}
        cityName={city.name}
        countryName={city.country}
        className="absolute inset-0 w-full h-full object-cover aspect-[3/4] transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none z-[2]" />

      {/* Selection checkbox */}
      <div
        className={`absolute top-2 left-2 z-20 w-5 h-5 rounded border flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-primary border-primary'
            : 'border-white/30 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100'
        }`}
      >
        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>

      {/* Rank */}
      <div className="absolute top-2 left-9 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white z-10">
        #{city.rank}
      </div>

      {/* Wifi */}
      <div className="absolute top-2 right-2 flex items-center gap-1 text-white z-10">
        <Wifi className="w-3 h-3" />
        <span className="text-[10px] font-bold">{city.internetMbps} Mbps</span>
      </div>

      {/* City info */}
      <div className="absolute bottom-2 left-2 flex flex-col z-10">
        <span className="text-white font-bold text-sm leading-tight">{city.name}</span>
        <span className="text-white/70 text-[10px]">{city.country}</span>
      </div>

      {/* Cost & Weather */}
      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 z-10">
        <span className="text-[10px] bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded text-white">
          {city.weatherIcon} {city.tempC}°C
        </span>
        <span className="text-xs font-extrabold text-white">${city.monthlyCost}/mo</span>
      </div>
    </div>
  );
}
