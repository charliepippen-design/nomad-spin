
## Send Contact Form Messages to Your Email

Currently the contact form uses a `mailto:` link which opens the user's email client — not ideal. Instead, we'll create a backend function that sends the form data directly to `info@digitalnomadspin.com` using the Resend email service.

### How It Will Work

1. User fills out the contact form (Name, Email, Message)
2. On submit, the form calls a backend function
3. The backend function sends a nicely formatted email to `info@digitalnomadspin.com`
4. User sees a "Thank you" confirmation

### What's Needed

**A Resend API key** — Resend is a simple email delivery service with a generous free tier (100 emails/day). You'll need to:
1. Sign up at [resend.com](https://resend.com) (free)
2. Get your API key
3. Verify a sending domain (or use the free `onboarding@resend.dev` sender for testing)

### Changes

| File | Change |
|---|---|
| `supabase/functions/send-contact/index.ts` | **New** — Edge function that receives form data and sends an email via Resend API to `info@digitalnomadspin.com` |
| `src/pages/Contact.tsx` | Update `handleSubmit` to call the edge function instead of `mailto:`, add loading state and error handling |

### Technical Details

- The edge function validates inputs (name, email, message) server-side
- Email is sent with the user's name/email in the body so you can reply directly
- The form UI stays exactly as shown in your screenshot — no visual changes
- A new secret `RESEND_API_KEY` will need to be added to the project
