/**
 * Date of the last change to the city dataset (src/data/cities*).
 * Bump it by hand whenever a city record or a visa rule changes.
 * It is shown on city pages and used as <lastmod> for them in the sitemap.
 * It is a "last changed" date, not a claim that every figure was re-checked.
 */
export const DATASET_UPDATED = '2026-11-21';

export const DATASET_UPDATED_LABEL = new Date(`${DATASET_UPDATED}T12:00:00Z`).toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
