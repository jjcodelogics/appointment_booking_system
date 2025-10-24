import { z } from 'zod';

// Schema for admin booking appointments (requires customer_name)
const adminBookAppointment = z.object({
  body: z.object({
    appointment_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format for appointment_date',
    }),
    gender: z.enum(['male', 'female', 'unisex']),
    washing: z.boolean().optional(),
    coloring: z.boolean().optional(),
    cut: z.boolean().optional(),
    notes: z.string().optional(),
    customer_name: z.string().min(1, 'Customer name is required for admin bookings'),
    customer_phone: z.string().optional(),
    staff_assigned: z.string().optional(),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']).optional(),
  }),
});

// Schema for updating an appointment (admin)
const adminUpdateAppointment = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
  body: z.object({
    appointment_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format for appointment_date',
    }).optional(),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']).optional(),
    notes: z.string().optional(),
    staff_assigned: z.string().optional(),
    customer_name: z.string().optional(),
    customer_phone: z.string().optional(),
    service_id: z.number().int().positive().optional(),
  }),
});

// Schema for bulk operations
const bulkOperation = z.object({
  body: z.object({
    appointment_ids: z.array(z.number().int().positive()).min(1, 'At least one appointment ID is required'),
    operation: z.enum(['cancel', 'reschedule']),
    new_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format for new_date',
    }).optional(),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']).optional(),
  }).refine((data) => {
    if (data.operation === 'reschedule' && !data.new_date) {
      return false;
    }
    return true;
  }, {
    message: 'new_date is required when operation is reschedule',
  }),
});

// Schema for filtering appointments
const filterAppointments = z.object({
  query: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed', 'all']).optional(),
    staff: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const adminSchemas = {
  adminBookAppointment,
  adminUpdateAppointment,
  bulkOperation,
  filterAppointments,
};
