// middleware/appointment.schemas.js (New file)
import { z } from 'zod';

// Zod schema for a valid future date
export const appointmentDateSchema = z.string().refine(
    (val) => !isNaN(new Date(val).getTime()), 
    { message: "A valid appointment date is required." }
).transform((val) => new Date(val)); // Transform to Date object for consistency

// Zod schema for a valid ID (int >= 1)
const idSchema = z.number().int().min(1, { message: 'A valid ID is required.' });

// Schema for creating a new appointment (POST /appointments)
const CreateAppointmentSchema = z.object({
    appointment_date: appointmentDateSchema,
    gender: z.enum(['male', 'female']),
    washing: z.boolean(),
    coloring: z.boolean(),
    cut: z.boolean(),
    employee_name: z.string().optional(),
    notes: z.string().optional()
});

// Schema for updating an appointment (PUT /appointments/:id)
const UpdateAppointmentSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, { message: 'A valid appointment ID is required.' })
            .transform(val => parseInt(val, 10)), // Convert param string to number
    }),
    body: z.object({
        user_id: idSchema.optional(),
        appointment_date: appointmentDateSchema.optional(),
        service_id: idSchema.optional(),
        employee_id: idSchema.optional(),
        status: z.enum(['scheduled', 'completed', 'canceled']).optional(),
    }).partial().strict().refine(data => Object.keys(data).length > 0, { // Allow partial update but require at least one field
        message: 'Request body must contain at least one field to update.'
    }),
});

// Schema for ID parameters (used for GET/DELETE/:id)
const IdParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, { message: 'A valid appointment ID is required.' })
            .transform(val => parseInt(val, 10)),
    }),
});

export default {
    CreateAppointmentSchema,
    UpdateAppointmentSchema,
    IdParamSchema,
};