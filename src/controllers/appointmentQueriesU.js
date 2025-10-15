import { Router } from 'express';
const router = Router();
// FIX 1: Import the default object (which contains isAuthenticated)
import authExports from '../middleware/authMiddleware.js'; 
const { isAuthenticated } = authExports; // FIX 2: Destructure the function from the object

import { canAccess } from '../middleware/authZMiddleware.js'; // This is a correct Named Export from its file

import asyncHandler from 'express-async-handler';
import { sendBookingConfirmation } from '../services/emailService.js';
import { z } from 'zod';
import validate from '../middleware/validate.js';

// Correct Schema Destructuring from default export
import appointmentsSchemas from '../middleware/appointments.schemas.js'; 
const { IdParamSchema, idSchema, appointmentDateSchema } = appointmentsSchemas;

// Correct Model Destructuring from default export
import dbModels from '../models/index.js'; 
const { User, Appointment } = dbModels; 


// routes for users to manage their own appointments

// GET /myappointments - Fetches all appointments for the logged-in user
router.get('/', isAuthenticated, canAccess, asyncHandler(async (req, res) => {
  const appointments = await Appointment.findAll({
    where: { user_id: req.user.user_id },
  });
  res.json(appointments);
}));

// POST /myappointments/book - Creates a new appointment
router.post(
  '/book',
  isAuthenticated,
  canAccess,
  // NEW ZOD VALIDATION (Inline Schema Composition)
  validate(z.object({
    body: z.object({
        appointment_date: appointmentDateSchema,
        service_id: idSchema,
        employee_id: idSchema,
        notes: z.string().trim().max(255).optional(), 
    }),
    // Always include these to ensure no extra data is passed
    params: z.object({}).optional(), 
    query: z.object({}).optional(),
  })),
  asyncHandler(async (req, res) => {
    const { appointment_date, service_id, employee_id, notes } = req.body;

    const newAppointment = await Appointment.create({
      user_id: req.user.user_id,
      appointment_date,
      service_id,
      employee_id,
      notes
    });
    // Send confirmation email
    sendBookingConfirmation(req.user.username_email, newAppointment);
    res.status(201).json({
      msg: 'Appointment booked successfully!',
      appointment: newAppointment,
    });
  })
);

// PUT /myappointments/reschedule/:id - Reschedules an existing appointment
router.put(
  '/reschedule/:id',
  isAuthenticated,
  canAccess,
  // NEW ZOD VALIDATION (Combining param validation and body validation)
  validate(z.object({
    params: IdParamSchema.shape.params, // Re-use ID validation for the URL parameter
    body: z.object({
        appointment_date: appointmentDateSchema, // Only require the new date
    }),
  })),
  asyncHandler(async (req, res) => {
    const appointmentId = req.params.id;
    const { appointment_date } = req.body;

    const appointment = await Appointment.findOne({
      where: { appointment_id: appointmentId, user_id: req.user.user_id },
    });

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found or you do not have permission to edit it.' });
    }

    appointment.appointment_date = appointment_date;
    await appointment.save();

    res.json({ msg: 'Appointment rescheduled successfully!', appointment });
  })
);

// DELETE /myappointments/cancel/:id - Cancels an appointment
router.delete(
  '/cancel/:id',
  isAuthenticated,
  canAccess,
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