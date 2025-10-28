import { z } from 'zod';

// --- Route-Specific Validation Schemas ---

export const userSchemas = {
  // For POST /auth/register
  register: z.object({
    body: z.object({
      username_email: z.string().email({ message: 'A valid email is required.' }),
      name: z.string().min(1, { message: 'Name cannot be empty.' }),
      password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
    }),
  }),

  // For POST /auth/login
  login: z.object({
    body: z.object({
      username_email: z.string().email({ message: 'A valid email is required.' }),
      password: z.string().min(1, { message: 'Password is required.' }),
    }),
  }),
};
