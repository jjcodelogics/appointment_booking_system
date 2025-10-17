import { Router } from 'express';
const router = Router();
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { canAccess } from '../middleware/authZMiddleware.js'; // This is a correct Named Export from its file
import asyncHandler from 'express-async-handler';
import { sendBookingConfirmation, sendAppointmentReminder } from '../services/emailService.js';
import { z } from 'zod';
import validate from '../middleware/validate.js';

// Correct Schema Destructuring from default export
import { appointmentDateSchema } from '../middleware/appointments.schemas.js';
import schemas from '../middleware/appointments.schemas.js'; 
const { CreateAppointmentSchema, UpdateAppointmentSchema, IdParamSchema, idSchema } = schemas;

// Correct Model Destructuring from default export
import dbModels from '../models/index.js'; 
const { User, Appointment, Service } = dbModels; 


// routes for users to manage their own appointments

// GET /myappointments - Fetches all appointments for the logged-in user

router.get('/', isAuthenticated, canAccess(['user', 'admin']), asyncHandler(async (req, res) => {
  try {
    console.log('User:', req.user);
    const appointments = await Appointment.findAll({
      where: { user_id: req.user.user_id },
    });
    console.log('Appointments:', appointments);
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ msg: 'Server error fetching appointments.' });
  }
}));

// GET /me - returns current user info
router.get('/me', isAuthenticated, (req, res) => {
  res.json({ name: req.user.name, email: req.user.username_email });
});

// GET /appointments/slots - returns all booked slots (date/time only)
router.get('/appointments/slots', asyncHandler(async (req, res) => {
  const appointments = await Appointment.findAll({
    attributes: ['appointment_date'],
    where: { status: 'booked' }
  });
  res.json(appointments);
}));

// POST /myappointments/book - Creates a new appointment
router.post(
  '/book',
  isAuthenticated,
  canAccess(['user', 'admin']),
  // NEW ZOD VALIDATION (Inline Schema Composition)
  validate(z.object({
    body: z.object({
      appointment_date: appointmentDateSchema,
      gender: z.enum(['male', 'female']),
      washing: z.boolean(),
      coloring: z.boolean(),
      cut: z.boolean(),
      status: z.enum(['scheduled', 'completed', 'canceled']).optional(),
      employee_name: z.string().optional(),
      notes: z.string().trim().max(255).optional(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  })),
  asyncHandler(async (req, res) => {
    // 1. Extract validated fields from the body
    const { appointment_date, gender, washing, coloring, cut, employee_name, notes } = req.body;
    const newDate = new Date(appointment_date);

    // 2. Basic date validation
    if (Number.isNaN(newDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid appointment_date.' });
    }

    // --- FIX #6: CHECK FOR DOUBLE BOOKING ---
    const existing = await Appointment.findOne({
      where: { appointment_date: newDate }
    });

    if (existing) {
      return res.status(409).json({ msg: 'This time slot is already booked. Please choose another.' });
    }

    // --- FIX #5: CHECK BUSINESS HOURS ---
    const day = newDate.getDay(); // 0 = Sunday, ..., 6 = Saturday
    const hour = newDate.getHours();

    if (!isBusinessOpen(day, hour)) {
      return res.status(400).json({ msg: 'The selected time is outside of business hours.' });
    }

    // 3. Look up the Service ID based on the client's selected attributes
    console.log('Service Lookup Parameters:', {
      gender_target: gender,
      washing: washing,
      coloring: coloring,
      cutting: cut
    });

    const selectedService = await Service.findOne({
      where: {
        gender_target: gender,
        washing: washing,
        coloring: coloring,
        cutting: cut,
      }
    });

    // 4. Handle case where no service matches the criteria
    if (!selectedService) {
      return res.status(404).json({ msg: 'No matching service found for your selected options.' });
    }

    // Define defaults/retrieved IDs
    const serviceId = selectedService.service_id;
    const DEFAULT_EMPLOYEE_ID = 1;

    // 5. Create the appointment using only the foreign keys (service_id, employee_id)
    const newAppointment = await Appointment.create({
      user_id: req.user.user_id,
      appointment_date: newDate,
      status: 'scheduled',
      service_id: serviceId,
      employee_id: DEFAULT_EMPLOYEE_ID,
      notes
    });
    
    // Send confirmation email (fire-and-forget)
    try {
      sendBookingConfirmation(req.user.username_email, newAppointment);
    } catch (err) {
      console.error('Error sending confirmation email:', err);
    }

    // 6. Return success
    return res.status(201).json({
      msg: 'Appointment booked successfully!',
      appointment: newAppointment,
    });
  }) // end asyncHandler
); // end router.post

// --- Helper function for business hours ---
function isBusinessOpen(day, hour) {
  // Sun (0) or Mon (1)
  if (day === 0 || day === 1) return false;

  // Tue-Fri (2-5): 9:00 - 18:59
  if (day >= 2 && day <= 5) {
    return hour >= 9 && hour < 19;
  }

  // Sat (6): 8:00 - 16:59
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
  validate(z.object({
    params: IdParamSchema.shape.params,
    body: z.object({
      appointment_date: appointmentDateSchema,
    }),
  })),
  asyncHandler(async (req, res) => {
    const appointmentId = req.params.id;
    const { appointment_date } = req.body;
    const newDate = new Date(appointment_date);

    // Validate date
    if (Number.isNaN(newDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid appointment_date.' });
    }

    // Find appointment and check ownership
    const appointment = await Appointment.findOne({
      where: { appointment_id: appointmentId, user_id: req.user.user_id },
    });

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found or you do not have permission to edit it.' });
    }

    // Prevent rescheduling to the same slot (optional)
    if (appointment.appointment_date && new Date(appointment.appointment_date).getTime() === newDate.getTime()) {
      return res.status(400).json({ msg: 'New appointment date is the same as the current one.' });
    }

    // --- CHECK BUSINESS HOURS ---
    const day = newDate.getDay();
    const hour = newDate.getHours();
    if (!isBusinessOpen(day, hour)) {
      return res.status(400).json({ msg: 'The selected time is outside of business hours.' });
    }

    // --- CHECK FOR DOUBLE BOOKING (exclude current appointment) ---
    const existing = await Appointment.findOne({
      where: {
        appointment_date: newDate,
        appointment_id: { [Op.ne]: appointmentId }, // requires Sequelize.Op (import as Op)
      }
    });

    if (existing) {
      return res.status(409).json({ msg: 'This time slot is already booked. Please choose another.' });
    }

    // Save new date
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
  // NEW ZOD VALIDATION
  validate(IdParamSchema),
  asyncHandler(async (req, res) => {
    const appointmentId = req.params.id;
    
    const result = await Appointment.destroy({
      where: { appointment_id: appointmentId, user_id: req.user.user_id },
    });

    if (result === 0) {
      return res.status(404).json({ msg: 'Appointment not found or you do not have permission to cancel it.' });
    }

    res.json({ msg: 'Appointment cancelled successfully.' });
  })
);

export default router;