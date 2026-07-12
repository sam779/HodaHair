// api/booking/availability.js - Get available times from admin's calendar

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeMin, timeMax } = req.body;

    if (!timeMin || !timeMax) {
      return res.status(400).json({ error: 'timeMin and timeMax required' });
    }

    // Get admin's access token from cookies
    let accessToken = req.cookies.admin_access_token;
    const refreshToken = req.cookies.admin_refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Admin calendar not configured. Please complete setup.' });
    }

    // If access token expired, refresh it
    if (!accessToken) {
      const refreshResult = await refreshAdminToken(refreshToken, res);
      if (!refreshResult.success) {
        return res.status(401).json({ error: 'Failed to refresh token' });
      }
      accessToken = refreshResult.accessToken;
    }

    // Fetch calendar events
    const eventsResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!eventsResponse.ok) {
      if (eventsResponse.status === 401) {
        // Token invalid, try to refresh
        if (refreshToken) {
          const refreshResult = await refreshAdminToken(refreshToken, res);
          if (refreshResult.success) {
            // Retry the request with new token
            const retryResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${refreshResult.accessToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              const busy = extractBusySlots(data.items || [], timeMin, timeMax);
              return res.status(200).json({ busy });
            }
          }
        }
        return res.status(401).json({ error: 'Calendar access expired' });
      }

      const error = await eventsResponse.json();
      return res.status(eventsResponse.status).json(error);
    }

    const data = await eventsResponse.json();
    const busy = extractBusySlots(data.items || [], timeMin, timeMax);

    return res.status(200).json({ busy });
  } catch (error) {
    console.error('Availability error:', error);
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
}

function extractBusySlots(events, timeMin, timeMax) {
  const rangeStart = new Date(timeMin);
  const rangeEnd = new Date(timeMax);

  return events
    .filter(event => {
      if (!event.start || !event.end) return false;
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      return eventStart < rangeEnd && eventEnd > rangeStart;
    })
    .map(event => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      title: event.summary,
    }));
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
