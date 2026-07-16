// api/admin/email-settings.js - Store admin's email settings

import { kv } from '@vercel/kv';

const EMAIL_CONFIG_KEY = 'admin:email-config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { gmailAddress, gmailAppPassword } = req.body;

    if (!gmailAddress || !gmailAppPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gmailAddress)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate app password format (should be 16 characters without spaces)
    if (gmailAppPassword.replace(/\s/g, '').length !== 16) {
      return res.status(400).json({ error: 'App password should be 16 characters' });
    }

    // Store in Redis (in production, encrypt these)
    await kv.hset(EMAIL_CONFIG_KEY, {
      gmailAddress,
      gmailAppPassword: gmailAppPassword.replace(/\s/g, ''),
      configuredAt: new Date().toISOString(),
    });

    console.log('[email-settings] Email settings saved for:', gmailAddress);

    return res.status(200).json({
      success: true,
      message: 'Email settings saved successfully',
    });
  } catch (error) {
    console.error('Email settings error:', error);
    return res.status(500).json({ error: 'Failed to save email settings' });
  }
}
