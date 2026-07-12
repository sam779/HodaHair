// api/calendar.js - Handle calendar operations (get availability, create bookings)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, accessToken, timeMin, timeMax, summary, startTime, endTime, description, clientEmail } = req.body;

    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }

    if (action === 'getAvailability') {
      return handleGetAvailability(accessToken, timeMin, timeMax, res);
    }

    if (action === 'bookSlot') {
      return handleBookSlot(accessToken, summary, startTime, endTime, description, clientEmail, res);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Calendar error:', error);
    return res.status(500).json({ error: 'Calendar operation failed' });
  }
}

async function handleGetAvailability(accessToken, timeMin, timeMax, res) {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({ error: 'Token expired or invalid' });
      }
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    const events = data.items || [];

    // Filter events within the requested time range
    const filteredEvents = events.filter(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      const rangeStart = new Date(timeMin);
      const rangeEnd = new Date(timeMax);

      return eventStart < rangeEnd && eventEnd > rangeStart;
    });

    return res.status(200).json({
      events: filteredEvents,
      busy: filteredEvents.map(e => ({
        start: e.start.dateTime || e.start.date,
        end: e.end.dateTime || e.end.date,
        title: e.summary,
      })),
    });
  } catch (error) {
    console.error('Get availability error:', error);
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
}

async function handleBookSlot(accessToken, summary, startTime, endTime, description, clientEmail, res) {
  try {
    const eventBody = {
      summary: `Booking: ${summary}`,
      description: description || 'Booked via Hoda Hair website',
      start: {
        dateTime: startTime,
        timeZone: 'America/New_York', // Adjust to customer's timezone
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
        return res.status(401).json({ error: 'Token expired or invalid' });
      }
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const event = await response.json();

    return res.status(200).json({
      success: true,
      eventId: event.id,
      eventLink: event.htmlLink,
      message: 'Booking confirmed! Check your email for details.',
    });
  } catch (error) {
    console.error('Book slot error:', error);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
}
