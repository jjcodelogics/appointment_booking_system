// Vercel Cron Job endpoint for sending appointment reminders
// Configure in vercel.json under "crons"
import { Op } from 'sequelize';
import { initializeModels } from '../src/models/index.js';
import { sendAppointmentReminder } from '../src/services/emailService.js';

// Initialize models on cold start
await initializeModels();

import db from '../src/models/index.js';
const { Appointment, User } = db;

export default async function handler(req, res) {
  // Verify the request is from Vercel Cron
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Running hourly check for appointment reminders...');

  // Find appointments that are today and haven't had a reminder sent yet
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    // only add reminder_sent filter if the column exists on the model
    const whereClause = {
      appointment_date: {
        [Op.between]: [todayStart, todayEnd],
      },
    };

    if (Appointment && Appointment.rawAttributes && Appointment.rawAttributes.reminder_sent) {
      whereClause.reminder_sent = false;
    }

    const appointmentsToSend = await Appointment.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['username_email'] }],
    });

    if (appointmentsToSend.length === 0) {
      console.log('No reminders to send this hour.');
      return res.status(200).json({ message: 'No reminders to send', count: 0 });
    }

    console.log(`Found ${appointmentsToSend.length} reminders to send.`);

    let successCount = 0;
    let failCount = 0;

    for (const appt of appointmentsToSend) {
      // skip if there's no associated User or email
      if (!appt.User || !appt.User.username_email) {
        console.warn(`Skipping appointment id=${appt.id} — no user email found.`);
        failCount++;
        continue;
      }

      try {
        // use the imported function directly
        await sendAppointmentReminder(appt.User.username_email, appt);

        // Update the flag in the database to prevent re-sending if the column exists
        if (Appointment && Appointment.rawAttributes && Appointment.rawAttributes.reminder_sent) {
          appt.reminder_sent = true;
          await appt.save();
        }
        successCount++;
      } catch (err) {
        console.error(`Failed to send reminder for appointment id=${appt.id}:`, err);
        failCount++;
        // continue with next appointment
      }
    }

    return res.status(200).json({
      message: 'Reminder job completed',
      total: appointmentsToSend.length,
      success: successCount,
      failed: failCount,
    });
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
