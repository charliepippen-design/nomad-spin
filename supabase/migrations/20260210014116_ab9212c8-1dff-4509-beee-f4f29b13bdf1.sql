
-- Add photographer attribution and Unsplash URL columns
ALTER TABLE public.city_image_cache
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS photographer_name TEXT,
  ADD COLUMN IF NOT EXISTS photographer_url TEXT,
  ADD COLUMN IF NOT EXISTS unsplash_url TEXT,
  ADD COLUMN IF NOT EXISTS download_location TEXT;
