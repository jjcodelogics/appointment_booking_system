import { Router } from 'express';
const router = Router();
import { isAuthenticated } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

// Route to fetch current user info
router.get('/me', isAuthenticated, asyncHandler(async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ msg: 'Unauthorized' });
  }
}));

// Route to fetch all booked appointment slots
router.get('/appointments/slots', isAuthenticated, asyncHandler(async (req, res) => {
  const slots = await Appointment.findAll({
    attributes: ['appointment_date', 'time_slot'], // Adjust attributes as needed
  });
  res.json(slots);
}));

export default router;