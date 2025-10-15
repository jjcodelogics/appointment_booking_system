 // services/emailService.js

import { createTransport } from 'nodemailer';

// 1. Create a "transporter" - this is the object that can send mail
const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // For SendGrid, this is the string "apikey"
    pass: process.env.EMAIL_PASS, // This is your SendGrid API key
  },
});

// 2. Create a reusable function to send the confirmation email
const sendBookingConfirmation = async (userEmail, appointmentDetails) => {
  const mailOptions = {
    from: '"Your App Name" <no-reply@yourapp.com>',
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
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully.');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

// 3. Create a function for the reminder email
const sendAppointmentReminder = async (userEmail, appointmentDetails) => {
    const mailOptions = {
      from: '"Your App Name" <no-reply@yourapp.com>',
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
      await transporter.sendMail(mailOptions);
      console.log('Reminder email sent successfully.');
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
};

export {
  sendBookingConfirmation,
  sendAppointmentReminder,
};
