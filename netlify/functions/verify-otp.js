const crypto = require('crypto');

const sign = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');
const safeEqual = (a,b) => { try { const aa=Buffer.from(a), bb=Buffer.from(b); return aa.length===bb.length && crypto.timingSafeEqual(aa,bb); } catch { return false; } };

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({error:'Method not allowed'}) };
  try {
    const { email, otp, challenge } = JSON.parse(event.body || '{}');
    const secret = process.env.OTP_SECRET;
    if (!secret) return { statusCode: 503, body: JSON.stringify({error:'OTP verification is not configured'}) };
    if (!challenge || !/^\d{6}$/.test(String(otp||''))) return { statusCode: 400, body: JSON.stringify({error:'OTP and challenge are required'}) };
    const [payload,sig] = String(challenge).split('.');
    if (!payload || !sig || !safeEqual(sign(payload,secret),sig)) return { statusCode: 400, body: JSON.stringify({error:'Invalid OTP challenge'}) };
    const data = JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
    if (Date.now() > Number(data.exp||0)) return { statusCode: 400, body: JSON.stringify({error:'OTP has expired'}) };
    if (String(data.email).toLowerCase() !== String(email||'').toLowerCase()) return { statusCode: 400, body: JSON.stringify({error:'Email does not match OTP challenge'}) };
    const hash = crypto.createHash('sha256').update(String(otp)+secret).digest('hex');
    if (!safeEqual(hash,data.hash)) return { statusCode: 400, body: JSON.stringify({error:'Incorrect OTP'}) };
    return { statusCode: 200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({verified:true}) };
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({error:'OTP verification failed'}) };
  }
};
