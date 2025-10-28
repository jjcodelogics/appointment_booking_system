import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import validate from '../middleware/validate.js';
import { isAuthenticated, canAccess } from '../middleware/auth.js';
import { adminSchemas } from '../middleware/admin.schemas.js';
import { adminRateLimit } from '../middleware/rateLimiter.js';
import { logAdminAction } from '../services/auditLogger.js';
import db from '../models/index.js';

const router = Router();

// Apply rate limiting to all admin routes
// This middleware applies to ALL routes defined below in this router
// Rate limit: 200 requests per 15 minutes per IP address
router.use(adminRateLimit);

// Helper function for business hours (same as in appointmentRoutes)
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

// Helper to get start and end of current week (Monday to Sunday)
function getCurrentWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday

  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

// GET /api/admin/appointments - Get appointments with filters (default: current week)
router.get(
  '/appointments',
  isAuthenticated,
  canAccess(['admin']),
  validate(adminSchemas.filterAppointments),
  asyncHandler(async (req, res) => {
    const { Appointment, User, Service, Sequelize } = db;
    const { start_date, end_date, status, staff, search } = req.query;

    // Default to current week if no dates provided
    const weekRange = getCurrentWeekRange();
    const startDate = start_date ? new Date(start_date) : weekRange.start;
    const endDate = end_date ? new Date(end_date) : weekRange.end;

    const whereClause = {
      appointment_date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    };

    // Filter by status if provided and not 'all'
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Filter by staff if provided
    if (staff) {
      whereClause.staff_assigned = staff;
    }

    // Search by customer name or phone
    if (search) {
      whereClause[Sequelize.Op.or] = [
        { customer_name: { [Sequelize.Op.iLike]: `%${search}%` } },
        { customer_phone: { [Sequelize.Op.iLike]: `%${search}%` } },
      ];
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'User', attributes: ['user_id', 'username_email', 'name'] },
        { model: Service, as: 'Service' },
      ],
      order: [['appointment_date', 'ASC']],
    });

    logAdminAction('VIEW_APPOINTMENTS', req.user.user_id, req.user.username_email, {
      filters: { start_date: startDate, end_date: endDate, status, staff, search },
    });

    res.json(appointments);
  })
);

// POST /api/admin/appointments - Admin creates appointment (with customer_name)
router.post(
  '/appointments',
  isAuthenticated,
  canAccess(['admin']),
  validate(adminSchemas.adminBookAppointment),
  asyncHandler(async (req, res) => {
    const { Appointment, Service, Sequelize } = db;
    const {
      appointment_date,
      gender,
      washing,
      coloring,
      cut,
      notes,
      customer_name,
      customer_phone,
      staff_assigned,
      status = 'confirmed',
    } = req.body;

    const newDate = new Date(appointment_date);

    if (isNaN(newDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid appointment_date.' });
    }

    // Check for conflicts
    const existing = await Appointment.findOne({
      where: {
        appointment_date: newDate,
        status: { [Sequelize.Op.ne]: 'cancelled' },
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ msg: 'This time slot is already booked. Please choose another.' });
    }

    // Validate business hours
    const day = newDate.getDay();
    const hour = newDate.getHours();
    if (!isBusinessOpen(day, hour)) {
      return res.status(400).json({ msg: 'The selected time is outside of business hours.' });
    }

    // Find matching service
    const serviceQuery = {
      gender_target: gender,
      ...(cut && { cutting: true }),
      ...(washing && { washing: true }),
      ...(coloring && { coloring: true }),
    };

    if (!cut && !washing && !coloring) {
      return res
        .status(400)
        .json({ msg: 'You must select at least one service (cut, wash, or color).' });
    }

    const selectedService = await Service.findOne({
      where: serviceQuery,
      order: [
        ['cutting', 'DESC'],
        ['washing', 'DESC'],
        ['coloring', 'DESC'],
      ],
    });

    if (!selectedService) {
      return res.status(404).json({ msg: 'No matching service found for your selected options.' });
    }

    // Use transaction for data consistency
    const transaction = await db.sequelize.transaction();

    try {
      const newAppointment = await Appointment.create(
        {
          user_id: req.user.user_id,
          appointment_date: newDate,
          service_id: selectedService.service_id,
          notes,
          customer_name,
          customer_phone,
          staff_assigned,
          status,
        },
        { transaction }
      );

      await transaction.commit();

      logAdminAction('CREATE_APPOINTMENT', req.user.user_id, req.user.username_email, {
        appointment_id: newAppointment.appointment_id,
        customer_name,
        appointment_date: newDate,
      });

      res
        .status(201)
        .json({ msg: 'Appointment created successfully!', appointment: newAppointment });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  })
);

// PUT /api/admin/appointments/:id - Admin updates appointment
router.put(
  '/appointments/:id',
  isAuthenticated,
  canAccess(['admin']),
  validate(adminSchemas.adminUpdateAppointment),
  asyncHandler(async (req, res) => {
    const { Appointment, Sequelize } = db;
    const appointmentId = req.params.id;
    const updates = req.body;

    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found.' });
    }

    // If updating appointment_date, check for conflicts and business hours
    if (updates.appointment_date) {
      const newDate = new Date(updates.appointment_date);

      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ msg: 'Invalid appointment_date.' });
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
          status: { [Sequelize.Op.ne]: 'cancelled' },
        },
      });

      if (existing) {
        return res
          .status(409)
          .json({ msg: 'This time slot is already booked. Please choose another.' });
      }
    }

    // Use transaction for data consistency
    const transaction = await db.sequelize.transaction();

    try {
      await appointment.update(updates, { transaction });
      await transaction.commit();

      logAdminAction('UPDATE_APPOINTMENT', req.user.user_id, req.user.username_email, {
        appointment_id: appointmentId,
        updates,
      });

      res.json({ msg: 'Appointment updated successfully!', appointment });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  })
);

