// booking.js - Public booking form (no authentication needed)

let selectedDate = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  // Show booking form immediately
  showBookingWidget();
});

function showBookingWidget() {
  const bookingSection = document.getElementById('booking-section');
  if (bookingSection) {
    bookingSection.style.display = 'block';
  }
}

function setupEventListeners() {
  const dateInput = document.getElementById('selectedDate');
  const confirmBtn = document.getElementById('confirmBooking');

  if (dateInput) {
    dateInput.addEventListener('change', loadAvailableSlots);
    dateInput.min = new Date().toISOString().split('T')[0]; // Disable past dates
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmBooking);
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

    const response = await fetch('/api/booking/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeMin: dayStart,
        timeMax: dayEnd,
      }),
    });

    if (!response.ok) {
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
  const businessStart = 9; // 9 AM
  const businessEnd = 18; // 6 PM
  const serviceDuration = getServiceDuration();

  // Generate consecutive non-overlapping slots
  let currentHour = businessStart;
  while (currentHour + serviceDuration <= businessEnd) {
    const slotTime = new Date(`${selectedDate}T${String(Math.floor(currentHour)).padStart(2, '0')}:${String((currentHour % 1) * 60).padStart(2, '0')}:00`);
    const slotEnd = new Date(slotTime.getTime() + serviceDuration * 60 * 60 * 1000);

    // Check if slot conflicts with any busy time
    const isAvailable = !busySlots.some(busy => {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);
      return slotTime < busyEnd && slotEnd > busyStart;
    });

    if (isAvailable) {
      const startHour = Math.floor(currentHour);
      const startMin = Math.round((currentHour % 1) * 60);
      const endHour = Math.floor(currentHour + serviceDuration);
      const endMin = Math.round(((currentHour + serviceDuration) % 1) * 60);

      slots.push({
        time: slotTime.toISOString(),
        display: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')} - ${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
        duration: serviceDuration,
      });
    }

    // Move to next slot (consecutive, not overlapping)
    currentHour += serviceDuration;
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

  if (!clientName || !clientEmail) {
    showModal('Required Fields', 'Please enter your name and email to continue.', 'error');
    return;
  }

  // Disable button during submission
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Booking...';

  try {
    const startTime = timeSlotSelect.value;
    const duration = parseFloat(timeSlotSelect.options[timeSlotSelect.selectedIndex].dataset.duration) || 2;
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    const response = await fetch('/api/booking/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: serviceType,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        description: `Client: ${clientName}\nEmail: ${clientEmail}`,
        clientName,
        clientEmail,
      }),
    });

    if (!response.ok) {
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
    showModal('Booking Failed', 'We encountered an error while creating your booking. Please try again or contact us.', 'error');
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Booking';
  }
}

function showBookingSuccess(serviceType, startDate, clientName) {
  const dateStr = startDate.toLocaleDateString();
  const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const message = `${serviceType}\n${dateStr} at ${timeStr}\n\nA confirmation email has been sent to your inbox. The appointment has been added to the calendar.`;

  showModal('✓ Booking Confirmed!', message, 'success', 'resetBookingForm');
}

function resetBookingForm() {
  const dateInput = document.getElementById('selectedDate');
  const timeSlotSelect = document.getElementById('timeSlot');
  const clientNameInput = document.getElementById('clientName');
  const clientEmailInput = document.getElementById('clientEmail');
  const confirmBtn = document.getElementById('confirmBooking');

  dateInput.value = '';
  timeSlotSelect.innerHTML = '<option>Select a date first</option>';
  if (clientNameInput) clientNameInput.value = '';
  if (clientEmailInput) clientEmailInput.value = '';
  confirmBtn.disabled = false;
  confirmBtn.textContent = 'Confirm Booking';
}
