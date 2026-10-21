import type { Json } from '@/integrations/supabase/types';

/**
 * Convert a plain serialisable value (e.g. a City interface) into the
 * Supabase `Json` column type without a cast. supabase-js JSON-encodes the
 * payload anyway, so the round trip produces the exact same wire data.
 */
export function toJson<T>(value: T): Json {
  const json: Json = JSON.parse(JSON.stringify(value));
  return json;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
