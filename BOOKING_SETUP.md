# Google Calendar Booking System - Setup Guide

## ✅ Files Created

The following files have been created and are ready to use:

### Backend (Vercel API Routes)
- `api/auth.js` — Handles Google OAuth token exchange
- `api/calendar.js` — Handles calendar operations (get availability, create bookings)

### Frontend
- `booking.js` — Booking widget logic and Google Sign-In integration
- Updated `index.html` — Contact page now includes booking widget

### Configuration
- `.env.local.example` — Environment variables template
- `vercel.json` — Vercel deployment configuration

---

## 🔧 What You Need to Do

### Step 1: Add Your Google OAuth Credentials

You already have these from Google Cloud Console. Now configure them:

#### 1.1 Create `.env.local` file
Create a file named `.env.local` in the root directory (`c:\Hoda Hair\`):

```
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth
TIMEZONE=America/New_York
```

Replace:
- `YOUR_ACTUAL_CLIENT_ID` with your OAuth Client ID from Google Cloud
- `YOUR_ACTUAL_CLIENT_SECRET` with your OAuth Client Secret from Google Cloud
- `TIMEZONE` with customer's timezone (e.g., America/Los_Angeles, Europe/London, Asia/Tokyo)

#### 1.2 Test locally
```bash
cd c:\Hoda Hair
npm install
npm run dev
```

Then visit: `http://localhost:3000`

Test the booking widget by clicking "Sign in with Google to Book"

---

### Step 2: Update booking.js with Your Client ID

Open `booking.js` and find this line (around line 4):

```javascript
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
```

Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID.

**Example:**
```javascript
const CLIENT_ID = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
```

---

### Step 3: Deploy to Vercel

#### 3.1 Connect Vercel
```bash
# From your project directory
npm i -g vercel
vercel
```

Follow the prompts to:
1. Link to your Git repository (or create new)
2. Select project name: "hoda-hair"
3. Choose framework: "Other" (since it's static with API routes)

#### 3.2 Set Environment Variables in Vercel

In Vercel Dashboard:
1. Go to your project settings
2. Click **Environment Variables**
3. Add these variables:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Your Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://your-vercel-domain.vercel.app/api/auth` |
| `TIMEZONE` | Customer's timezone |

#### 3.3 Update Google Cloud OAuth Redirect URIs

Back in Google Cloud Console:
1. Go to **APIs & Services** > **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add this redirect URI:
   ```
   https://your-vercel-domain.vercel.app/api/auth
   ```
4. Save

---

### Step 4: What Customer Needs to Do

Tell your customer to do this **one time only**:

1. Visit the website: `https://your-domain.com`
2. Scroll to **Contact** page
3. Click **"Sign in with Google to Book"** button
4. Google will show a consent screen:
   ```
   "Hoda Hair wants to access your Google Calendar"
   ```
5. Click **"Allow"**
6. Done! ✓ Booking widget is now live with their calendar

---

## 📋 Checklist for Deployment

- [ ] Created `.env.local` with Google credentials
- [ ] Updated `CLIENT_ID` in `booking.js`
- [ ] Tested locally with `npm run dev`
- [ ] Deployed to Vercel with `vercel`
- [ ] Set environment variables in Vercel dashboard
- [ ] Added Vercel redirect URI to Google Cloud Console
- [ ] Tested booking flow end-to-end

---

## 🧪 Testing the Booking System

### Local Testing
1. Run `npm run dev`
2. Open `http://localhost:3000/contact`
3. Click "Sign in with Google"
4. Sign in with a test Google account
5. Select a date
6. Verify time slots load (will show available 1-hour slots from 9 AM - 6 PM)
7. Select a time and service
8. Click "Confirm Booking"
9. Check Google Calendar — event should appear

### Production Testing (Vercel)
1. Deploy to Vercel
2. Open `https://your-domain.com/contact`
3. Repeat steps 3-9 above
4. Verify events appear in customer's Google Calendar

---

## 🔐 Security Notes

1. **Client Secret** is stored securely on Vercel servers, never exposed to browser
2. **Access Tokens** are stored server-side (in response cookies)
3. **Refresh Tokens** are used to extend sessions automatically
4. Never commit `.env.local` to Git — it's in `.gitignore`

---

## 🛠️ Customization

### Change Business Hours
In `booking.js`, find this section (around line 250):

```javascript
const businessHours = { start: 9, end: 18 }; // 9 AM to 6 PM
```

Change to your preferred hours:
```javascript
const businessHours = { start: 10, end: 17 }; // 10 AM to 5 PM
```

### Change Service Durations
In `booking.js`, the service durations are parsed from the dropdown options in `index.html`. Update those options if needed:

```html
<select id="serviceType" class="form-select">
  <option>Bridal Hair - 2 hours</option>
  <option>Event Hair - 1.5 hours</option>
  <!-- etc -->
</select>
```

### Change Timezone
Update `TIMEZONE` environment variable:
- `America/New_York` for Eastern
- `America/Chicago` for Central
- `America/Denver` for Mountain
- `America/Los_Angeles` for Pacific
- `Europe/London` for UK
- `Europe/Paris` for Central Europe
- `Asia/Tokyo` for Japan

### Add Email Notifications
To send custom email confirmations (beyond Google's automatic emails), add Resend or SendGrid integration to `api/calendar.js`.

---

## 🐛 Troubleshooting

### "Authentication failed" error
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check redirect URIs in Google Cloud Console match exactly

### No time slots appearing
- Verify customer signed in with Google (check browser console)
- Check calendar has no all-day events blocking those times
- Verify API response: Open browser DevTools > Network tab, check `/api/calendar` response

### "Token expired or invalid"
- User needs to sign in again
- Refresh token logic will handle this automatically after ~50 minutes

### Booking not appearing in calendar
- Check customer is signed in
- Verify customer is using their own Google account (not a shared one)
- Check Google Calendar is not in "read-only" mode

---

## 📞 Support

For issues with:
- **Google OAuth**: Check [Google Identity Services docs](https://developers.google.com/identity/protocols/oauth2)
- **Google Calendar API**: Check [Calendar API docs](https://developers.google.com/calendar/api)
- **Vercel deployment**: Check [Vercel docs](https://vercel.com/docs)

---

## 🚀 Next Steps (Optional Enhancements)

1. **Add Payment**: Integrate Stripe to charge for bookings
2. **Send Custom Emails**: Use Resend/SendGrid for branded confirmations
3. **Automatic Reminders**: Set up IFTTT to send SMS reminders
4. **Multiple Staff**: Show multiple calendars if team members book
5. **Rescheduling**: Let clients reschedule their own bookings

---

## File Structure After Setup

```
c:\Hoda Hair\
├── api/
│   ├── auth.js              ← OAuth handler
│   └── calendar.js          ← Calendar operations
├── index.html               ← Updated with booking widget
├── booking.js               ← Booking logic
├── app.js                   ← Existing site logic
├── support.js               ← Utilities
├── .env.local               ← Your credentials (DON'T COMMIT)
├── .env.local.example       ← Template
├── vercel.json              ← Vercel config
├── README.md                ← Site documentation
├── BOOKING_SETUP.md         ← This file
└── package.json             ← Node dependencies
```
