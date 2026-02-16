
-- Create city_enrichment_cache table for AI-enriched data
CREATE TABLE public.city_enrichment_cache (
  slug text PRIMARY KEY,
  enrichment_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  fetched_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.city_enrichment_cache ENABLE ROW LEVEL SECURITY;

-- Public read, service_role write (same pattern as city_image_cache)
CREATE POLICY "Anyone can read enrichment cache"
  ON public.city_enrichment_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert enrichment cache"
  ON public.city_enrichment_cache
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only service role can update enrichment cache"
  ON public.city_enrichment_cache
  FOR UPDATE
  USING (true);
