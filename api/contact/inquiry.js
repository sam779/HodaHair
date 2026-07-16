// api/contact/inquiry.js - Handle contact form inquiries

import { kv } from '@vercel/kv';
import nodemailer from 'nodemailer';

const EMAIL_CONFIG_KEY = 'admin:email-config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Log the inquiry
    console.log('[inquiry] New inquiry received from:', name, '(' + email + ')');

    // Try to send email if settings are configured
    try {
      const emailConfig = await kv.hgetall(EMAIL_CONFIG_KEY);

      if (emailConfig && emailConfig.gmailAddress && emailConfig.gmailAppPassword) {
        // Send email to admin using Gmail SMTP
        await sendInquiryEmail(
          emailConfig.gmailAddress,
          emailConfig.gmailAppPassword,
          { name, email, subject, message }
        );
        console.log('[inquiry] Email sent to admin:', emailConfig.gmailAddress);
      } else {
        console.log('[inquiry] No email config found - inquiry logged but not emailed');
      }
    } catch (emailError) {
      console.error('[inquiry] Failed to send email:', emailError);
      // Don't fail the request if email fails - inquiry is still logged
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry received. We will respond within 2 business days.',
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return res.status(500).json({ error: 'Failed to submit inquiry' });
  }
}

async function sendInquiryEmail(gmailAddress, appPassword, inquiryData) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailAddress,
      pass: appPassword,
    },
  });

  const mailOptions = {
    from: gmailAddress,
    to: gmailAddress,
    subject: `New Inquiry: ${inquiryData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>New Inquiry from Your Website</h2>

        <p><strong>Name:</strong> ${inquiryData.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${inquiryData.email}">${inquiryData.email}</a></p>
        <p><strong>Subject:</strong> ${inquiryData.subject}</p>

        <h3>Message:</h3>
        <p>${inquiryData.message.replace(/\n/g, '<br>')}</p>

        <hr>
        <p style="color: #666; font-size: 12px;">
          Reply to this inquiry directly by emailing the client at ${inquiryData.email}
        </p>
      </div>
    `,
    replyTo: inquiryData.email,
  };

  await transporter.sendMail(mailOptions);
}
