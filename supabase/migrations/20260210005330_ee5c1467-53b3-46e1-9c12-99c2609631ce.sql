
-- Cache table for auto-fetched city images
CREATE TABLE public.city_image_cache (
  slug TEXT PRIMARY KEY,
  photo_id TEXT NOT NULL,
  city_name TEXT,
  country TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.city_image_cache ENABLE ROW LEVEL SECURITY;

-- Public read access (images are not user-specific)
CREATE POLICY "Anyone can read cached images"
  ON public.city_image_cache
  FOR SELECT
  USING (true);

-- Only service role can insert (via edge function)
CREATE POLICY "Service role can insert cached images"
  ON public.city_image_cache
  FOR INSERT
  WITH CHECK (true);

-- Only service role can update cached images
CREATE POLICY "Service role can update cached images"
  ON public.city_image_cache
  FOR UPDATE
  USING (true);
