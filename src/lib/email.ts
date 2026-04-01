/**
 * Email utility for the KADIV Events platform.
 *
 * In development (no SMTP configured), emails are logged to the console.
 * In production (SMTP env vars set), emails are sent via nodemailer.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  /* ─── Production: send via nodemailer ─── */
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587', 10),
        secure: parseInt(smtpPort || '587', 10) === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"KADIV Events" <${smtpUser}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || '',
      });

      console.log(`📧 Email sent to ${payload.to}: ${payload.subject}`);
      return true;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  }

  /* ─── Development: log to console ─── */
  console.log('\n📧 ───────────── EMAIL (dev mode — not sent) ─────────────');
  console.log(`   To:      ${payload.to}`);
  console.log(`   Subject: ${payload.subject}`);
  if (payload.text) {
    console.log(`   Text:    ${payload.text.substring(0, 200)}${payload.text.length > 200 ? '...' : ''}`);
  }
  console.log(`   HTML:    ${payload.html.substring(0, 300)}${payload.html.length > 300 ? '...' : ''}`);
  console.log('──────────────────────────────────────────────────────\n');
  return true;
}
