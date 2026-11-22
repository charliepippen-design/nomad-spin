import { cities } from '@/data/cities';
import { cityToOrigin, origins, type Origin } from '@/data/origins';

/**
 * Resolve a stored origin id. The picker offers the hub list plus every city
 * in the dataset, so both have to be searched.
 */
export function findOriginById(id: string | null | undefined): Origin | null {
  if (!id) return null;
  const hub = origins.find((o) => o.id === id);
  if (hub) return hub;
  const city = cities.find((c) => c.id === id);
  return city ? cityToOrigin(city) : null;
}
