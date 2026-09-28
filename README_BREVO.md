# FINANIHAN — Brevo + Vercel Email OTP

This build uses **Brevo Transactional Email API** for the registration OTP and is ready for GitHub -> Vercel deployment.

## 1. Create a Brevo account
Create a Brevo account and use the Free plan if it is enough for your project.

## 2. Create and verify a Sender in Brevo
In Brevo:

**Settings -> Senders, Domains & Dedicated IPs -> Senders -> Add a sender**

Example:
- From name: `FINANIHAN`
- From email: your own Gmail/Outlook address for testing, e.g. `yourname@gmail.com`

If the sender domain is not authenticated, Brevo can ask you to verify the sender by entering the 6-digit code sent to that address.

For a school/demo project, a verified free-email sender can be used. Brevo may replace the visible From address with one of its compliant sender addresses. For best production deliverability, use a custom authenticated domain later.

## 3. Create a Brevo API key
In Brevo:

**SMTP & API -> API Keys -> Generate a new API key**

Copy the API key once. Do not put it in `index.html` or GitHub.

## 4. Configure Vercel Environment Variables
In Vercel:

**FINANIHAN project -> Settings -> Environment Variables**

Add:

- `BREVO_API_KEY` = your Brevo API key
- `OTP_SECRET` = a long random secret
- `BREVO_FROM_EMAIL` = the exact sender email you verified in Brevo
- `BREVO_FROM_NAME` = `FINANIHAN` (optional)

Apply at least to **Production**. Enable **Preview** too if you test preview deployments.

Generate `OTP_SECRET` in the VS Code PowerShell terminal with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. Remove old Resend variables
These are no longer used and can be deleted from Vercel:

- `RESEND_API_KEY`
- `OTP_FROM_EMAIL`

Keep `OTP_SECRET`.

## 6. Push this project to GitHub
From the project folder:

```powershell
git add .
git commit -m "Switch FINANIHAN OTP to Brevo"
git push
```

Vercel should deploy automatically.

## 7. Redeploy after adding environment variables
If you added or changed Vercel Environment Variables after the latest deployment, redeploy the latest Production deployment.

## 8. Test
Open FINANIHAN -> Register -> enter a valid email -> **Send OTP**.

Expected flow:

1. Browser POSTs to `/api/send-otp`
2. Vercel Function generates a 6-digit code
3. Vercel calls Brevo Transactional Email API
4. Brevo sends the email to the user's address
5. User enters the code
6. Browser POSTs to `/api/verify-otp`
7. FINANIHAN marks the email as verified

The code expires after 10 minutes.

## Files
- `index.html` — responsive FINANIHAN frontend
- `api/send-otp.js` — sends OTP through Brevo
- `api/verify-otp.js` — verifies signed OTP challenges
- `vercel.json` — Vercel configuration

## Important
The email OTP is server-side, but the rest of the current FINANIHAN data is still stored in browser localStorage. For a true shared online marketplace across devices, move users, products, orders, sales, addresses, and subscriptions to a shared database later.
