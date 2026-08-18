import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export async function sendOtpEmail(to: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.error('[email] RESEND_API_KEY not set — OTP not sent');
    return { success: false, error: 'Email service not configured.' };
  }

  const from = process.env.EMAIL_FROM || 'KCC <no-reply@onlinenephrologist.com>';

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
            <div style="text-align:center;margin-bottom:24px;">
              <div style="width:56px;height:56px;background:#0A75BB;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:24px;font-weight:bold;">K</span>
              </div>
            </div>
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
