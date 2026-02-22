export interface MockCity {
  id: string;
  rank: number;
  name: string;
  country: string;
  monthlyCost: number;
  internetMbps: number;
  tempC: number;
  weatherIcon: '☀️' | '⛅' | '🌧️';
  imageUrl: string;
}

export const mockCities: MockCity[] = [
  { id: '1', rank: 1, name: 'Asunción', country: 'Paraguay', monthlyCost: 1150, internetMbps: 85, tempC: 28, weatherIcon: '☀️', imageUrl: 'https://images.unsplash.com/photo-1629853380026-6b2191b29cc3?q=80&w=1080&auto=format&fit=crop' },
  { id: '2', rank: 2, name: 'Da Nang', country: 'Vietnam', monthlyCost: 1139, internetMbps: 65, tempC: 27, weatherIcon: '⛅', imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1080&auto=format&fit=crop' },
  { id: '3', rank: 3, name: 'Lisbon', country: 'Portugal', monthlyCost: 3938, internetMbps: 120, tempC: 18, weatherIcon: '☀️', imageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=1080&auto=format&fit=crop' },
  { id: '4', rank: 4, name: 'Medellín', country: 'Colombia', monthlyCost: 1450, internetMbps: 55, tempC: 22, weatherIcon: '⛅', imageUrl: 'https://images.unsplash.com/photo-1599077803455-5ac8f239de3c?q=80&w=1080&auto=format&fit=crop' },
  { id: '5', rank: 5, name: 'Bangkok', country: 'Thailand', monthlyCost: 1680, internetMbps: 90, tempC: 32, weatherIcon: '☀️', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1080&auto=format&fit=crop' },
  { id: '6', rank: 6, name: 'Buenos Aires', country: 'Argentina', monthlyCost: 1320, internetMbps: 50, tempC: 24, weatherIcon: '☀️', imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=1080&auto=format&fit=crop' },
  { id: '7', rank: 7, name: 'Tbilisi', country: 'Georgia', monthlyCost: 1100, internetMbps: 45, tempC: 15, weatherIcon: '⛅', imageUrl: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=1080&auto=format&fit=crop' },
  { id: '8', rank: 8, name: 'Mexico City', country: 'Mexico', monthlyCost: 1750, internetMbps: 60, tempC: 20, weatherIcon: '⛅', imageUrl: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?q=80&w=1080&auto=format&fit=crop' },
  { id: '9', rank: 9, name: 'Chiang Mai', country: 'Thailand', monthlyCost: 980, internetMbps: 70, tempC: 30, weatherIcon: '☀️', imageUrl: 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?q=80&w=1080&auto=format&fit=crop' },
  { id: '10', rank: 10, name: 'Porto', country: 'Portugal', monthlyCost: 2800, internetMbps: 110, tempC: 16, weatherIcon: '🌧️', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1080&auto=format&fit=crop' },
  { id: '11', rank: 11, name: 'Cali', country: 'Colombia', monthlyCost: 1200, internetMbps: 40, tempC: 25, weatherIcon: '☀️', imageUrl: 'https://images.unsplash.com/photo-1624204719282-dae70e53ccb4?q=80&w=1080&auto=format&fit=crop' },
  { id: '12', rank: 12, name: 'Ho Chi Minh City', country: 'Vietnam', monthlyCost: 1250, internetMbps: 75, tempC: 31, weatherIcon: '☀️', imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1080&auto=format&fit=crop' },
  { id: '13', rank: 13, name: 'Cape Town', country: 'South Africa', monthlyCost: 1900, internetMbps: 55, tempC: 21, weatherIcon: '☀️', imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=1080&auto=format&fit=crop' },
  { id: '14', rank: 14, name: 'Budapest', country: 'Hungary', monthlyCost: 2200, internetMbps: 100, tempC: 12, weatherIcon: '⛅', imageUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1080&auto=format&fit=crop' },
  { id: '15', rank: 15, name: 'Kuala Lumpur', country: 'Malaysia', monthlyCost: 1400, internetMbps: 80, tempC: 30, weatherIcon: '🌧️', imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1080&auto=format&fit=crop' },
];
