export interface Origin {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const origins: Origin[] = [
  { id: "anywhere", name: "ANYWHERE", country: "", lat: 0, lng: 0 },
  { id: "tokyo-jp", name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { id: "asuncion-py", name: "Asunción", country: "Paraguay", lat: -25.2637, lng: -57.5759 },
  { id: "berlin-de", name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { id: "new-york-us", name: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { id: "london-uk", name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { id: "san-francisco-us", name: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194 },
  { id: "sydney-au", name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { id: "dubai-ae", name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { id: "singapore-sg", name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { id: "bangkok-th", name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { id: "paris-fr", name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { id: "amsterdam-nl", name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { id: "lisbon-pt", name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { id: "toronto-ca", name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { id: "mexico-city-mx", name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { id: "sao-paulo-br", name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { id: "buenos-aires-ar", name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { id: "seoul-kr", name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978 },
  { id: "mumbai-in", name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777 },
  { id: "istanbul-tr", name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
  { id: "nairobi-ke", name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219 },
  { id: "cape-town-za", name: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
  { id: "los-angeles-us", name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437 },
  { id: "miami-us", name: "Miami", country: "USA", lat: 25.7617, lng: -80.1918 },
];
