# FINANIHAN — Online-Ready Prototype

This build starts with the **Login form** and supports Admin, Farmer, and Consumer roles.

## Added in this update
- Login is required before entering the site.
- Farmer and Consumer registration with email OTP verification.
- Farmer and Consumer log-out controls in the lower-left navigation area.
- Farmer-only Premium at **₱49/month** with start/end subscription dates.
- Premium Farm-to-Income analytics, cost/profit tracking, product insights, and CSV export.
- Farmer-controlled delivery shipping fee and free Pick-up option.
- Consumer receipt breakdown for subtotal, transaction fee, shipping fee, and total.
- Consumer addresses shown in Farmer and Admin order views.
- Day-to-day, weekly, and monthly Sales Activity for Farmer and Admin.
- Admin account deletion for Farmer/Consumer accounts.
- FINANIHAN fee rules implemented in the prototype:
  - 5% farmer commission
  - ₱10 transaction fee for orders ₱300 and below; 3% above ₱300
  - ₱20 optional featured listing fee for farmers
  - ₱5 consumer cancellation fee
  - optional ₱49/month Farmer Premium

## Demo accounts
- Consumer: `consumer@finanihan.com` / `Consumer123!`
- Farmer: `farmer@finanihan.com` / `Farmer123!`
- Admin: `admin@finanihan.com` / `Admin123!`

## Email OTP on Netlify
The package includes `netlify/functions/send-otp.js` and `verify-otp.js`. To send real OTP emails, add these environment variables in Netlify:

- `RESEND_API_KEY` — API key from Resend
- `OTP_SECRET` — a long random secret
- `OTP_FROM_EMAIL` — a verified sender address in Resend, e.g. `FINANIHAN <no-reply@yourdomain.com>`

Without those variables, the frontend automatically enters **Demo OTP mode** and shows the generated code on-screen so the prototype remains testable.

## Put the site online
1. Create a Netlify account.
2. Upload/deploy this entire folder.
3. Add the OTP environment variables above.
4. Netlify provides a public HTTPS URL.
5. Replace `YOUR-DOMAIN.com` in `robots.txt` and `sitemap.xml` after connecting your real domain.
6. Submit the sitemap in Google Search Console / Bing Webmaster Tools for indexing.

## Important production limitation
The marketplace data still uses browser `localStorage`/`sessionStorage`, which is suitable for a prototype but is **not a shared multi-user database**. A real production FINANIHAN site needs a backend/database (for example Supabase, Firebase, or Node.js + PostgreSQL/MySQL) so accounts, products, orders, fees, subscriptions, and inventory are shared across devices. Passwords must also be hashed and stored server-side.

GCash, Maya, and bank options are recorded by the prototype but do not move real money. Live payments require an approved payment gateway, secure server-side keys, and payment webhooks.
