DROP POLICY IF EXISTS "Service role can insert enrichment cache" ON public.city_enrichment_cache;
DROP POLICY IF EXISTS "Service role can update enrichment cache" ON public.city_enrichment_cache;
DROP POLICY IF EXISTS "Service role can insert cache" ON public.city_enrichment_cache;
DROP POLICY IF EXISTS "Service role can update cache" ON public.city_enrichment_cache;

REVOKE INSERT, UPDATE, DELETE ON public.city_enrichment_cache FROM anon, authenticated;
GRANT SELECT ON public.city_enrichment_cache TO anon, authenticated;
GRANT ALL ON public.city_enrichment_cache TO service_role;

CREATE POLICY "Service role can insert enrichment cache"
ON public.city_enrichment_cache FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update enrichment cache"
ON public.city_enrichment_cache FOR UPDATE TO service_role USING (true) WITH CHECK (true);