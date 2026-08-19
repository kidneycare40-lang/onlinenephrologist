import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

const KCC_BRAND = `
  <div style="text-align:center;margin-bottom:24px;">
    <div style="width:56px;height:56px;background:#0A75BB;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:24px;font-weight:bold;">K</span>
    </div>
  </div>
`;

export async function sendOtpEmail(to: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.error('[email] RESEND_API_KEY not set — OTP not sent');
    return { success: false, error: 'Email service not configured.' };
  }

  const from = 'KCC <no-reply@onlinenephrologist.com>';

  try {
    await resend.emails.send({
      from,
      to,
      subject: 'Your Verification Code — Kidney Care Centre',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:24px;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
            ${KCC_BRAND}
            <h2 style="text-align:center;color:#0f172a;margin:0 0 8px;">Verification Code</h2>
            <p style="text-align:center;color:#64748b;font-size:14px;margin:0 0 24px;">Kidney Care Centre — Patient Login</p>
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
              <p style="color:#0369a1;font-size:32px;font-weight:bold;letter-spacing:0.15em;margin:0;font-family:monospace;">${otp}</p>
            </div>
            <p style="color:#64748b;font-size:13px;text-align:center;margin:0 0 8px;">This code expires in <strong>10 minutes</strong>.</p>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">If you didn't request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[email] Failed to send OTP:', err.message);
    return { success: false, error: 'Failed to send email. Please try again.' };
  }
}

export interface BookingConfirmationEmail {
  to: string;
  patientName: string;
  bookingId: string;
  consultationType: string;
  date: string;
  time: string;
  fee: string;
  paymentId?: string;
}

export async function sendBookingConfirmationEmail(
  data: BookingConfirmationEmail
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.error('[email] RESEND_API_KEY not set — booking confirmation not sent');
    return { success: false, error: 'Email service not configured.' };
  }

  const typeLabel =
    data.consultationType === 'online_intl' ? 'International Online' :
    data.consultationType === 'online' ? 'Online Consultation' :
    data.consultationType === 'hospital' ? 'Hospital Visit' : 'In-Clinic';

  const from = 'KCC <no-reply@onlinenephrologist.com>';

  try {
    await resend.emails.send({
      from,
      to: data.to,
      subject: `Booking Confirmed — ${data.bookingId} | Kidney Care Centre`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:24px;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
            ${KCC_BRAND}
            <h2 style="text-align:center;color:#0f172a;margin:0 0 8px;">Booking Confirmed</h2>
            <p style="text-align:center;color:#64748b;font-size:14px;margin:0 0 24px;">Kidney Care Centre — ${typeLabel}</p>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="color:#166534;font-size:14px;margin:0 0 8px;">Hi ${data.patientName},</p>
              <p style="color:#166534;font-size:14px;margin:0;">Your ${typeLabel.toLowerCase()} consultation has been confirmed and payment received.</p>
            </div>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Booking ID</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Date &amp; Time</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${data.date} at ${data.time} IST</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Fee</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${data.fee}</td>
              </tr>
              ${data.paymentId ? `
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Payment ID</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${data.paymentId}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Status</td>
                <td style="padding:8px 0;color:#16a34a;font-size:13px;font-weight:600;text-align:right;">Paid</td>
              </tr>
            </table>

            <p style="color:#64748b;font-size:13px;text-align:center;margin:0 0 16px;">We'll send you the consultation link before your appointment.</p>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">For questions, reply to this email or WhatsApp us.</p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[email] Failed to send booking confirmation:', err.message);
    return { success: false, error: 'Failed to send email.' };
  }
}

export interface TeamBookingEmail {
  bookingId: string;
  patientName: string;
  patientPhone: string;
  consultationType: string;
  date: string;
  time: string;
  fee: string;
  reason: string;
  paymentId?: string;
}

export async function sendTeamBookingEmail(
  data: TeamBookingEmail
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.error('[email] RESEND_API_KEY not set — team booking email not sent');
    return { success: false, error: 'Email service not configured.' };
  }

  const typeLabel =
    data.consultationType === 'online_intl' ? 'International Online' :
    data.consultationType === 'online' ? 'Online' :
    data.consultationType === 'hospital' ? 'Hospital' : 'In-Clinic';

  const from = 'KCC <no-reply@onlinenephrologist.com>';
  const teamEmails = (process.env.TEAM_EMAILS || 'kidneycare40@gmail.com').split(',').map(e => e.trim());

  try {
    await resend.emails.send({
      from,
      to: teamEmails,
      subject: `New Booking — ${typeLabel} — ${data.patientName} (${data.bookingId})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:24px;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
            ${KCC_BRAND}
            <h2 style="text-align:center;color:#0f172a;margin:0 0 8px;">New Booking — ${typeLabel}</h2>
            <p style="text-align:center;color:#64748b;font-size:14px;margin:0 0 24px;">Payment confirmed via Razorpay</p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Booking ID</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Patient</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${data.patientName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Phone</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${data.patientPhone}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Date &amp; Time</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${data.date} at ${data.time} IST</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Fee</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${data.fee}</td>
              </tr>
              ${data.paymentId ? `
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Payment ID</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${data.paymentId}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:13px;">Reason</td>
                <td style="padding:8px 0;color:#0f172a;font-size:13px;text-align:right;">${data.reason || 'Not provided'}</td>
              </tr>
            </table>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[email] Failed to send team booking email:', err.message);
    return { success: false, error: 'Failed to send email.' };
  }
}
