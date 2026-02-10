
-- Tighten INSERT/UPDATE to service role only (anon/authenticated cannot write)
DROP POLICY "Service role can insert cached images" ON public.city_image_cache;
DROP POLICY "Service role can update cached images" ON public.city_image_cache;

CREATE POLICY "Only service role can insert cached images"
  ON public.city_image_cache
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Only service role can update cached images"
  ON public.city_image_cache
  FOR UPDATE
  TO service_role
  USING (true);
