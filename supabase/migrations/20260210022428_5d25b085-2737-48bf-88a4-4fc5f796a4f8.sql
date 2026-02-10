ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS email_recap boolean NOT NULL DEFAULT false;