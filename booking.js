// booking.js - Frontend booking widget logic

const CLIENT_ID = '101202414160-tm8palr7hk0jsqfjdgb75rsui1c0nt12.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin + '/api/auth';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

let accessToken = null;
let refreshToken = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupSignInButton();
  checkForAuthCode();
});

function setupSignInButton() {
  const signInButton = document.getElementById('googleSignIn');
  if (signInButton) {
    signInButton.addEventListener('click', initiateOAuthFlow);
    signInButton.textContent = 'Sign in with Google to Book';
  }
}

function initiateOAuthFlow() {
  // Construct OAuth 2.0 authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function checkForAuthCode() {
  // After redirect back from Google, check for auth result
  const params = new URLSearchParams(window.location.search);
  const authSuccess = params.get('auth') === 'success';
  const authError = params.get('auth') === 'error';
  const page = params.get('page');

  if (authError) {
    console.error('OAuth error during authentication');
    alert('Authentication failed. Please try again.');
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  if (authSuccess) {
    // Tokens are already set in secure cookies by backend
    // Navigate to contact page if specified
    if (page === 'contact') {
      changePage('contact');
    }

    // Show the booking widget
    toggleBookingUI(true);
    loadAvailableDates();

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Export changePage for use in this file
function changePage(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show selected page
  document.getElementById(page).classList.add('active');

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'auto' });
}

async function exchangeCodeForTokens(code) {
  try {
    const result = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!result.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await result.json();
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Show booking widget
    toggleBookingUI(true);
    await loadAvailableDates();
  } catch (error) {
    console.error('Token exchange error:', error);
    alert('Failed to authenticate. Please try again.');
  }
}

function toggleBookingUI(show) {
  const authSection = document.getElementById('auth-section');
  const bookingSection = document.getElementById('booking-section');

  if (show) {
    authSection.style.display = 'none';
    bookingSection.style.display = 'block';
  } else {
    authSection.style.display = 'block';
    bookingSection.style.display = 'none';
    accessToken = null;
    refreshToken = null;
  }
}

function setupEventListeners() {
  const dateInput = document.getElementById('selectedDate');
  const confirmBtn = document.getElementById('confirmBooking');
  const signOutBtn = document.getElementById('signOutBtn');

  if (dateInput) {
    dateInput.addEventListener('change', loadAvailableSlots);
    dateInput.min = new Date().toISOString().split('T')[0]; // Disable past dates
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmBooking);
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      google.accounts.id.disableAutoSelect();
      toggleBookingUI(false);
    });
  }
}

async function loadAvailableDates() {
  // This is optional - if you want to disable fully booked dates
  // For now, we'll just set up the date input to be usable
  const dateInput = document.getElementById('selectedDate');
  if (dateInput) {
    dateInput.focus();
  }
}

async function loadAvailableSlots() {
  const selectedDate = document.getElementById('selectedDate').value;
  const timeSlotSelect = document.getElementById('timeSlot');
  const loadingMsg = document.getElementById('loadingSlots');

  if (!selectedDate) {
    timeSlotSelect.innerHTML = '<option>Select a date first</option>';
    return;
  }

  // Show loading state
  if (loadingMsg) loadingMsg.style.display = 'block';
  timeSlotSelect.innerHTML = '<option>Loading...</option>';

  try {
    // Query calendar for that day
    const dayStart = new Date(selectedDate + 'T00:00:00').toISOString();
    const dayEnd = new Date(selectedDate + 'T23:59:59').toISOString();

    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies (access_token)
      body: JSON.stringify({
        action: 'getAvailability',
        timeMin: dayStart,
        timeMax: dayEnd,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, need to re-authenticate
        handleTokenExpired();
        return;
      }
      throw new Error('Failed to fetch availability');
    }

    const data = await response.json();
    const busySlots = data.busy || [];

    // Generate available slots
    const availableSlots = generateTimeSlots(busySlots, selectedDate);

    if (availableSlots.length === 0) {
      timeSlotSelect.innerHTML = '<option>No available slots this day</option>';
    } else {
      timeSlotSelect.innerHTML = availableSlots
        .map(slot => `<option value="${slot.time}" data-duration="${slot.duration}">${slot.display}</option>`)
        .join('');
    }

    if (loadingMsg) loadingMsg.style.display = 'none';
  } catch (error) {
    console.error('Error loading slots:', error);
    timeSlotSelect.innerHTML = '<option>Error loading slots</option>';
    if (loadingMsg) loadingMsg.style.display = 'none';
  }
}

