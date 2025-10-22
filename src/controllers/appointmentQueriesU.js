import { Router } from 'express';
import asyncHandler from 'express-async-handler';
// Correctly import the default export (no curly braces)
import validate from '../middleware/validate.js';
import { isAuthenticated, canAccess } from '../middleware/auth.js';
import { appointmentsSchemas } from '../middleware/appointments.schemas.js';
import db from '../models/index.js';

const router = Router();

// routes for users to manage their own appointments

// GET /myappointments - Fetches all appointments for the logged-in user

router.get('/', isAuthenticated, canAccess(['user', 'admin']), asyncHandler(async (req, res) => {
  const { Appointment, User } = db;

  if (!Appointment) {
    return res.status(500).json({ msg: 'Server error: Appointment model not loaded' });
  }

  try {
    let appointments;
    if (req.user && req.user.role === 'admin') {
      // admin: return all appointments with basic user info
      appointments = await Appointment.findAll({
        include: [{ model: User, as: 'User', attributes: ['user_id', 'username_email', 'name'] }],
        order: [['appointment_date', 'ASC']],
      });
    } else {
      // regular user: only their appointments
      appointments = await Appointment.findAll({
        where: { user_id: req.user.user_id },
        order: [['appointment_date', 'ASC']],
      });
    }

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return res.status(500).json({ msg: 'Server error fetching appointments.', error: err?.message });
  }
}));

// GET /me - returns current user info
router.get('/me', isAuthenticated, (req, res) => {
  res.json({ name: req.user.name, email: req.user.username_email });
});

// GET /appointments/slots - returns all booked slots (date/time only)
router.get('/appointments/slots', asyncHandler(async (req, res) => {
  const { Appointment } = db;
  if (!Appointment) return res.status(500).json({ msg: 'Server error: Appointment model not loaded' });

  const slots = await Appointment.findAll({
    attributes: ['appointment_date'],
  });

  res.json(slots);
}));

// POST /myappointments/book - Creates a new appointment
router.post(
  '/book',
  isAuthenticated,
  canAccess(['user', 'admin']),
  // Use the correct schema path
  validate(appointmentsSchemas.create),
  asyncHandler(async (req, res) => {
    const { Appointment, Service } = db;
    if (!Appointment || !Service) return res.status(500).json({ msg: 'Server error: models not loaded' });

    const { appointment_date, gender, washing, coloring, cut, notes } = req.body;
    const newDate = new Date(appointment_date);

    if (Number.isNaN(newDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid appointment_date.' });
    }

    const existing = await Appointment.findOne({
      where: { appointment_date: newDate }
    });

    if (existing) {
      return res.status(409).json({ msg: 'This time slot is already booked. Please choose another.' });
    }

    const day = newDate.getDay();
    const hour = newDate.getHours();

    if (!isBusinessOpen(day, hour)) {
      return res.status(400).json({ msg: 'The selected time is outside of business hours.' });
    }

    const selectedService = await Service.findOne({
      where: {
        gender_target: gender,
        washing: washing,
        coloring: coloring,
        cutting: cut,
      }
    });

    if (!selectedService) {
      return res.status(404).json({ msg: 'No matching service found for your selected options.' });
    }

    const serviceId = selectedService.service_id;

    const newAppointment = await Appointment.create({
      user_id: req.user.user_id,
      appointment_date: newDate,
      service_id: serviceId,
      notes
    });

    return res.status(201).json({
      msg: 'Appointment booked successfully!',
      appointment: newAppointment,
    });
  })
);

// --- Helper function for business hours ---
function isBusinessOpen(day, hour) {
  if (day === 0 || day === 1) return false;

  if (day >= 2 && day <= 5) {
    return hour >= 9 && hour < 19;
  }

  if (day === 6) {
    return hour >= 8 && hour < 17;
  }

  return false;
}

// PUT /myappointments/reschedule/:id - Reschedules an existing appointment
router.put(
  '/reschedule/:id',
  isAuthenticated,
  canAccess(['user', 'admin']),
  // Use the new, correct schema
  validate(appointmentsSchemas.reschedule),
  asyncHandler(async (req, res) => {
    const { Appointment, Sequelize } = db;
    const Op = Sequelize?.Op;
    if (!Appointment) return res.status(500).json({ msg: 'Server error: Appointment model not loaded' });

    const appointmentId = req.params.id;
    const { appointment_date } = req.body;
    const newDate = new Date(appointment_date);

    if (Number.isNaN(newDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid appointment_date.' });
    }

    const appointment = await Appointment.findOne({
      where: { appointment_id: appointmentId, user_id: req.user.user_id },
    });

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found or you do not have permission to edit it.' });
    }

    if (appointment.appointment_date && new Date(appointment.appointment_date).getTime() === newDate.getTime()) {
      return res.status(400).json({ msg: 'New appointment date is the same as the current one.' });
    }

    const day = newDate.getDay();
    const hour = newDate.getHours();
    if (!isBusinessOpen(day, hour)) {
      return res.status(400).json({ msg: 'The selected time is outside of business hours.' });
    }

    const existing = await Appointment.findOne({
      where: {
        appointment_date: newDate,
        appointment_id: { [Op.ne]: appointmentId },
      }
    });

    if (existing) {
      return res.status(409).json({ msg: 'This time slot is already booked. Please choose another.' });
    }

    appointment.appointment_date = newDate;
    await appointment.save();

    return res.json({ msg: 'Appointment rescheduled successfully!', appointment });
  })
);

// DELETE /myappointments/cancel/:id - Cancels an appointment
router.delete(
  '/cancel/:id',
  isAuthenticated,
  canAccess(['user', 'admin']),
  // Use the correct schema for validating an ID in the URL parameters
  validate(appointmentsSchemas.byId),
  asyncHandler(async (req, res) => {
    const { Appointment } = db;
    const { id } = req.params;

    const result = await Appointment.destroy({
      where: { appointment_id: id, user_id: req.user.user_id },
    });

    if (result === 0) {
      return res.status(404).json({ msg: 'Appointment not found or you do not have permission to cancel it.' });
    }

    res.json({ msg: 'Appointment cancelled successfully.' });
  })
);

export default router;