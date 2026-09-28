import crypto from 'node:crypto';

const sign = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');
const safeEqual = (a, b) => {
  try {
    const aa = Buffer.from(String(a));
    const bb = Buffer.from(String(b));
    return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
  } catch {
    return false;
  }
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const challenge = String(req.body?.challenge || '').trim();
    const secret = process.env.OTP_SECRET;

    if (!secret) return res.status(503).json({ error: 'OTP verification is not configured in Vercel.' });
    if (!email || !/^\d{6}$/.test(otp) || !challenge) {
      return res.status(400).json({ error: 'Email, OTP, and challenge are required.' });
    }

    const [payload, signature] = challenge.split('.');
    if (!payload || !signature || !safeEqual(sign(payload, secret), signature)) {
      return res.status(400).json({ error: 'Invalid OTP challenge.' });
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() > Number(data.exp || 0)) return res.status(400).json({ error: 'OTP has expired. Request a new code.' });
    if (String(data.email || '').toLowerCase() !== email) return res.status(400).json({ error: 'Email does not match this OTP.' });

    const hash = crypto.createHash('sha256').update(`${email}:${otp}:${secret}`).digest('hex');
    if (!safeEqual(hash, data.hash)) return res.status(400).json({ error: 'Incorrect OTP.' });

    return res.status(200).json({ verified: true });
  } catch (error) {
    console.error('verify-otp error:', error);
    return res.status(400).json({ error: 'OTP verification failed.' });
  }
}