function generateTimeSlots(busySlots, selectedDate) {
  const slots = [];
  const businessHours = { start: 9, end: 18 }; // 9 AM to 6 PM
  const serviceDuration = getServiceDuration();

  for (let hour = businessHours.start; hour < businessHours.end; hour++) {
    const slotTime = new Date(`${selectedDate}T${String(hour).padStart(2, '0')}:00:00`);
    const slotEnd = new Date(slotTime.getTime() + serviceDuration * 60 * 60 * 1000);

    // Check if slot conflicts with busy times
    const isAvailable = !busySlots.some(busy => {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);
      return slotTime < busyEnd && slotEnd > busyStart;
    });

    if (isAvailable) {
      slots.push({
        time: slotTime.toISOString(),
        display: `${String(hour).padStart(2, '0')}:00 - ${String(hour + serviceDuration).padStart(2, '0')}:00`,
        duration: serviceDuration,
      });
    }
  }

  return slots;
}

function getServiceDuration() {
  const serviceType = document.getElementById('serviceType');
  if (!serviceType) return 2;

  const selected = serviceType.options[serviceType.selectedIndex];
  const durationMatch = selected.text.match(/(\d+\.?\d*)\s*hours?/i);
  return durationMatch ? parseFloat(durationMatch[1]) : 2;
}

async function confirmBooking() {
  if (!accessToken) {
    alert('Please sign in first');
    return;
  }

  const dateInput = document.getElementById('selectedDate');
  const timeSlotSelect = document.getElementById('timeSlot');
  const serviceSelect = document.getElementById('serviceType');
  const clientNameInput = document.getElementById('clientName');
  const clientEmailInput = document.getElementById('clientEmail');
  const confirmBtn = document.getElementById('confirmBooking');

  if (!dateInput.value || !timeSlotSelect.value) {
    alert('Please select a date and time');
    return;
  }

  const clientName = clientNameInput?.value || 'Guest';
  const clientEmail = clientEmailInput?.value || '';
  const serviceType = serviceSelect.options[serviceSelect.selectedIndex].text;

  // Disable button during submission
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Booking...';

  try {
    const startTime = timeSlotSelect.value;
    const duration = parseFloat(timeSlotSelect.options[timeSlotSelect.selectedIndex].dataset.duration) || 2;
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies (access_token)
      body: JSON.stringify({
        action: 'bookSlot',
        summary: serviceType,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        description: `Client: ${clientName}\nEmail: ${clientEmail}`,
        clientEmail,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleTokenExpired();
        return;
      }
      throw new Error('Failed to create booking');
    }

    const result = await response.json();

    // Show success message
    showBookingSuccess(serviceType, startDate, clientName);

    // Reset form
    setTimeout(() => {
      dateInput.value = '';
      timeSlotSelect.innerHTML = '<option>Select a date first</option>';
      if (clientNameInput) clientNameInput.value = '';
      if (clientEmailInput) clientEmailInput.value = '';
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Booking';
    }, 3000);
  } catch (error) {
    console.error('Booking error:', error);
    alert('Failed to create booking. Please try again.');
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Booking';
  }
}

function showBookingSuccess(serviceType, startDate, clientName) {
  const bookingSection = document.getElementById('booking-section');
  const successMessage = document.createElement('div');
  successMessage.className = 'booking-success-message';
  successMessage.innerHTML = `
    <div style="background: rgba(201, 168, 106, 0.2); border: 1px solid #c9a86a; padding: 24px; border-radius: 4px; text-align: center; margin-bottom: 24px;">
      <p style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 24px; color: #17130f; margin-bottom: 12px;">✓ Booking Confirmed!</p>
      <p style="font-size: 14px; color: #5a4c3d; line-height: 1.6;">
        <strong>${serviceType}</strong><br>
        ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br>
        <br>
        A confirmation email has been sent. You can manage this booking in Google Calendar.
      </p>
    </div>
  `;

  bookingSection.insertBefore(successMessage, bookingSection.firstChild);

  setTimeout(() => {
    successMessage.remove();
  }, 4000);
}

function handleTokenExpired() {
  alert('Your session has expired. Please sign in again.');
  toggleBookingUI(false);
  accessToken = null;
  refreshToken = null;
}

// Optional: Refresh token before it expires (implement if using long-term bookings)
async function refreshAccessToken() {
  if (!refreshToken) return;

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const tokens = await response.json();
      accessToken = tokens.accessToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
}

// Set up periodic token refresh (every 50 minutes)
setInterval(refreshAccessToken, 50 * 60 * 1000);
