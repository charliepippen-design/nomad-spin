export interface Origin {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const origins: Origin[] = [
  { id: "anywhere", name: "ANYWHERE", country: "", lat: 0, lng: 0 },
  // Americas
  { id: "new-york-us", name: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { id: "san-francisco-us", name: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194 },
  { id: "los-angeles-us", name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437 },
  { id: "miami-us", name: "Miami", country: "USA", lat: 25.7617, lng: -80.1918 },
  { id: "toronto-ca", name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { id: "mexico-city-mx", name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { id: "sao-paulo-br", name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { id: "buenos-aires-ar", name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { id: "asuncion-py", name: "Asunción", country: "Paraguay", lat: -25.2637, lng: -57.5759 },
  { id: "bogota-co", name: "Bogotá", country: "Colombia", lat: 4.711, lng: -74.0721 },
  { id: "lima-pe", name: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428 },
  // Europe
  { id: "london-uk", name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { id: "paris-fr", name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { id: "berlin-de", name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { id: "amsterdam-nl", name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { id: "lisbon-pt", name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { id: "barcelona-es", name: "Barcelona", country: "Spain", lat: 41.3874, lng: 2.1686 },
  { id: "rome-it", name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { id: "milan-it", name: "Milan", country: "Italy", lat: 45.4642, lng: 9.19 },
  { id: "venice-it", name: "Venice", country: "Italy", lat: 45.4408, lng: 12.3155 },
  { id: "treviso-it", name: "Treviso", country: "Italy", lat: 45.6669, lng: 12.243 },
  { id: "vienna-at", name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { id: "zurich-ch", name: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417 },
  { id: "prague-cz", name: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378 },
  { id: "warsaw-pl", name: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122 },
  { id: "budapest-hu", name: "Budapest", country: "Hungary", lat: 47.4979, lng: 19.0402 },
  { id: "stockholm-se", name: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686 },
  { id: "copenhagen-dk", name: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683 },
  { id: "dublin-ie", name: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603 },
  { id: "istanbul-tr", name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
  { id: "athens-gr", name: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275 },
  // Asia & Oceania
  { id: "tokyo-jp", name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { id: "seoul-kr", name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978 },
  { id: "singapore-sg", name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { id: "bangkok-th", name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { id: "mumbai-in", name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777 },
  { id: "dubai-ae", name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { id: "sydney-au", name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { id: "auckland-nz", name: "Auckland", country: "New Zealand", lat: -36.8485, lng: 174.7633 },
  { id: "kuala-lumpur-my", name: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lng: 101.6869 },
  { id: "taipei-tw", name: "Taipei", country: "Taiwan", lat: 25.033, lng: 121.5654 },
  { id: "hong-kong-hk", name: "Hong Kong", country: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  // Middle East & Africa
  { id: "tel-aviv-il", name: "Tel Aviv", country: "Israel", lat: 32.0853, lng: 34.7818 },
  { id: "nairobi-ke", name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219 },
  { id: "cape-town-za", name: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
];

/** Convert a City object to an Origin object */
export function cityToOrigin(city: { id: string; name: string; country: string; lat: number; lng: number }): Origin {
  return { id: city.id, name: city.name, country: city.country, lat: city.lat, lng: city.lng };
}
