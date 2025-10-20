import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import validate from '../middleware/validate.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { isAdmin, canAccess } from '../middleware/authZMiddleware.js';
import dbModels from '../models/index.js';
import appointmentsSchemas from '../middleware/appointments.schemas.js';

const router = Router();
const { CreateAppointmentSchema, UpdateAppointmentSchema, IdParamSchema } = appointmentsSchemas || {};
const { User, Appointment } = dbModels || {};

//routes for admin to manage all appointments
// GET /appointments - Fetches all appointments (Admin only)
router.get('/', isAuthenticated, canAccess(['admin']), asyncHandler(async (req, res) => {
  // runtime import to avoid ordering/circular problems
  const dbModule = (await import('../models/index.js')).default;
  const { Appointment, User } = dbModule || {};
  if (!Appointment) {
    console.error('Appointment model not loaded in admin GET /appointments', Object.keys(dbModule || {}));
    return res.status(500).json({ msg: 'Server error: Appointment model not loaded' });
  }

  // include user so admin sees who booked each appointment
  const appointments = await Appointment.findAll({
    include: [{ model: User, as: 'User', attributes: ['user_id', 'username_email', 'name'] }],
    order: [['appointment_date', 'ASC']],
  });
  res.json(appointments);
}));

// POST /appointments - Creates a new appointment (Admin only)
router.post(
  '/',
  isAuthenticated,
  isAdmin,
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
  isAuthenticated,
  isAdmin,
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
  isAuthenticated,
  isAdmin,
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

export default router;