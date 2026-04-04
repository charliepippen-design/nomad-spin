export interface FeaturedDestination {
  id: string;
  city: string;
  country: string;
  priceMonthly: number;
  currencySymbol: string;
  imageUrl: string;
  coordinates: { lat: number; lng: number };
  metrics: { internetSpeed: string; safetyRating: string };
}

export const featuredDestinations: FeaturedDestination[] = [
  {
    id: 'dest_buenos_aires',
    city: 'Buenos Aires',
    country: 'Argentina',
    priceMonthly: 900,
    currencySymbol: '$',
    imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&fit=crop&auto=format&q=80',
    coordinates: { lat: -34.6037, lng: -58.3816 },
    metrics: { internetSpeed: 'Fast', safetyRating: 'Moderate' },
  },
  {
    id: 'dest_bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    priceMonthly: 1100,
    currencySymbol: '$',
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&fit=crop&auto=format&q=80',
    coordinates: { lat: 13.7563, lng: 100.5018 },
    metrics: { internetSpeed: 'Excellent', safetyRating: 'Good' },
  },
  {
    id: 'dest_lisbon',
    city: 'Lisbon',
    country: 'Portugal',
    priceMonthly: 2200,
    currencySymbol: '$',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&fit=crop&auto=format&q=80',
    coordinates: { lat: 38.7223, lng: -9.1393 },
    metrics: { internetSpeed: 'Fast', safetyRating: 'Excellent' },
  },
];
