/**
 * Pre-built HTML email templates for the KADIV Events platform.
 *
 * All templates use inline CSS for maximum email-client compatibility.
 * Brand palette:  background #0A0A0A · accent #C8A456 · text #FAF3E0
 */

/* ──────────────────── shared helpers ──────────────────── */

const BRAND = {
  bg: '#0A0A0A',
  cardBg: '#141414',
  accent: '#C8A456',
  accentLight: '#D4B96E',
  text: '#FAF3E0',
  muted: '#9A9A9A',
  border: '#2A2A2A',
  white: '#FFFFFF',
};

function wrapper(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KADIV Events</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:system-ui,-apple-system,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          ${inner}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function logoBlock(): string {
  return `
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 0 8px;">
              <span style="font-size:28px;font-weight:700;color:${BRAND.accent};letter-spacing:4px;">KADIV</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <span style="font-size:13px;color:${BRAND.muted};letter-spacing:2px;">EVENTS</span>
            </td>
          </tr>`;
}

function divider(): string {
  return `
          <tr>
            <td style="padding:0 0 24px;">
              <hr style="border:none;border-top:1px solid ${BRAND.border};" />
            </td>
          </tr>`;
}

function footerBlock(): string {
  const year = new Date().getFullYear();
  return `
          ${divider()}
          <tr>
            <td style="padding:0 0 16px;">
              <p style="margin:0;font-size:12px;color:${BRAND.muted};text-align:center;line-height:1.6;">
                &copy; ${year} KADIV Events. All rights reserved.<br />
                Plot 12, Victoria Island, Lagos, Nigeria<br />
                <a href="mailto:info@kadiv.com" style="color:${BRAND.accent};text-decoration:none;">info@kadiv.com</a> &middot; +234 (1) 234-5678
              </p>
            </td>
          </tr>`;
}

function buttonBlock(label: string, url: string): string {
  return `
          <tr>
            <td align="center" style="padding:16px 0;">
              <a href="${url}" target="_blank" rel="noopener noreferrer"
                 style="display:inline-block;padding:14px 40px;background:${BRAND.accent};color:${BRAND.bg};
                        font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
                ${label}
              </a>
            </td>
          </tr>`;
}

function textBlock(html: string, opts?: { padding?: string; align?: string; size?: string; color?: string }): string {
  const p = opts?.padding ?? '0 0 16px';
  const a = opts?.align ?? 'left';
  const s = opts?.size ?? '14px';
  const c = opts?.color ?? BRAND.text;
  return `
          <tr>
            <td style="padding:${p};">
              <p style="margin:0;font-size:${s};color:${c};text-align:${a};line-height:1.7;">${html}</p>
            </td>
          </tr>`;
}

function tableRow(label: string, value: string): string {
  return `
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:${BRAND.muted};border-bottom:1px solid ${BRAND.border};width:40%;vertical-align:top;">${label}</td>
              <td style="padding:10px 16px;font-size:13px;color:${BRAND.text};border-bottom:1px solid ${BRAND.border};vertical-align:top;">${value}</td>
            </tr>`;
}

/* ──────────────────── public template functions ──────────────────── */

export interface EmailTemplateResult {
  subject: string;
  html: string;
  text: string;
}

/**
 * Email verification — sent after registration.
 */
export function verificationEmail(
  name: string,
  token: string,
  verificationUrl: string,
): EmailTemplateResult {
  const subject = 'Verify Your Email — KADIV Events';

  const html = wrapper(`
          ${logoBlock()}
          ${divider()}

          ${textBlock(`Hello <strong>${name}</strong>,`)}
          ${textBlock('Thank you for creating an account with <strong>KADIV Events</strong>. Please verify your email address to get started.')}
          ${buttonBlock('Verify My Email', verificationUrl)}

          ${divider()}

          ${textBlock('If the button above does not work, you can copy and paste the verification link below into your browser:', { size: '13px', color: BRAND.muted })}
          <tr>
            <td style="padding:0 0 16px;">
              <p style="margin:0;font-size:13px;color:${BRAND.accent};word-break:break-all;line-height:1.6;">${verificationUrl}</p>
            </td>
          </tr>

          ${textBlock(`Or enter this token manually: <strong style="color:${BRAND.accent};">${token}</strong>`, { size: '13px', color: BRAND.muted })}

          ${textBlock('This link expires in 24 hours. If you did not create an account, please ignore this email.', { size: '12px', color: BRAND.muted })}

          ${footerBlock()}
  `);

  const text = `Hello ${name},\n\nThank you for creating an account with KADIV Events.\n\nPlease verify your email by visiting:\n${verificationUrl}\n\nOr use this token: ${token}\n\nThis link expires in 24 hours. If you did not create an account, please ignore this email.\n\n© ${new Date().getFullYear()} KADIV Events`;

  return { subject, html, text };
}

/**
 * Welcome — sent after email verification (or registration).
 */
export function welcomeEmail(name: string): EmailTemplateResult {
  const subject = 'Welcome to KADIV Events!';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const html = wrapper(`
          ${logoBlock()}
          ${divider()}

          ${textBlock(`Welcome aboard, <strong>${name}</strong>! 👋`)}
          ${textBlock('We are thrilled to have you join the KADIV Events family. We specialize in crafting unforgettable luxury events — from weddings and galas to corporate conferences and private celebrations.')}
          ${textBlock('Here is what you can do with your new account:')}

          <!-- Feature highlights -->
          <tr>
            <td style="padding:8px 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${featureRow('Event Planning', 'Plan every detail of your dream event with our intuitive tools and expert guidance.')}
                ${featureRow('Premium Venues', 'Choose from curated luxury venues across Lagos and Nigeria — ballrooms, gardens, rooftops, and more.')}
                ${featureRow('Catering &amp; Decor', 'Select from our premium catering packages and exquisite decoration themes to match your vision.')}
                ${featureRow('Seamless Payments', 'Pay securely via Flutterwave or Paystack with transparent pricing and instant receipts.')}
              </table>
            </td>
          </tr>

          ${buttonBlock('Browse Our Services', `${appUrl}`)}

          ${textBlock('If you have any questions, our team is always here to help. Just reach out through the live chat on our website or email us directly.', { size: '13px', color: BRAND.muted })}

          ${footerBlock()}
  `);

  const text = `Welcome to KADIV Events, ${name}!\n\nWe specialize in crafting unforgettable luxury events. Here is what you can do:\n\n• Event Planning — Plan every detail with our intuitive tools\n• Premium Venues — Curated luxury venues across Lagos and Nigeria\n• Catering & Decor — Premium packages and exquisite themes\n• Seamless Payments — Secure via Flutterwave or Paystack\n\nBrowse our services: ${appUrl}\n\nIf you have questions, reach out via live chat or email.\n\n© ${new Date().getFullYear()} KADIV Events`;

  return { subject, html, text };
}

function featureRow(title: string, desc: string): string {
  return `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};">
                    <p style="margin:0 0 2px;font-size:14px;color:${BRAND.accent};font-weight:600;">${title}</p>
                    <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">${desc}</p>
                  </td>
                </tr>`;
}

/**
 * Booking confirmation — sent after a new booking is created.
 */
export function bookingConfirmationEmail(
  name: string,
  eventName: string,
  eventType: string,
  date: string,
  location: string,
  totalCost: number,
  bookingRef: string,
): EmailTemplateResult {
  const subject = `Booking Confirmed: ${eventName} — KADIV Events`;
  const formattedDate = date ? new Date(date).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'To be confirmed';
  const formattedCost = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(totalCost);
  const deposit = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(totalCost * 0.3);

  const html = wrapper(`
          ${logoBlock()}
          ${divider()}

          ${textBlock(`<strong>${name}</strong>, your booking has been confirmed! 🎉`)}
          ${textBlock('Thank you for choosing KADIV Events. Below are the details of your booking.')}

          <!-- Booking details table -->
          <tr>
            <td style="padding:16px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:8px;overflow:hidden;">
                ${tableRow('Booking Ref', `<strong style="color:${BRAND.accent};">${bookingRef}</strong>`)}
                ${tableRow('Event Name', eventName)}
                ${tableRow('Event Type', eventType)}
                ${tableRow('Date', formattedDate)}
                ${tableRow('Location', location || 'To be confirmed')}
                ${tableRow('Total Cost', `<strong style="color:${BRAND.accent};">${formattedCost}</strong>`)}
                ${tableRow('Deposit (30%)', deposit)}
              </table>
            </td>
          </tr>

          ${divider()}

          ${textBlock('<strong>Next Steps:</strong>', { size: '14px', color: BRAND.accent })}
          ${textBlock('1. Pay the 30% deposit to secure your booking.<br/>2. Our event coordinator will contact you within 24 hours.<br/>3. Finalize venue selection, catering preferences, and additional services.<br/>4. Complete final payment at least 7 days before the event.', { size: '13px', color: BRAND.muted })}

          ${textBlock('If you need to make any changes, please contact us at <a href="mailto:info@kadiv.com" style="color:${BRAND.accent};">info@kadiv.com</a>.', { size: '13px', color: BRAND.muted })}

          ${footerBlock()}
  `);

  const text = `Booking Confirmed!\n\nHello ${name},\n\nYour booking has been confirmed. Here are the details:\n\nBooking Ref: ${bookingRef}\nEvent Name: ${eventName}\nEvent Type: ${eventType}\nDate: ${formattedDate}\nLocation: ${location || 'To be confirmed'}\nTotal Cost: ${formattedCost}\nDeposit (30%): ${deposit}\n\nNext Steps:\n1. Pay the 30% deposit to secure your booking.\n2. Our event coordinator will contact you within 24 hours.\n3. Finalize venue selection, catering preferences, and additional services.\n4. Complete final payment at least 7 days before the event.\n\nContact us at info@kadiv.com for any changes.\n\n© ${new Date().getFullYear()} KADIV Events`;

  return { subject, html, text };
}

/**
 * Payment receipt — sent after successful payment verification.
 */
export function paymentReceiptEmail(
  name: string,
  amount: number,
  reference: string,
  gateway: string,
  eventName: string,
  paidAt: string,
): EmailTemplateResult {
  const subject = `Payment Receipt — ${reference}`;
  const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  const formattedDate = paidAt ? new Date(paidAt).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const gatewayLabel = gateway.charAt(0).toUpperCase() + gateway.slice(1);

  const html = wrapper(`
          ${logoBlock()}
          ${divider()}

          ${textBlock(`<strong>${name}</strong>, your payment was successful! ✅`)}
          ${textBlock('Thank you for your payment. Here is your receipt for your records.')}

          <!-- Payment details table -->
          <tr>
            <td style="padding:16px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:8px;overflow:hidden;">
                ${tableRow('Transaction Ref', `<strong style="color:${BRAND.accent};">${reference}</strong>`)}
                ${tableRow('Amount Paid', `<strong style="color:${BRAND.accent};">${formattedAmount}</strong>`)}
                ${tableRow('Payment Gateway', gatewayLabel)}
                ${tableRow('Event', eventName || 'N/A')}
                ${tableRow('Date & Time', formattedDate)}
                ${tableRow('Status', '<span style="color:#34D399;font-weight:600;">✓ Confirmed</span>')}
              </table>
            </td>
          </tr>

          ${divider()}

          ${textBlock('Please keep this receipt for your records. A copy of this transaction has also been saved to your KADIV account dashboard.', { size: '13px', color: BRAND.muted })}

          ${textBlock('If you have any questions about this payment, please contact our support team at <a href="mailto:info@kadiv.com" style="color:${BRAND.accent};">info@kadiv.com</a>.', { size: '13px', color: BRAND.muted })}

          ${textBlock('Thank you for choosing KADIV Events! We look forward to making your event extraordinary.', { size: '14px', color: BRAND.text })}

          ${footerBlock()}
  `);

  const text = `Payment Receipt\n\nHello ${name},\n\nYour payment was successful. Here are the details:\n\nTransaction Ref: ${reference}\nAmount Paid: ${formattedAmount}\nPayment Gateway: ${gatewayLabel}\nEvent: ${eventName || 'N/A'}\nDate & Time: ${formattedDate}\nStatus: Confirmed\n\nPlease keep this receipt for your records. A copy has also been saved to your KADIV account dashboard.\n\nIf you have questions, contact us at info@kadiv.com.\n\nThank you for choosing KADIV Events!\n\n© ${new Date().getFullYear()} KADIV Events`;

  return { subject, html, text };
}

/**
 * Password reset — sent when user requests a password reset.
 */
export function passwordResetEmail(
  name: string,
  resetToken: string,
  resetUrl: string,
): EmailTemplateResult {
  const subject = 'Reset Your Password — KADIV Events';

  const html = wrapper(`
          ${logoBlock()}
          ${divider()}

          ${textBlock(`Hello <strong>${name}</strong>,`)}
          ${textBlock('We received a request to reset your password. Click the button below to choose a new one.')}
          ${buttonBlock('Reset My Password', resetUrl)}

          ${divider()}

          ${textBlock('If the button above does not work, copy and paste this link into your browser:', { size: '13px', color: BRAND.muted })}
          <tr>
            <td style="padding:0 0 16px;">
              <p style="margin:0;font-size:13px;color:${BRAND.accent};word-break:break-all;line-height:1.6;">${resetUrl}</p>
            </td>
          </tr>

          ${textBlock(`Or enter this token manually: <strong style="color:${BRAND.accent};">${resetToken}</strong>`, { size: '13px', color: BRAND.muted })}

          ${divider()}

          ${textBlock('🔒 <strong>Security Notice:</strong> This link expires in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email — your account is safe.', { size: '13px', color: BRAND.muted })}

          ${textBlock('For your security, never share this link with anyone. KADIV Events will never ask for your password via email.', { size: '12px', color: BRAND.muted })}

          ${footerBlock()}
  `);

  const text = `Hello ${name},\n\nWe received a request to reset your password.\n\nReset your password by visiting:\n${resetUrl}\n\nOr use this token: ${resetToken}\n\nThis link expires in 1 hour. If you did not request a password reset, please ignore this email.\n\nFor your security, never share this link with anyone. KADIV Events will never ask for your password via email.\n\n© ${new Date().getFullYear()} KADIV Events`;

  return { subject, html, text };
}

/**
 * Booking reminder — sent before an upcoming event.
 */
export function bookingReminderEmail(
  name: string,
  eventName: string,
  eventDate: string,
  location: string,
): EmailTemplateResult {
  const subject = `Upcoming Event Reminder: ${eventName}`;
  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'To be confirmed';

  const html = wrapper(`
          ${logoBlock()}
          ${divider()}

          ${textBlock(`<strong>${name}</strong>, your event is coming up! 📅`)}
          ${textBlock('This is a friendly reminder about your upcoming event with KADIV Events.')}

          <!-- Event details table -->
          <tr>
            <td style="padding:16px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:8px;overflow:hidden;">
                ${tableRow('Event', `<strong style="color:${BRAND.accent};">${eventName}</strong>`)}
                ${tableRow('Date', formattedDate)}
                ${tableRow('Location', location || 'To be confirmed')}
              </table>
            </td>
          </tr>

          ${divider()}

          ${textBlock('<strong>Final Preparation Checklist:</strong>', { size: '14px', color: BRAND.accent })}
          <tr>
            <td style="padding:8px 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.text};">✅ Confirm final guest count</td></tr>
                <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.text};">✅ Verify catering menu &amp; dietary requirements</td></tr>
                <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.text};">✅ Review decoration &amp; floral arrangements</td></tr>
                <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.text};">✅ Confirm payment balance is settled</td></tr>
                <tr><td style="padding:6px 0;font-size:13px;color:${BRAND.text};">✅ Share venue directions with your guests</td></tr>
              </table>
            </td>
          </tr>

          ${divider()}

          ${textBlock('Need to make changes? Contact your event coordinator or email us at <a href="mailto:info@kadiv.com" style="color:${BRAND.accent};">info@kadiv.com</a>.', { size: '13px', color: BRAND.muted })}

          ${textBlock('We cannot wait to make your event extraordinary! 🌟', { size: '14px', color: BRAND.text })}

          ${footerBlock()}
  `);

  const text = `Upcoming Event Reminder\n\nHello ${name},\n\nYour event is coming up!\n\nEvent: ${eventName}\nDate: ${formattedDate}\nLocation: ${location || 'To be confirmed'}\n\nFinal Preparation Checklist:\n- Confirm final guest count\n- Verify catering menu & dietary requirements\n- Review decoration & floral arrangements\n- Confirm payment balance is settled\n- Share venue directions with your guests\n\nNeed to make changes? Contact us at info@kadiv.com.\n\nWe cannot wait to make your event extraordinary!\n\n© ${new Date().getFullYear()} KADIV Events`;

  return { subject, html, text };
}
