const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/authMiddleware');
const authZ = require('../middleware/authZMiddleware');
const asyncHandler = require('express-async-handler');
// REMOVED: const { body, param, validationResult } = require('express-validator');
const emailService = require('../services/emailService');

// NEW ZOD IMPORTS
const { z } = require('zod');
const validate = require('../middleware/validate');
const { 
  IdParamSchema, 
  idSchema, 
  appointmentDateSchema 
} = require('../middleware/appointments.schemas');
// END NEW ZOD IMPORTS

// Get our Appointment model from the database connection
const { Appointment } = db;

// REMOVED: Middleware to handle validation results (handleValidationErrors)

// routes for users to manage their own appointments

// GET /myappointments - Fetches all appointments for the logged-in user
router.get('/', auth.isAuthenticated, authZ.canAccess, asyncHandler(async (req, res) => {
  const appointments = await Appointment.findAll({
    where: { user_id: req.user.user_id },
  });
  res.json(appointments);
}));

// POST /myappointments/book - Creates a new appointment
router.post(
  '/book',
  auth.isAuthenticated,
  authZ.canAccess,
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
    emailService.sendBookingConfirmation(req.user.username_email, newAppointment);
    res.status(201).json({
      msg: 'Appointment booked successfully!',
      appointment: newAppointment,
    });
  })
);

// PUT /myappointments/reschedule/:id - Reschedules an existing appointment
router.put(
  '/reschedule/:id',
  auth.isAuthenticated,
  authZ.canAccess,
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
  auth.isAuthenticated,
  authZ.canAccess,
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

module.exports = router;