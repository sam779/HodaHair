// api/admin/auth.js - Handle customer's one-time Google Calendar authorization

export default async function handler(req, res) {
  try {
    // Handle both GET (from Google redirect) and POST (from frontend)
    let code;

    if (req.method === 'GET') {
      // Google redirects with code in query parameters
      code = req.query.code;
      const error = req.query.error;

      if (error) {
        return res.redirect(302, `/admin?error=${encodeURIComponent(error)}`);
      }
    } else if (req.method === 'POST') {
      // Frontend sends code in request body
      code = req.body.code;
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

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
        redirect_uri: process.env.GOOGLE_ADMIN_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange error:', error);
      if (req.method === 'GET') {
        return res.redirect(302, `/admin-setup.html?error=Token exchange failed`);
      }
      return res.status(tokenResponse.status).json(error);
    }

    const tokens = await tokenResponse.json();

    // Get user info to store with the token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const userInfo = await userInfoResponse.json();

    // Store tokens persistently so all client sessions can use them
    try {
      await fetch(new URL('/api/admin/store-token', `https://${req.headers.host}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token,
          expiresIn: tokens.expires_in,
        }),
      });
    } catch (error) {
      console.error('Failed to store token:', error);
    }

    // Also set cookies for admin access
    res.setHeader('Set-Cookie', [
      `admin_access_token=${tokens.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${tokens.expires_in}`,
      `admin_refresh_token=${tokens.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
      `admin_email=${userInfo.email}; Path=/; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
    ]);

    // If this is a GET request from Google redirect, redirect to success page
    if (req.method === 'GET') {
      return res.redirect(302, `/admin?success=true`);
    }

    // If this is a POST request, return JSON
    return res.status(200).json({
      success: true,
      message: 'Admin authorization successful',
      email: userInfo.email,
    });
  } catch (error) {
    console.error('Admin auth error:', error);

    if (req.method === 'GET') {
      return res.redirect(302, `/admin?error=Authentication failed`);
    }

    return res.status(500).json({ error: 'Authentication failed' });
  }
}
