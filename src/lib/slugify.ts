/** Letters that Unicode NFD does not decompose into ASCII + combining mark. */
const SPECIAL_CHARS: Record<string, string> = {
  ø: 'o', æ: 'ae', œ: 'oe', ß: 'ss', ł: 'l', đ: 'd', ð: 'd', þ: 'th', ı: 'i', ħ: 'h',
};

/**
 * URL slug with accents folded to ASCII: "Medellín" → "medellin",
 * "São Paulo" → "sao-paulo", "Tórshavn (Faroe Islands)" → "torshavn-faroe-islands".
 */
export function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[øæœßłđðþıħ]/g, (ch) => SPECIAL_CHARS[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * The pre-NFD slug algorithm (accented letters became hyphens, e.g.
 * "Medellín" → "medell-n"). Kept only so old links can be redirected.
 */
export function legacySlugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Lowercase path slug that keeps accented letters.
 * "São Paulo" -> "são-paulo", "Medellín" -> "medellín".
 */
export function accentPreservingSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '');
}
