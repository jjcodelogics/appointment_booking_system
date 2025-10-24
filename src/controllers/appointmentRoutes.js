import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import validate from '../middleware/validate.js';
import { isAuthenticated, canAccess } from '../middleware/auth.js';
import { appointmentsSchemas } from '../middleware/appointments.schemas.js';
import db from '../models/index.js';

const router = Router();

// --- Helper function for business hours ---
function isBusinessOpen(day, hour) {
  // Sunday (0) or Monday (1) are closed
  if (day === 0 || day === 1) return false;
  // Tue-Fri (2-5) from 9 AM to 7 PM (19:00)
  if (day >= 2 && day <= 5) {
    return hour >= 9 && hour < 19;
  }
  // Saturday (6) from 8 AM to 5 PM (17:00)
  if (day === 6) {
    return hour >= 8 && hour < 17;
  }
  return false;
}

// GET /api/appointments/slots - returns all booked slots for a given date
router.get('/slots', asyncHandler(async (req, res) => {
    const { Appointment, Sequelize } = db;
    const { date } = req.query; // Expecting a date string like 'YYYY-MM-DD'

    if (!date) {
        return res.status(400).json({ msg: 'A date query parameter is required.' });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const slots = await Appointment.findAll({
        where: {
            appointment_date: {
                [Sequelize.Op.between]: [startDate, endDate],
            },
        },
        attributes: ['appointment_date'],
    });

    res.json(slots.map(slot => slot.appointment_date));
}));


// GET /api/appointments/my-appointments - Fetches all appointments for the logged-in user
router.get('/my-appointments', isAuthenticated, canAccess(['user', 'admin']), asyncHandler(async (req, res) => {
  const { Appointment, User, Service } = db;

  try {
    let appointments;
    if (req.user && req.user.role === 'admin') {
      appointments = await Appointment.findAll({
        include: [{ model: User, as: 'User', attributes: ['user_id', 'username_email', 'name'] }],
        order: [['appointment_date', 'ASC']],
      });
    } else {
      appointments = await Appointment.findAll({
        where: { user_id: req.user.user_id },
        include: [{ model: Service, as: 'Service' }],
        order: [['appointment_date', 'ASC']],
      });
    }
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ msg: 'Server error fetching appointments.', error: err?.message });
  }
}));

// POST /api/appointments/book - Creates a new appointment
router.post(
  '/book',
  isAuthenticated,
  canAccess(['user', 'admin']),
  validate(appointmentsSchemas.create),
  asyncHandler(async (req, res) => {
    const { Appointment, Service, Sequelize } = db;
    const { appointment_date, gender, washing, coloring, cut, notes } = req.body;
    const newDate = new Date(appointment_date);

    if (isNaN(newDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid appointment_date.' });
    }

    const existing = await Appointment.findOne({ where: { appointment_date: newDate } });
    if (existing) {
      return res.status(409).json({ msg: 'This time slot is already booked. Please choose another.' });
    }

    const day = newDate.getDay();
    const hour = newDate.getHours();
    if (!isBusinessOpen(day, hour)) {
      return res.status(400).json({ msg: 'The selected time is outside of business hours.' });
    }

    const serviceQuery = {
      gender_target: gender,
      ...(cut && { cutting: true }),
      ...(washing && { washing: true }),
      ...(coloring && { coloring: true }),
    };

    if (!cut && !washing && !coloring) {
      return res.status(400).json({ msg: 'You must select at least one service (cut, wash, or color).' });
    }

    const selectedService = await Service.findOne({
      where: serviceQuery,
      order: [['cutting', 'DESC'], ['washing', 'DESC'], ['coloring', 'DESC']],
    });

    if (!selectedService) {
      return res.status(404).json({ msg: 'No matching service found for your selected options.' });
    }

    const newAppointment = await Appointment.create({
      user_id: req.user.user_id,
      appointment_date: newDate,
      service_id: selectedService.service_id,
      notes,
    });

    res.status(201).json({ msg: 'Appointment booked successfully!', appointment: newAppointment });
  })
);

// PUT /api/appointments/reschedule/:id - Reschedules an existing appointment
router.put(
  '/reschedule/:id',
  isAuthenticated,
  canAccess(['user', 'admin']),
  validate(appointmentsSchemas.reschedule),
  asyncHandler(async (req, res) => {
    const { Appointment, Sequelize } = db;
    const appointmentId = req.params.id;
    const { appointment_date } = req.body;
    const newDate = new Date(appointment_date);

    if (isNaN(newDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid appointment_date.' });
    }

    const whereClause = { appointment_id: appointmentId };
    if (req.user.role !== 'admin') {
        whereClause.user_id = req.user.user_id;
    }

    const appointment = await Appointment.findOne({ where: whereClause });
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found or you do not have permission to edit it.' });
    }

    const day = newDate.getDay();
    const hour = newDate.getHours();
    if (!isBusinessOpen(day, hour)) {
      return res.status(400).json({ msg: 'The selected time is outside of business hours.' });
    }

    const existing = await Appointment.findOne({
      where: {
        appointment_date: newDate,
        appointment_id: { [Sequelize.Op.ne]: appointmentId },
      }
    });
    if (existing) {
      return res.status(409).json({ msg: 'This time slot is already booked. Please choose another.' });
    }

    appointment.appointment_date = newDate;
    await appointment.save();

    res.json({ msg: 'Appointment rescheduled successfully!', appointment });
  })
);

// DELETE /api/appointments/cancel/:id - Cancels an appointment
router.delete(
  '/cancel/:id',
  isAuthenticated,
  canAccess(['user', 'admin']),
  validate(appointmentsSchemas.byId),
  asyncHandler(async (req, res) => {
    const { Appointment } = db;
    const { id } = req.params;

    const whereClause = { appointment_id: id };
    if (req.user.role !== 'admin') {
        whereClause.user_id = req.user.user_id;
    }

    const result = await Appointment.destroy({ where: whereClause });
    if (result === 0) {
      return res.status(404).json({ msg: 'Appointment not found or you do not have permission to cancel it.' });
    }

    res.json({ msg: 'Appointment cancelled successfully.' });
  })
);

export default router;