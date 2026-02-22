

# Fix Register and Login Functions

## Root Cause

I found **two critical issues**:

1. **Missing database trigger**: The `on_auth_user_created` trigger does not exist in the live database, even though the migration file defines it. This means when a new user signs up, the automatic creation of their `profiles`, `user_streaks`, and `user_preferences` rows never happens -- causing errors or silent failures.

2. **Email confirmation required**: Email/password signups require email verification before the user can sign in. Since there's no email confirmation flow in the app (no verification page, no resend button), users who register with email+password are stuck -- they can never actually log in.

## Fix

### 1. Re-create the missing trigger (database migration)

Run a migration to recreate the `handle_new_user` function and the `on_auth_user_created` trigger on `auth.users`, so that new signups automatically get their profile, streaks, and preferences rows.

### 2. Enable auto-confirm for email signups

Since the app has no email verification flow, enable auto-confirm so email/password users can sign in immediately after registering. This matches the Google OAuth behavior (which already auto-confirms).

### 3. Improve error handling in AuthModal

Update `AuthModal.tsx` to show clearer error messages and handle edge cases (e.g., "Email not confirmed" errors, duplicate email signups).

---

## Files and Changes

| What | Where | Change |
|---|---|---|
| Recreate trigger | New database migration | `CREATE OR REPLACE FUNCTION handle_new_user()` + `CREATE TRIGGER on_auth_user_created` (with `IF NOT EXISTS` / drop-and-recreate) |
| Auto-confirm emails | Auth configuration | Enable auto-confirm for email signups |
| Better error UX | `src/components/AuthModal.tsx` | Show user-friendly messages for common auth errors (duplicate email, wrong password, unconfirmed email) |

## Technical Details

### Database Migration SQL
```sql
-- Recreate the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'OPERATIVE'));
  INSERT INTO public.user_streaks (user_id)
  VALUES (NEW.id);
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### AuthModal error mapping
Map common Supabase auth error messages to friendly text:
- "User already registered" -> "This email is already registered. Try signing in instead."
- "Invalid login credentials" -> "Wrong email or password. Please try again."
- "Email not confirmed" -> "Please check your email to verify your account."

