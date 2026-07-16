// api/contact/inquiry.js - Handle contact form inquiries

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

    // Log the inquiry (in production, send email)
    console.log('[inquiry] New inquiry received:', {
      name,
      email,
      subject,
      message,
      receivedAt: new Date().toISOString(),
    });

    // TODO: Send email to admin using Resend, SendGrid, or similar
    // For now, just confirm receipt
    console.log('[inquiry] Email would be sent to:', process.env.ADMIN_EMAIL || 'hello@hodahair.com');

    return res.status(200).json({
      success: true,
      message: 'Inquiry received. We will respond within 2 business days.',
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return res.status(500).json({ error: 'Failed to submit inquiry' });
  }
}