// POST /api/admin/appointments/bulk - Bulk operations on appointments
router.post(
  '/appointments/bulk',
  isAuthenticated,
  canAccess(['admin']),
  validate(adminSchemas.bulkOperation),
  asyncHandler(async (req, res) => {
    const { Appointment, Sequelize } = db;
    const { appointment_ids, operation, new_date, status } = req.body;

    const transaction = await db.sequelize.transaction();

    try {
      if (operation === 'cancel') {
        await Appointment.update(
          { status: 'cancelled' },
          {
            where: { appointment_id: { [Sequelize.Op.in]: appointment_ids } },
            transaction,
          }
        );

        await transaction.commit();

        logAdminAction('BULK_CANCEL', req.user.user_id, req.user.username_email, {
          appointment_ids,
          count: appointment_ids.length,
        });

        return res.json({
          msg: `${appointment_ids.length} appointment(s) cancelled successfully.`,
        });
      }

      if (operation === 'reschedule') {
        const newDateTime = new Date(new_date);

        if (isNaN(newDateTime.getTime())) {
          await transaction.rollback();
          return res.status(400).json({ msg: 'Invalid new_date.' });
        }

        // For simplicity, we'll reschedule to the same time but different day
        // In a real app, you'd need more sophisticated logic to avoid conflicts
        const results = [];

        for (const id of appointment_ids) {
          const appointment = await Appointment.findByPk(id);
          if (appointment) {
            const originalDate = new Date(appointment.appointment_date);
            const rescheduleDate = new Date(newDateTime);
            rescheduleDate.setHours(originalDate.getHours());
            rescheduleDate.setMinutes(originalDate.getMinutes());

            // Check business hours
            const day = rescheduleDate.getDay();
            const hour = rescheduleDate.getHours();
            if (!isBusinessOpen(day, hour)) {
              results.push({ id, status: 'failed', reason: 'Outside business hours' });
              continue;
            }

            // Check conflicts
            const existing = await Appointment.findOne({
              where: {
                appointment_date: rescheduleDate,
                appointment_id: { [Sequelize.Op.ne]: id },
                status: { [Sequelize.Op.ne]: 'cancelled' },
              },
            });

            if (existing) {
              results.push({ id, status: 'failed', reason: 'Time slot already booked' });
              continue;
            }

            await appointment.update({ appointment_date: rescheduleDate }, { transaction });
            results.push({ id, status: 'success' });
          }
        }

        await transaction.commit();

        logAdminAction('BULK_RESCHEDULE', req.user.user_id, req.user.username_email, {
          appointment_ids,
          new_date,
          results,
        });

        return res.json({ msg: 'Bulk reschedule completed.', results });
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  })
);

// GET /api/admin/appointments/export - Export appointments as CSV
router.get(
  '/appointments/export',
  isAuthenticated,
  canAccess(['admin']),
  asyncHandler(async (req, res) => {
    const { Appointment, User, Service, Sequelize } = db;
    const { start_date, end_date, status } = req.query;

    const weekRange = getCurrentWeekRange();
    const startDate = start_date ? new Date(start_date) : weekRange.start;
    const endDate = end_date ? new Date(end_date) : weekRange.end;

    const whereClause = {
      appointment_date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'User', attributes: ['name', 'username_email'] },
        { model: Service, as: 'Service', attributes: ['service_name'] },
      ],
      order: [['appointment_date', 'ASC']],
    });

    // Generate CSV
    const csvHeader = 'ID,Date,Time,Customer Name,Phone,Service,Status,Staff,Notes,User Email\n';
    const csvRows = appointments
      .map(app => {
        const date = new Date(app.appointment_date);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();

        return [
          app.appointment_id,
          dateStr,
          timeStr,
          app.customer_name || app.User?.name || '',
          app.customer_phone || '',
          app.Service?.service_name || '',
          app.status || 'confirmed',
          app.staff_assigned || '',
          (app.notes || '').replace(/"/g, '""'), // Escape quotes
          app.User?.username_email || '',
        ]
          .map(field => `"${field}"`)
          .join(',');
      })
      .join('\n');

    const csv = csvHeader + csvRows;

    logAdminAction('EXPORT_APPOINTMENTS', req.user.user_id, req.user.username_email, {
      count: appointments.length,
      date_range: { start_date: startDate, end_date: endDate },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=appointments.csv');
    res.send(csv);
  })
);

export default router;
