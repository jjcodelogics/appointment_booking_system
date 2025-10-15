import { schedule } from 'node-cron';
import { Op } from 'sequelize';
import db from './src/models/index.js';
import emailService from './src/services/emailService.js';

const { Appointment, User } = db;

// Schedule a task to run every hour, at the start of the hour.
// Cron syntax: [minute] [hour] [day_of_month] [month] [day_of_week]
// '0 * * * *' means "at minute 0 of every hour"
const startReminderScheduler = () => {
  schedule('0 * * * *', async () => {
    console.log('Running hourly check for appointment reminders...');

    // Find appointments that are today and haven't had a reminder sent yet
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    try {
      const appointmentsToSend = await Appointment.findAll({
        where: {
          appointment_date: {
            [Op.between]: [todayStart, todayEnd],
          },
          reminder_sent: false, // The crucial part!
        },
        include: [{ model: User, attributes: ['username_email'] }] // Get the user's email
      });

      if (appointmentsToSend.length === 0) {
        console.log('No reminders to send this hour.');
        return;
      }

      console.log(`Found ${appointmentsToSend.length} reminders to send.`);

      for (const appt of appointmentsToSend) {
        // Send the reminder
        await emailService.sendAppointmentReminder(appt.User.username_email, appt);

        // Update the flag in the database to prevent re-sending
        appt.reminder_sent = true;
        await appt.save();
      }

    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });
};

export default { startReminderScheduler };