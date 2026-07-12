// api/auth.js - Handle Google OAuth token exchange

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange error:', error);
      return res.status(tokenResponse.status).json(error);
    }

    const tokens = await tokenResponse.json();

    // Return tokens to frontend (they will be stored client-side with proper handling)
    res.setHeader('Set-Cookie', [
      `refresh_token=${tokens.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
      `access_token=${tokens.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${tokens.expires_in}`,
    ]);

    return res.status(200).json({
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
      refreshToken: tokens.refresh_token,
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
