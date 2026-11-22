-- The streak and the spin counter were removed from the app (November 2026).
-- New accounts no longer get a user_streaks row, and a missing name is stored
-- as NULL instead of the old placeholder.
--
-- Written for the project in the site owner's own Supabase account, which starts
-- empty. On a database that still holds real streak data, back the table up first.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NULLIF(btrim(NEW.raw_user_meta_data->>'display_name'), ''));
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TABLE IF EXISTS public.user_streaks;
