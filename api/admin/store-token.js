// api/admin/store-token.js - Store admin's refresh token in Vercel KV or memory
// This makes the token accessible to all client sessions

let storedRefreshToken = null;
let storedAccessToken = null;
let tokenExpiresAt = null;

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get stored token (used by booking endpoints)
      if (!storedRefreshToken) {
        return res.status(401).json({ error: 'No token stored' });
      }

      // Check if access token is expired
      if (!storedAccessToken || (tokenExpiresAt && Date.now() > tokenExpiresAt)) {
        // Refresh the token
        const refreshed = await refreshToken(storedRefreshToken);
        if (!refreshed.success) {
          return res.status(401).json({ error: 'Token refresh failed' });
        }
        storedAccessToken = refreshed.accessToken;
        tokenExpiresAt = Date.now() + refreshed.expiresIn * 1000;
      }

      return res.status(200).json({
        accessToken: storedAccessToken,
      });
    }

    if (req.method === 'POST') {
      // Store token from admin auth
      const { refreshToken: token, accessToken, expiresIn } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      storedRefreshToken = token;
      storedAccessToken = accessToken;
      tokenExpiresAt = Date.now() + (expiresIn || 3600) * 1000;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Token store error:', error);
    return res.status(500).json({ error: 'Token storage failed' });
  }
}

async function refreshToken(refreshToken) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) {
      return { success: false };
    }

    const tokens = await response.json();
    return {
      success: true,
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
    };
  } catch (error) {
    console.error('Refresh error:', error);
    return { success: false };
  }
}
