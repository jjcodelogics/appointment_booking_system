import { Router } from 'express';
const router = Router();
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/authZMiddleware.js';
import asyncHandler from 'express-async-handler';
import validate from '../middleware/validate.js';
import { z } from 'zod';
import { canAccess } from '../middleware/authZMiddleware.js'; 

// FIX 1: Import the schemas object (default export)
import appointmentsSchemas from '../middleware/appointments.schemas.js';
// FIX 2: Destructure the needed schemas from the object
const { CreateAppointmentSchema, UpdateAppointmentSchema, IdParamSchema } = appointmentsSchemas;

import dbModels from '../models/index.js'; 
// FIX 3: Destructure all needed models from dbModels
const { User, Appointment } = dbModels; 


//routes for admin to manage all appointments
// GET /appointments - Fetches all appointments (Admin only)
router.get('/', isAuthenticated, canAccess(['admin']), asyncHandler(async (req, res) => {
  const appointments = await Appointment.findAll();
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