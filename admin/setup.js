// admin/setup.js - Handle customer's one-time Google Calendar authorization

const CLIENT_ID = '101202414160-tm8palr7hk0jsqfjdgb75rsui1c0nt12.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin + '/api/admin/auth';
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email';

// Check for auth callback
window.addEventListener('DOMContentLoaded', () => {
  checkForAuthCallback();
  checkForErrorInURL();
});

function checkForErrorInURL() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');

  if (error) {
    showError(decodeURIComponent(error));
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function initiateSetup() {
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

function checkForAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');

  if (error) {
    showError(`Authorization failed: ${error}`);
    return;
  }

  if (code) {
    exchangeCodeForTokens(code);
  }
}

async function exchangeCodeForTokens(code) {
  try {
    document.getElementById('setupBtn').disabled = true;
    document.getElementById('setupBtn').textContent = 'Setting up...';

    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Setup failed');
    }

    const result = await response.json();

    // Show success
    document.getElementById('setupContent').style.display = 'none';
    document.getElementById('successContent').style.display = 'block';

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (error) {
    console.error('Setup error:', error);
    showError(error.message);
    document.getElementById('setupBtn').disabled = false;
    document.getElementById('setupBtn').textContent = 'Sign in with Google';
  }
}

function showError(message) {
  document.getElementById('setupContent').style.display = 'none';
  document.getElementById('errorContent').style.display = 'block';
  document.getElementById('errorMsg').textContent = message;
}

function toggleEmailSettings() {
  const form = document.getElementById('emailSettingsForm');
  const btn = document.getElementById('setupEmailBtn');

  if (form.style.display === 'none') {
    form.style.display = 'block';
    btn.style.display = 'none';
  } else {
    form.style.display = 'none';
    btn.style.display = 'block';
  }
}

// Setup email settings form submission
document.addEventListener('DOMContentLoaded', () => {
  const emailForm = document.getElementById('emailSettingsForm');
  if (emailForm) {
    emailForm.addEventListener('submit', handleEmailSettingsSubmit);
  }
});

async function handleEmailSettingsSubmit(e) {
  e.preventDefault();

  const gmailAddress = document.getElementById('gmailAddress').value.trim();
  const gmailAppPassword = document.getElementById('gmailAppPassword').value.trim();
  const statusDiv = document.getElementById('emailSettings Status');

  if (!gmailAddress || !gmailAppPassword) {
    alert('Please fill in all fields');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const response = await fetch('/api/admin/email-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gmailAddress,
        gmailAppPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save settings');
    }

    statusDiv.style.display = 'block';
    statusDiv.className = 'status success';
    statusDiv.innerHTML = '<strong>✓ Email settings saved!</strong><br>You\'ll now receive inquiry notifications.';

    document.getElementById('emailSettingsForm').style.display = 'none';
    document.getElementById('setupEmailBtn').style.display = 'block';
  } catch (error) {
    console.error('Error saving email settings:', error);
    statusDiv.style.display = 'block';
    statusDiv.className = 'status error';
    statusDiv.textContent = error.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Email Settings';
  }
}
