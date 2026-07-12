// api/booking/create.js - Create booking in admin's calendar

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { summary, startTime, endTime, description, clientName, clientEmail } = req.body;

    if (!summary || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get admin's access token from cookies
    let accessToken = req.cookies.admin_access_token;
    const refreshToken = req.cookies.admin_refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Admin calendar not configured' });
    }

    // If access token expired, refresh it
    if (!accessToken) {
      const refreshResult = await refreshAdminToken(refreshToken, res);
      if (!refreshResult.success) {
        return res.status(401).json({ error: 'Failed to refresh token' });
      }
      accessToken = refreshResult.accessToken;
    }

    // Create event in admin's calendar
    const eventBody = {
      summary: `Booking: ${summary}`,
      description: description || `Booked by ${clientName}`,
      start: {
        dateTime: startTime,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/New_York',
      },
      attendees: clientEmail ? [{ email: clientEmail, responseStatus: 'needsAction' }] : [],
      reminders: {
        useDefault: true,
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token invalid, try to refresh and retry
        if (refreshToken) {
          const refreshResult = await refreshAdminToken(refreshToken, res);
          if (refreshResult.success) {
            const retryResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${refreshResult.accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(eventBody),
            });

            if (retryResponse.ok) {
              const event = await retryResponse.json();
              return res.status(200).json({
                success: true,
                eventId: event.id,
                message: 'Booking confirmed!',
              });
            }
          }
        }
        return res.status(401).json({ error: 'Calendar access expired' });
      }

      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const event = await response.json();

    return res.status(200).json({
      success: true,
      eventId: event.id,
      message: 'Booking confirmed!',
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
}

async function refreshAdminToken(refreshToken, res) {
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

    // Update cookie with new access token
    res.setHeader('Set-Cookie',
      `admin_access_token=${tokens.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${tokens.expires_in}`
    );

    return { success: true, accessToken: tokens.access_token };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { success: false };
  }
}
