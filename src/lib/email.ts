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
  relationship?: string;
  bookedByPatientName?: string;
  doctorName?: string;
  clinicName?: string;
  localTimeDisplay?: string;
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
    data.consultationType === 'online_intl' ? 'International Online Video Consultation' :
    data.consultationType === 'online' ? 'Online Video Consultation' :
    data.consultationType === 'hospital' ? 'Hospital Visit' : 'In-Clinic Consultation';

  const doctor = data.doctorName || 'Dr. Rajesh Goel';
  const isOnline = data.consultationType === 'online' || data.consultationType === 'online_intl';
  const isFamily = data.relationship && data.relationship !== 'self';
  const from = 'KCC <no-reply@onlinenephrologist.com>';

  try {
    await resend.emails.send({
      from,
      to: data.to,
      subject: `Appointment Confirmed — ${doctor} — ${data.date}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:0;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0A75BB 0%,#085a94 100%);padding:32px 40px;text-align:center;">
              <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                <span style="color:#fff;font-size:24px;font-weight:bold;">K</span>
              </div>
              <h1 style="color:#ffffff;font-size:20px;margin:0 0 4px;font-weight:700;">Kidney Care Centre</h1>
              <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;">Online Nephrologist</p>
            </div>

            <!-- Success Banner -->
            <div style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:20px 40px;text-align:center;">
              <p style="color:#166534;font-size:16px;font-weight:700;margin:0 0 4px;">Appointment Confirmed</p>
              <p style="color:#16a34a;font-size:13px;margin:0;">Payment received successfully</p>
            </div>

            <!-- Greeting -->
            <div style="padding:28px 40px 0;">
              <p style="color:#334155;font-size:14px;margin:0 0 8px;">Dear <strong>${data.patientName}</strong>,</p>
              <p style="color:#475569;font-size:14px;margin:0 0 24px;">Your appointment with <strong>${doctor}</strong>, Senior Nephrologist &amp; Kidney Transplant Physician, has been successfully confirmed.</p>
            </div>

            <!-- Appointment Details Table -->
            <div style="padding:0 40px 24px;">
              <h3 style="color:#0A75BB;font-size:14px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Appointment Details</h3>
              <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;width:40%;">Booking ID</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0;">${data.bookingId}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Doctor</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${doctor}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Specialty</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">Nephrology</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Consultation</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${typeLabel}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Date</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0;">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Time</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${data.time} IST${data.localTimeDisplay ? ` (local: ${data.localTimeDisplay})` : ''}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Fee</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${data.fee}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Payment Status</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;">
                    <span style="display:inline-block;background:#dcfce7;color:#166534;font-size:12px;font-weight:700;padding:3px 10px;border-radius:12px;">PAID</span>
                  </td>
                </tr>
                ${data.paymentId ? `
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;">Payment ID</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;font-family:monospace;">${data.paymentId}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${isOnline ? `
            <!-- Online Instructions -->
            <div style="padding:0 40px 24px;">
              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;">
                <p style="color:#0369a1;font-size:13px;font-weight:600;margin:0 0 6px;">Video Consultation Instructions</p>
                <p style="color:#0369a1;font-size:13px;margin:0;">You will receive a WhatsApp message with the video consultation link before your appointment. Please ensure you have a stable internet connection and a device with a camera and microphone.</p>
              </div>
            </div>
            ` : ''}

            ${!isOnline && data.clinicName ? `
            <!-- Clinic Info -->
            <div style="padding:0 40px 24px;">
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
                <p style="color:#166534;font-size:13px;font-weight:600;margin:0 0 6px;">Clinic Details</p>
                <p style="color:#166534;font-size:13px;margin:0;">${data.clinicName}</p>
              </div>
            </div>
            ` : ''}

            <!-- Reference -->
            <div style="padding:0 40px 28px;">
              <p style="color:#64748b;font-size:13px;margin:0;">Please keep your <strong>Booking ID</strong> for future reference. For any questions, reply to this email or contact us via WhatsApp.</p>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">Kidney Care Centre / Online Nephrologist</p>
              <p style="color:#94a3b8;font-size:11px;margin:0;">This is an automated notification. Please do not reply directly to this email.</p>
            </div>

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
  patientEmail?: string;
  consultationType: string;
  date: string;
  time: string;
  fee: string;
  reason: string;
  paymentId?: string;
  relationship?: string;
  bookedByPatientName?: string;
  doctorName?: string;
  clinicName?: string;
  clinicCity?: string;
  age?: string;
  gender?: string;
  localTimeDisplay?: string;
  reportsUploaded?: boolean;
  ultrasoundUploaded?: boolean;
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
    data.consultationType === 'online_intl' ? 'International Online Video Consultation' :
    data.consultationType === 'online' ? 'Online Video Consultation' :
    data.consultationType === 'hospital' ? 'Hospital Visit' : 'In-Clinic Consultation';

  const doctor = data.doctorName || 'Dr. Rajesh Goel';
  const isFamily = data.relationship && data.relationship !== 'self';
  const from = 'KCC <no-reply@onlinenephrologist.com>';
  const teamEmails = (process.env.TEAM_EMAILS || 'kidneycare40@gmail.com').split(',').map(e => e.trim());

  const relationshipDisplay = isFamily ? data.relationship : 'Self';
  const reportsSummary = data.reportsUploaded ? 'Uploaded' : 'No reports uploaded';
  const ultrasoundSummary = data.ultrasoundUploaded ? 'Uploaded' : 'Not uploaded';

  try {
    await resend.emails.send({
      from,
      to: teamEmails,
      subject: `New Appointment Confirmation — ${data.patientName} — ${data.bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:0;">
          <div style="max-width:640px;margin:0 auto;background:#ffffff;">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0A75BB 0%,#085a94 100%);padding:32px 40px;text-align:center;">
              <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                <span style="color:#fff;font-size:24px;font-weight:bold;">K</span>
              </div>
              <h1 style="color:#ffffff;font-size:20px;margin:0 0 4px;font-weight:700;">Kidney Care Centre</h1>
              <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;">Online Nephrologist</p>
            </div>

            <!-- Payment Confirmed Banner -->
            <div style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:20px 40px;text-align:center;">
              <p style="color:#166534;font-size:16px;font-weight:700;margin:0 0 4px;">New Appointment — Payment Confirmed</p>
              <p style="color:#16a34a;font-size:13px;margin:0;">A new medical appointment has been successfully booked and payment has been confirmed.</p>
            </div>

            <!-- Greeting -->
            <div style="padding:28px 40px 0;">
              <p style="color:#334155;font-size:14px;margin:0 0 20px;">Dear Kidney Care Centre Team,</p>
              <p style="color:#475569;font-size:14px;margin:0 0 24px;">Please find the medical appointment details below. Please review the appointment in the EMR.</p>
            </div>

            <!-- Appointment Details Table -->
            <div style="padding:0 40px 24px;">
              <h3 style="color:#0A75BB;font-size:14px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Appointment Details</h3>
              <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;width:38%;">Booking ID</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;font-weight:700;border-bottom:1px solid #e2e8f0;font-family:monospace;">${data.bookingId}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Patient Name</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0;">${data.patientName}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Gender</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${data.gender || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Age</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${data.age || 'Not specified'}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Patient Contact</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${data.patientPhone}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Email</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${data.patientEmail || 'Not provided'}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Relationship</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${relationshipDisplay}${isFamily ? ` (Booked by ${data.bookedByPatientName || 'Account holder'})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Doctor</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${doctor}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Specialty</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">Nephrology</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Consultation Type</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${typeLabel}</td>
                </tr>
                ${data.clinicName ? `
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Clinic / Hospital</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${data.clinicName}</td>
                </tr>
                ` : ''}
                ${data.clinicCity ? `
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">City</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${data.clinicCity}</td>
                </tr>
                ` : ''}
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Appointment Date</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0;">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Appointment Time</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${data.time} IST${data.localTimeDisplay ? ` (local: ${data.localTimeDisplay})` : ''}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Consultation Fee</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0;">${data.fee}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Payment Status</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;">
                    <span style="display:inline-block;background:#dcfce7;color:#166534;font-size:12px;font-weight:700;padding:3px 12px;border-radius:12px;">CAPTURED</span>
                  </td>
                </tr>
                ${data.paymentId ? `
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Razorpay Payment ID</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;font-family:monospace;border-bottom:1px solid #e2e8f0;">${data.paymentId}</td>
                </tr>
                ` : ''}
                <tr${data.paymentId ? '' : ' style="background:#f8fafc;"'}>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;">Reason</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;">${data.reason || 'Not provided'}</td>
                </tr>
              </table>
            </div>

            <!-- Patient Reports -->
            <div style="padding:0 40px 24px;">
              <h3 style="color:#0A75BB;font-size:14px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Patient Reports</h3>
              <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background:#f8fafc;">
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;width:38%;">Blood/Medical Reports</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;">${reportsSummary}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;font-size:13px;">Ultrasound</td>
                  <td style="padding:10px 16px;color:#0f172a;font-size:13px;">${ultrasoundSummary}</td>
                </tr>
              </table>
            </div>

            <!-- Important Notes -->
            <div style="padding:0 40px 28px;">
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;">
                <p style="color:#92400e;font-size:13px;font-weight:700;margin:0 0 8px;">Important</p>
                <ul style="color:#92400e;font-size:13px;margin:0;padding-left:20px;line-height:1.8;">
                  <li>Please review the appointment in the EMR.</li>
                  <li>Contact the patient if any additional information is required.</li>
                  <li>Do not request payment again if payment status is CAPTURED.</li>
                </ul>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">Online Nephrologist / Kidney Care Centre</p>
              <p style="color:#94a3b8;font-size:11px;margin:0;">This is an automated notification. Please do not reply directly to this email.</p>
            </div>

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

export async function sendLoginDetailsEmail(
  to: string,
  details: { firstName: string; uhid: string; phone: string; email: string }
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.error('[email] RESEND_API_KEY not set — login details email not sent');
    return { success: false, error: 'Email service not configured.' };
  }

  const from = 'KCC <no-reply@onlinenephrologist.com>';

  try {
    await resend.emails.send({
      from,
      to,
      subject: 'Your Login Details — Kidney Care Centre',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;background:#f1f5f9;margin:0;padding:24px;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
            ${KCC_BRAND}
            <h2 style="text-align:center;color:#0f172a;margin:0 0 8px;">Your Login Details</h2>
            <p style="text-align:center;color:#64748b;font-size:14px;margin:0 0 24px;">Kidney Care Centre — Patient Portal</p>
            <p style="color:#334155;font-size:14px;margin:0 0 16px;">Hi ${details.firstName},</p>
            <p style="color:#64748b;font-size:13px;margin:0 0 20px;">As requested, here are your login details. Please save them for future logins:</p>
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px;margin-bottom:20px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-size:13px;width:80px;">UHID</td>
                  <td style="padding:6px 0;color:#0369a1;font-size:14px;font-weight:bold;font-family:monospace;">${details.uhid}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-size:13px;">Phone</td>
                  <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${details.phone}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-size:13px;">Email</td>
                  <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${details.email}</td>
                </tr>
              </table>
            </div>
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
              <p style="color:#92400e;font-size:12px;margin:0;"><strong>How to log in next time:</strong> Go to <a href="https://onlinenephrologist.com/patient/login" style="color:#0369a1;">Patient Login</a> → Enter your phone number + UHID</p>
            </div>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">If you didn't request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[email] Failed to send login details:', err.message);
    return { success: false, error: 'Failed to send email.' };
  }
}
