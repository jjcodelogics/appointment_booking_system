// services/emailService.js

import { createTransport, createTestAccount, getTestMessageUrl } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

let transporter;
let transporterMode = 'none';

// Primary: Use real SMTP transport when EMAIL_HOST is present
if (process.env.EMAIL_HOST) {
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
  const secure = process.env.EMAIL_SECURE === 'true'; // true for 465, false for other ports
  transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: process.env.EMAIL_USER ? {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    } : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  });
  transporterMode = 'smtp';
  console.log('EmailService: configured SMTP transporter (EMAIL_HOST present).');
} else if (process.env.NODE_ENV !== 'production') {
  // Development fallback: create an Ethereal test account so emails can be inspected
  try {
    const testAccount = await createTestAccount();
    transporter = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    transporterMode = 'ethereal';
    console.log('EmailService: using Ethereal test account for local email testing.');
  } catch (err) {
    console.error('EmailService: failed to create Ethereal test account:', err);
    // Fallback to no-op transporter if Ethereal creation fails
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('Email sending skipped (no transporter available).', mailOptions && mailOptions.to);
        return Promise.resolve({ accepted: [], response: 'skipped' });
      },
    };
    transporterMode = 'noop';
  }
} else {
  // Production without SMTP: do not attempt to send or create test accounts
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('Email sending skipped (missing SMTP config).', mailOptions && mailOptions.to);
      return Promise.resolve({ accepted: [], response: 'skipped' });
    },
  };
  transporterMode = 'noop';
  console.warn('EmailService: no SMTP configured and running in production - emails will be skipped.');
}

// Helper to actually send and log preview URL for Ethereal
async function _sendMail(mailOptions) {
  if (!transporter) throw new Error('No transporter configured');
  const info = await transporter.sendMail(mailOptions);
  console.log(`EmailService: mail sent (mode=${transporterMode}), messageId=${info.messageId}`);
  if (transporterMode === 'ethereal') {
    try {
      const preview = getTestMessageUrl(info);
      if (preview) console.log('EmailService: preview URL:', preview);
      // Attach preview URL to the returned info for callers
      info.previewUrl = preview || null;
    } catch (err) {
      console.warn('EmailService: failed to get Ethereal preview URL:', err);
    }
  }
  return info;
}

// 2. Create a reusable function to send the confirmation email
const sendBookingConfirmation = async (userEmail, appointmentDetails) => {
  if (!userEmail) {
    console.warn('sendBookingConfirmation called without userEmail; skipping.');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@yourapp.local',
    to: userEmail,
    subject: 'Your Appointment is Confirmed!',
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Hi there,</p>
      <p>This is a confirmation that your appointment has been booked for:</p>
      <p><b>Date:</b> ${new Date(appointmentDetails.appointment_date).toDateString()}</p>
      <p><b>Time:</b> ${new Date(appointmentDetails.appointment_date).toLocaleTimeString()}</p>
      <p>We look forward to seeing you!</p>
    `,
  };

  try {
    const result = await _sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Do not throw — keep behavior resilient
  }
};

// 3. Create a function for the reminder email
const sendAppointmentReminder = async (userEmail, appointmentDetails) => {
  if (!userEmail) {
    console.warn('sendAppointmentReminder called without userEmail; skipping.');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@yourapp.local',
    to: userEmail,
    subject: 'Appointment Reminder',
    html: `
      <h1>Appointment Reminder</h1>
      <p>Hi there,</p>
      <p>This is a reminder for your upcoming appointment on:</p>
      <p><b>Date:</b> ${new Date(appointmentDetails.appointment_date).toDateString()}</p>
      <p><b>Time:</b> ${new Date(appointmentDetails.appointment_date).toLocaleTimeString()}</p>
      <p>We look forward to seeing you!</p>
    `,
  };

  try {
    const result = await _sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    // resilient
  }
};

export {
  sendBookingConfirmation,
  sendAppointmentReminder,
};
