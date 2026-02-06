/** Haversine distance in km between two lat/lng pairs */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Rough flight cost estimate based on distance */
export function estimateFlightCost(distKm: number): number {
  if (distKm < 500) return 80;
  if (distKm < 2000) return 200;
  if (distKm < 5000) return 450;
  if (distKm < 10000) return 750;
  return 1100;
}
