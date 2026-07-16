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

  if (!gmailAddress || !gmailAppPassword) {
    showAdminModal('Required Fields', 'Please enter both your Gmail address and app password.', 'error');
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

    showAdminModal('✓ Email Settings Saved!', 'You\'ll now receive notifications when clients submit inquiries.', 'success');

    document.getElementById('emailSettingsForm').style.display = 'none';
    document.getElementById('setupEmailBtn').style.display = 'block';
  } catch (error) {
    console.error('Error saving email settings:', error);
    showAdminModal('Error', error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Email Settings';
  }
}

function showAdminModal(title, message, type = 'info') {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 300;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 40px;
    border-radius: 4px;
    max-width: 400px;
    width: 90vw;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  `;

  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  titleEl.style.cssText = `
    font-family: Arial, sans-serif;
    font-size: 20px;
    margin-bottom: 15px;
    color: #17130f;
  `;

  if (type === 'success') {
    titleEl.style.color = '#27a745';
  } else if (type === 'error') {
    titleEl.style.color = '#dc3545';
  }

  const msgEl = document.createElement('p');
  msgEl.textContent = message;
  msgEl.style.cssText = `
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
  `;

  const btn = document.createElement('button');
  btn.textContent = 'OK';
  btn.style.cssText = `
    background: #c9a86a;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    font-weight: 500;
  `;

  btn.onclick = () => modal.remove();

  content.appendChild(titleEl);
  content.appendChild(msgEl);
  content.appendChild(btn);
  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}
