const crypto = require('crypto');

const b64url = (s) => Buffer.from(s).toString('base64url');
const sign = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({error:'Method not allowed'}) };
  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return { statusCode: 400, body: JSON.stringify({error:'Valid email required'}) };
    const apiKey = process.env.RESEND_API_KEY;
    const secret = process.env.OTP_SECRET;
    const from = process.env.OTP_FROM_EMAIL;
    if (!apiKey || !secret || !from) return { statusCode: 503, body: JSON.stringify({error:'Email OTP service is not configured'}) };
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const exp = Date.now() + 10 * 60 * 1000;
    const hash = crypto.createHash('sha256').update(otp + secret).digest('hex');
    const payload = b64url(JSON.stringify({email:String(email).toLowerCase(),hash,exp}));
    const challenge = payload + '.' + sign(payload, secret);
    const response = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({from,to:[email],subject:'Your FINANIHAN verification code',html:`<div style="font-family:Arial,sans-serif"><h2>FINANIHAN Email Verification</h2><p>Your one-time verification code is:</p><div style="font-size:32px;font-weight:800;letter-spacing:6px">${otp}</div><p>This code expires in 10 minutes.</p></div>`})
    });
    if (!response.ok) return { statusCode: 502, body: JSON.stringify({error:'Email provider rejected the request'}) };
    return { statusCode: 200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({challenge}) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({error:'Unable to send OTP'}) };
  }
};
