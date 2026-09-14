import { Router } from 'express';
import { Resend } from 'resend';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.CONTACT_EMAIL || 'emailtestolawale@gmail.com';

// POST /api/contact  (public)
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name?.trim())    return res.status(400).json({ error: 'Name is required.' });
  if (!email?.trim() || !/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ error: 'A valid email is required.' });
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

  try {
    await resend.emails.send({
      from:    'Linkmrs Contact <onboarding@resend.dev>',
      to:      TO_EMAIL,
      replyTo: email.trim(),
      subject: subject?.trim()
        ? `[Linkmrs Contact] ${subject.trim()}`
        : `[Linkmrs Contact] Message from ${name.trim()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #003434; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #b0eeed; margin: 0; font-size: 20px;">New Contact Message</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 14px;">
              Sent via Linkmrs contact form
            </p>
          </div>

          <div style="background: #ffffff; border: 1px solid #e1e3e2; border-top: none;
                      padding: 32px; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 80px;">
                  From
                </td>
                <td style="padding: 8px 0; font-weight: 600; color: #191c1c;">
                  ${name.trim()}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Email</td>
                <td style="padding: 8px 0; color: #003434;">
                  <a href="mailto:${email.trim()}" style="color: #003434;">${email.trim()}</a>
                </td>
              </tr>
              ${subject?.trim() ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Subject</td>
                <td style="padding: 8px 0; color: #191c1c;">${subject.trim()}</td>
              </tr>` : ''}
            </table>

            <div style="background: #f9fafb; border-radius: 8px; padding: 20px;
                        border-left: 4px solid #003434;">
              <p style="margin: 0; color: #3f4848; line-height: 1.7; white-space: pre-wrap;">
                ${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              </p>
            </div>

            <p style="margin: 24px 0 0; font-size: 13px; color: #6b7280;">
              Reply directly to this email to respond to ${name.trim()}.
            </p>
          </div>
        </div>
      `,
    });

    res.json({ ok: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

export default router;