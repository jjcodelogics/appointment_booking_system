// middleware/appointment.schemas.js 
import { z } from 'zod';

// --- Reusable Base Schemas ---

// Base schema for a valid ID in the database (e.g., for request bodies)
const idSchema = z.number().int().min(1, { message: 'A valid ID is required.' });

// Base schema for a valid date string from the client
const appointmentDateSchema = z.string()
    .refine((val) => !isNaN(new Date(val).getTime()), { message: "A valid appointment date is required." })
    .transform((val) => new Date(val)); // Transform to Date object for consistency

// Base schema for a valid ID from URL parameters (which are always strings)
const idParamSchema = z.string()
    .regex(/^\d+$/, { message: 'A valid numeric ID is required in the URL.' })
    .transform(Number);


// --- Route-Specific Validation Schemas ---

export const appointmentsSchemas = {
    // For POST /myappointments/book
    create: z.object({
        body: z.object({
            appointment_date: appointmentDateSchema,
            gender: z.enum(['male', 'female']),
            washing: z.boolean(),
            coloring: z.boolean(),
            cut: z.boolean(),
            notes: z.string().trim().max(255).optional(),
        }),
    }),

    // For PUT /appointments/:id
    update: z.object({
        params: z.object({
            id: idParamSchema,
        }),
        body: z.object({
            user_id: idSchema.optional(),
            appointment_date: appointmentDateSchema.optional(),
            service_id: idSchema.optional(),
        })
        .partial() // Makes all fields optional for partial updates
        .strict()  // Disallows any fields not defined in the schema
        .refine(data => Object.keys(data).length > 0, {
            message: 'Request body must contain at least one field to update.'
        }),
    }),

    // For routes with only an ID param, like GET /:id or DELETE /:id
    byId: z.object({
        params: z.object({
            id: idParamSchema,
        }),
    }),
};