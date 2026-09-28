import crypto from 'node:crypto';

const b64url = (s) => Buffer.from(s).toString('base64url');
const sign = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const secret = process.env.OTP_SECRET;
    const from = process.env.OTP_FROM_EMAIL;
    if (!apiKey || !secret || !from) {
      return res.status(503).json({ error: 'Email OTP service is not configured in Vercel.' });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const exp = Date.now() + 10 * 60 * 1000;
    const hash = crypto.createHash('sha256').update(`${email}:${otp}:${secret}`).digest('hex');
    const payload = b64url(JSON.stringify({ email, hash, exp }));
    const challenge = `${payload}.${sign(payload, secret)}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Your FINANIHAN verification code',
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#1c2b24"><h2 style="color:#0b5d3b">FINANIHAN Email Verification</h2><p>Use this one-time code to verify your FINANIHAN account:</p><div style="font-size:34px;font-weight:800;letter-spacing:7px;background:#f2faf5;border:1px solid #dfe9e2;border-radius:12px;padding:18px;text-align:center">${otp}</div><p>This code expires in 10 minutes.</p><p style="font-size:12px;color:#708078">If you did not request this code, you can ignore this email.</p></div>`
      })
    });

    const provider = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Resend error:', provider);
      return res.status(502).json({ error: provider?.message || 'Email provider rejected the request.' });
    }

    return res.status(200).json({ challenge, expiresIn: 600 });
  } catch (error) {
    console.error('send-otp error:', error);
    return res.status(500).json({ error: 'Unable to send OTP.' });
  }
}
