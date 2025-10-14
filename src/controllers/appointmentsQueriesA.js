const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/authMiddleware');
const authZ = require('../middleware/authZMiddleware');
const asyncHandler = require('express-async-handler');
// REMOVED: const { body, param, validationResult } = require('express-validator');

// NEW ZOD IMPORTS
const validate = require('../middleware/validate');
const { CreateAppointmentSchema, UpdateAppointmentSchema, IdParamSchema } = require('../middleware/appointments.schemas');
// END NEW ZOD IMPORTS

// Get our Appointment model
const { Appointment } = db;

// REMOVED: Middleware to handle validation results (handleValidationErrors)

//routes for admin to manage all appointments
// GET /appointments - Fetches all appointments (Admin only)
router.get('/', auth.isAuthenticated, authZ.isAdmin, asyncHandler(async (req, res) => {
  const appointments = await Appointment.findAll();
  res.json(appointments);
}));

// POST /appointments - Creates a new appointment (Admin only)
router.post(
  '/',
  auth.isAuthenticated,
  authZ.isAdmin,
  // NEW ZOD VALIDATION
  validate(CreateAppointmentSchema), 
  asyncHandler(async (req, res) => {
    const newAppointment = await Appointment.create(req.body);
    res.status(201).json({
      msg: 'Appointment created successfully!',
      appointment: newAppointment,
    });
  })
);

// PUT /appointments/:id - Updates an existing appointment (Admin only)
router.put(
  '/:id',
  auth.isAuthenticated,
  authZ.isAdmin,
  // NEW ZOD VALIDATION
  validate(UpdateAppointmentSchema),
  asyncHandler(async (req, res) => {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    const updatedAppointment = await appointment.update(req.body);
    res.json({ msg: 'Appointment updated successfully!', appointment: updatedAppointment });
  })
);

// DELETE /appointments/:id - Deletes an appointment (Admin only)
router.delete(
  '/:id',
  auth.isAuthenticated,
  authZ.isAdmin,
  // NEW ZOD VALIDATION
  validate(IdParamSchema),
  asyncHandler(async (req, res) => {
    const appointmentId = req.params.id;
    const result = await Appointment.destroy({
      where: { appointment_id: appointmentId },
    });

    if (result === 0) {
      return res.status(404).json({ msg: 'Appointment not found.' });
    }
    
    res.json({ msg: 'Appointment deleted successfully.' });
  })
);

module.exports = router;