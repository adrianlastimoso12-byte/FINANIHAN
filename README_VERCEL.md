# FINANIHAN — Vercel Ready

This version is prepared for a GitHub -> Vercel deployment and uses **real email OTP** through Vercel Functions + Resend.

## Files that matter
- `index.html` — FINANIHAN frontend
- `api/send-otp.js` — sends a 6-digit email OTP
- `api/verify-otp.js` — verifies the signed OTP challenge
- `vercel.json` — Vercel configuration

## Vercel environment variables
In Vercel: Project -> Settings -> Environment Variables, add:

- `RESEND_API_KEY` — your Resend API key
- `OTP_SECRET` — a long random secret (32+ random characters)
- `OTP_FROM_EMAIL` — a sender that Resend allows, e.g. `FINANIHAN <no-reply@yourdomain.com>`

Apply them to **Production** (and Preview if you want OTP in preview deployments), then redeploy.

## Resend
Create a Resend account, create an API key, and verify a sending domain if you want to send from your own FINANIHAN address. Keep the API key only in Vercel Environment Variables; never put it in `index.html`.

## Test after deployment
1. Open `https://YOUR-VERCEL-DOMAIN.vercel.app/api/send-otp` in the browser. GET should return Method not allowed; that confirms the route exists.
2. Open FINANIHAN -> Register -> enter a real email -> Send OTP.
3. Check Inbox/Spam and enter the 6-digit code.
4. The page should show the email as verified before account creation.

## Responsive UI
The frontend includes responsive rules for desktop, laptop, tablet, phone, portrait, and landscape layouts. Tables remain horizontally scrollable on small displays; dashboards change navigation layout; modals use dynamic viewport height and safe-area padding.

## Important production limitation
User accounts, products, orders, inventory, and subscriptions still live in browser localStorage. That means different devices do not share the same marketplace data. For a true multi-user production site, migrate those records to Supabase/PostgreSQL/Firebase and move password authentication server-side.
